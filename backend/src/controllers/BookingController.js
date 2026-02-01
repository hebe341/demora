/**
 * Booking Controller
 * Gerencia todas as operações relacionadas a agendamentos
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { calculateBookingPrice, calculateLoyaltyBonus } = require('../utils/priceCalculator');

const DB_PATH = path.join(__dirname, '../../backend_data/limpeza.db');

// Auxiliar para executar queries
const getDb = () => new sqlite3.Database(DB_PATH);
const runAsync = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const getAsync = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const allAsync = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

class BookingController {
  /**
   * Criar novo agendamento (com novo sistema de preços)
   */
  async createBooking(req, res) {
    const db = getDb();
    try {
      const {
        userId,
        serviceId,
        date,
        time,
        address,
        phone,
        durationHours = 2,
        hasStaff = true,
        isPostWork = false,
        hasExtraQuarter = false,
        notes = ''
      } = req.body;

      if (!userId || !serviceId || !date || !time || !address || !phone) {
        return res.status(400).json({
          error: 'Campos obrigatórios faltando'
        });
      }

      // Buscar serviço para obter dados de preço
      const service = await getAsync(db, 'SELECT * FROM services WHERE id = ?', [serviceId]);
      if (!service) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      // Buscar usuário para validar bônus
      const user = await getAsync(db, 'SELECT * FROM users WHERE id = ?', [userId]);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Preparar dados do agendamento
      const booking = {
        user_id: userId,
        service_id: serviceId,
        date,
        time,
        duration_hours: durationHours,
        address,
        phone,
        is_post_work: isPostWork ? 1 : 0,
        has_extra_quarter: hasExtraQuarter ? 1 : 0,
        has_staff: hasStaff ? 1 : 0,
        notes,
        status: 'pending'
      };

      // CALCULAR PREÇO
      const priceCalc = calculateBookingPrice(booking, service);

      booking.base_price = priceCalc.basePrice;
      booking.extra_quarter_hours = priceCalc.extraQuarter;
      booking.staff_fee = priceCalc.staffFee;
      booking.post_work_adjustment = priceCalc.postWorkAdjustment;
      booking.final_price = priceCalc.finalPrice;

      // Aplicar bônus de fidelidade se disponível
      if (user.loyalty_bonus && user.loyalty_bonus > 0 && !user.bonus_redeemed) {
        booking.final_price = Math.max(0, booking.final_price - user.loyalty_bonus);

        // Marcar bônus como utilizado
        await runAsync(db,
          'UPDATE users SET bonus_redeemed = 1, loyalty_bonus = 0 WHERE id = ?',
          [userId]
        );
      }

      // Inserir no banco
      const result = await runAsync(db,
        `INSERT INTO bookings (
          user_id, service_id, date, time, duration_hours,
          address, phone, base_price, extra_quarter_hours,
          staff_fee, post_work_adjustment, final_price,
          is_post_work, has_extra_quarter, has_staff, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, serviceId, date, time, durationHours,
         address, phone, booking.base_price, booking.extra_quarter_hours,
         booking.staff_fee, booking.post_work_adjustment, booking.final_price,
         booking.is_post_work, booking.has_extra_quarter, hasStaff ? 1 : 0, 'pending', notes]
      );

      const bookingId = result.lastID;
      const newBooking = await getAsync(db, 'SELECT * FROM bookings WHERE id = ?', [bookingId]);

      db.close();
      res.status(201).json({
        success: true,
        booking: newBooking,
        priceBreakdown: priceCalc,
        message: 'Agendamento criado com sucesso!'
      });

    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      db.close();
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter agendamentos do usuário
   */
  async getUserBookings(req, res) {
    const db = getDb();
    try {
      const { userId } = req.params;

      const bookings = await allAsync(db,
        `SELECT b.*, s.name as service_name, s.price as service_price
         FROM bookings b
         LEFT JOIN services s ON b.service_id = s.id
         WHERE b.user_id = ?
         ORDER BY b.date DESC`,
        [userId]
      );

      db.close();
      res.json({ success: true, bookings });
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      db.close();
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Avaliar agendamento concluído e processar bônus de fidelidade
   */
  async rateBooking(req, res) {
    const db = getDb();
    try {
      const { bookingId } = req.params;
      const { rating, review } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        db.close();
        return res.status(400).json({
          error: 'Avaliação deve ser entre 1 e 5'
        });
      }

      // Atualizar agendamento com avaliação
      await runAsync(db,
        `UPDATE bookings SET rating = ?, review = ? WHERE id = ?`,
        [rating, review || '', bookingId]
      );

      // Se foi 5 estrelas, atualizar streak de fidelidade
      if (rating === 5) {
        const booking = await getAsync(db, 'SELECT user_id FROM bookings WHERE id = ?', [bookingId]);
        const user = await getAsync(db, 'SELECT * FROM users WHERE id = ?', [booking.user_id]);

        // Incrementar streak
        let newStreak = (user.five_star_streak || 0) + 1;
        let loyaltyBonus = 0;
        let bonusReached = false;

        // Verificar se atingiu 10 avaliações 5⭐
        if (newStreak >= 10 && !user.bonus_redeemed) {
          loyaltyBonus = 100.00;
          bonusReached = true;
        }

        // Atualizar usuário
        await runAsync(db,
          `UPDATE users SET
            five_star_streak = ?,
            total_five_stars = total_five_stars + 1,
            loyalty_bonus = ?
           WHERE id = ?`,
          [newStreak, loyaltyBonus, booking.user_id]
        );

        db.close();
        return res.json({
          success: true,
          message: bonusReached 
            ? '🎉 Parabéns! Você atingiu 10 avaliações 5⭐ e ganhou R$ 100 de desconto!'
            : `✅ Avaliação registrada! ${newStreak}/10 para ganhar bônus de R$ 100`,
          loyaltyStatus: {
            streak: newStreak,
            totalFiveStars: user.total_five_stars + 1,
            bonusReached,
            bonusAmount: loyaltyBonus
          }
        });
      }

      db.close();
      res.json({
        success: true,
        message: 'Avaliação registrada com sucesso!'
      });

    } catch (error) {
      console.error('Erro ao avaliar agendamento:', error);
      db.close();
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Atualizar status do agendamento
   */
  async updateBooking(req, res) {
    const db = getDb();
    try {
      const { bookingId } = req.params;
      const { status, date, notes } = req.body;

      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (status && !validStatuses.includes(status)) {
        db.close();
        return res.status(400).json({
          error: 'Status inválido'
        });
      }

      let query = 'UPDATE bookings SET ';
      let params = [];

      if (status) {
        query += 'status = ?, ';
        params.push(status);
      }

      if (date) {
        query += 'date = ?, ';
        params.push(date);
      }

      if (notes) {
        query += 'notes = ?, ';
        params.push(notes);
      }

      query += 'updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      params.push(bookingId);

      await runAsync(db, query, params);

      const booking = await getAsync(db, 'SELECT * FROM bookings WHERE id = ?', [bookingId]);

      db.close();
      res.json({
        success: true,
        booking,
        message: 'Agendamento atualizado com sucesso!'
      });

    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      db.close();
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Cancelar agendamento
   */
  async cancelBooking(req, res) {
    const db = getDb();
    try {
      const { bookingId } = req.params;
      const { reason } = req.body;

      const notes = reason ? ` | Motivo do cancelamento: ${reason}` : '';
      await runAsync(db,
        `UPDATE bookings SET status = 'cancelled', notes = notes || ? WHERE id = ?`,
        [notes, bookingId]
      );

      const booking = await getAsync(db, 'SELECT * FROM bookings WHERE id = ?', [bookingId]);

      db.close();
      res.json({
        success: true,
        booking,
        message: 'Agendamento cancelado com sucesso!'
      });

    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      db.close();
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter bônus de fidelidade do usuário
   */
  async getLoyaltyStatus(req, res) {
    const db = getDb();
    try {
      const { userId } = req.params;

      const user = await getAsync(db,
        'SELECT five_star_streak, total_five_stars, loyalty_bonus, bonus_redeemed FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        db.close();
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const loyaltyCalc = calculateLoyaltyBonus(user);

      db.close();
      res.json({
        success: true,
        loyalty: {
          fiveStarStreak: user.five_star_streak || 0,
          totalFiveStars: user.total_five_stars || 0,
          bonusAvailable: user.loyalty_bonus || 0,
          bonusRedeemed: user.bonus_redeemed || 0,
          ...loyaltyCalc
        }
      });

    } catch (error) {
      console.error('Erro ao buscar status de fidelidade:', error);
      db.close();
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Criar agendamento recorrente
   */
  async createRecurringBooking(req, res) {
    const db = getDb();
    try {
      const { userId } = req.user;
      const { serviceId, frequency, dayOfWeek, time, address, phone } = req.body;

      const validFrequencies = ['weekly', 'biweekly', 'monthly'];
      if (!validFrequencies.includes(frequency)) {
        db.close();
        return res.status(400).json({
          error: 'Frequência inválida'
        });
      }

      const result = await runAsync(db,
        `INSERT INTO recurring_bookings (user_id, service_id, frequency, day_of_week, time, address, phone)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, serviceId, frequency, dayOfWeek, time, address, phone]
      );

      const recurringId = result.lastID;
      const recurring = await getAsync(db, 'SELECT * FROM recurring_bookings WHERE id = ?', [recurringId]);

      db.close();
      res.status(201).json({
        success: true,
        recurring,
        message: 'Agendamento recorrente criado com sucesso!'
      });

    } catch (error) {
      console.error('Erro ao criar agendamento recorrente:', error);
      db.close();
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new BookingController();
