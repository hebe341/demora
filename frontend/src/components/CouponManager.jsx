import React, { useState } from 'react';
import axios from 'axios';
import './CouponManager.css';

const CouponManager = ({ bookingTotal, token, onDiscountApply }) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      setMessage('❌ Digite um código');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/api/coupons/validate', {
        code: couponCode,
        bookingTotal
      });

      if (res.data.success) {
        setAppliedCoupon(res.data.result);
        setMessage(`✅ Cupom aplicado! Desconto: R$ ${res.data.result.discount_amount}`);
        onDiscountApply?.(res.data.result.discount_amount);
      }
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.error || 'Cupom inválido'}`);
      setAppliedCoupon(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setMessage('');
    onDiscountApply?.(0);
  };

  return (
    <div className="coupon-manager">
      <h3>🎟️ Código de Desconto</h3>

      {message && (
        <div className={`coupon-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {!appliedCoupon ? (
        <form onSubmit={handleApplyCoupon} className="coupon-form">
          <input
            type="text"
            placeholder="Cole o código aqui..."
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            disabled={loading}
            className="coupon-input"
          />
          <button type="submit" disabled={loading} className="coupon-btn">
            {loading ? 'Validando...' : 'Aplicar'}
          </button>
        </form>
      ) : (
        <div className="coupon-applied">
          <div className="coupon-details">
            <span className="coupon-code">{couponCode}</span>
            <span className="coupon-discount">
              -{appliedCoupon.discount_percent}%
            </span>
            <span className="coupon-savings">
              Economiza: R$ {appliedCoupon.discount_amount}
            </span>
          </div>
          <button onClick={handleRemoveCoupon} className="remove-coupon">
            Remover
          </button>
        </div>
      )}

      <div className="original-price">
        <span>Preço original:</span>
        <span>R$ {bookingTotal.toFixed(2)}</span>
      </div>

      {appliedCoupon && (
        <div className="final-price">
          <span>Preço final:</span>
          <span className="final-value">
            R$ {parseFloat(appliedCoupon.final_price).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

export default CouponManager;
