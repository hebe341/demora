const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const CouponService = require('../services/CouponService');

const router = express.Router();

// Listar cupons ativos
router.get('/', async (req, res) => {
  try {
    const coupons = await CouponService.getActiveCoupons();
    res.json({ success: true, coupons });
  } catch (error) {
    console.error('Erro ao listar cupons:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Validar cupom
router.post('/validate', async (req, res) => {
  try {
    const { code, bookingTotal } = req.body;

    if (!code || !bookingTotal) {
      return res.status(400).json({ success: false, error: 'Código e total são obrigatórios' });
    }

    const result = await CouponService.applyCoupon(code, parseFloat(bookingTotal));
    res.json({ success: true, result });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Usar cupom
router.post('/use', authenticateToken, async (req, res) => {
  try {
    const { couponId, bookingId } = req.body;

    const result = await CouponService.useCoupon(couponId, bookingId);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao usar cupom:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Criar cupom (admin only)
router.post('/create', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { code, discountPercent, maxUses, expiresAt } = req.body;

    if (!code || !discountPercent) {
      return res.status(400).json({ success: false, error: 'Código e desconto são obrigatórios' });
    }

    const coupon = await CouponService.createCoupon(code, discountPercent, maxUses, expiresAt);
    res.json({ success: true, coupon });
  } catch (error) {
    console.error('Erro ao criar cupom:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Estatísticas de cupons
router.get('/stats', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const stats = await CouponService.getCouponStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
