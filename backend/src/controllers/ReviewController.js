/**
 * Review Controller
 * Gerencia avaliações e depoimentos
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../backend_data/limpeza.db');

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

class ReviewController {
  /**
   * Criar nova avaliação
   */
  async createReview(req, res) {
    const db = getDb();
    try {
      const { bookingId, userId, rating, comment } = req.body;

      // Validar dados
      if (!bookingId || !rating || rating < 1 || rating > 5) {
        db.close();
        return res.status(400).json({ error: 'Dados de avaliação inválidos' });
      }

      // Salvar avaliação no banco
      const result = await runAsync(db,
        `INSERT INTO reviews (booking_id, user_id, rating, comment, is_approved)
         VALUES (?, ?, ?, ?, 1)`,
        [bookingId, userId, rating, comment || '']
      );

      const reviewId = result.lastID;
      const review = await getAsync(db, 'SELECT * FROM reviews WHERE id = ?', [reviewId]);

      db.close();
      res.status(201).json({ 
        success: true, 
        message: 'Avaliação registrada com sucesso!', 
        review 
      });
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      db.close();
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter avaliações públicas
   */
  async getPublicReviews(req, res) {
    const db = getDb();
    try {
      const { page = 1, limit = 10, sort = 'recent' } = req.query;
      const offset = (page - 1) * limit;

      let orderClause = 'ORDER BY r.created_at DESC';
      if (sort === 'highest') {
        orderClause = 'ORDER BY r.rating DESC, r.created_at DESC';
      } else if (sort === 'lowest') {
        orderClause = 'ORDER BY r.rating ASC, r.created_at DESC';
      }

      const reviews = await allAsync(db,
        `SELECT r.*, u.name as user_name, b.service_id 
         FROM reviews r
         LEFT JOIN users u ON r.user_id = u.id
         LEFT JOIN bookings b ON r.booking_id = b.id
         WHERE r.is_approved = 1
         ${orderClause}
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      const countResult = await getAsync(db,
        'SELECT COUNT(*) as total FROM reviews WHERE is_approved = 1'
      );

      db.close();
      res.json({ 
        success: true, 
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total
        }
      });
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      db.close();
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter estatísticas de classificação
   */
  async getRatingStats(req, res) {
    const db = getDb();
    try {
      // Média geral
      const avgResult = await getAsync(db,
        'SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews FROM reviews WHERE is_approved = 1'
      );

      // Distribuição por rating
      const breakdown = await allAsync(db,
        `SELECT rating, COUNT(*) as count FROM reviews WHERE is_approved = 1
         GROUP BY rating ORDER BY rating DESC`
      );

      // Converter para formato esperado
      const stats = {
        averageRating: parseFloat(avgResult.average_rating || 0).toFixed(1),
        totalReviews: avgResult.total_reviews,
        breakdown: {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        }
      };

      breakdown.forEach(item => {
        stats.breakdown[item.rating] = item.count;
      });

      db.close();
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      db.close();
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Responder a avaliação (admin)
   */
  async respondToReview(req, res) {
    const db = getDb();
    try {
      const { reviewId } = req.params;
      const { response } = req.body;

      await runAsync(db,
        'UPDATE reviews SET admin_response = ? WHERE id = ?',
        [response, reviewId]
      );

      const review = await getAsync(db, 'SELECT * FROM reviews WHERE id = ?', [reviewId]);

      db.close();
      res.json({ success: true, message: 'Resposta enviada', review });
    } catch (error) {
      console.error('Erro ao responder avaliação:', error);
      db.close();
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ReviewController();
