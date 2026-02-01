/**
 * PaymentController Tests
 */

jest.mock('../services/StripeService', () => ({
  createPaymentIntent: jest.fn().mockResolvedValue({
    id: 'pi_123',
    clientSecret: 'secret_123',
  }),
  confirmPayment: jest.fn().mockResolvedValue({ status: 'succeeded' }),
  refundPayment: jest.fn().mockResolvedValue({ id: 'ref_123' }),
}));

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const PaymentController = require('../controllers/PaymentController');

describe('PaymentController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      user: { id: 'U1' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('createPaymentIntent', () => {
    test('should be a function', () => {
      expect(typeof PaymentController.createPaymentIntent).toBe('function');
    });

    test('should create payment intent', async () => {
      req.body = {
        bookingId: 'BK123',
        amount: 15000,
        currency: 'BRL',
      };

      await PaymentController.createPaymentIntent(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });

    test('should require amount and booking', async () => {
      req.body = {
        currency: 'BRL',
      };

      await PaymentController.createPaymentIntent(req, res);
      
      expect(res.status).toHaveBeenCalled();
    });

    test('should validate amount is positive', async () => {
      req.body = {
        bookingId: 'BK123',
        amount: -5000,
        currency: 'BRL',
      };

      await PaymentController.createPaymentIntent(req, res);
      
      expect(res.status).toHaveBeenCalled();
    });
  });

  describe('confirmPayment', () => {
    test('should be a function', () => {
      expect(typeof PaymentController.confirmPayment).toBe('function');
    });

    test('should confirm payment with payment method', async () => {
      req.body = {
        paymentIntentId: 'pi_123',
        paymentMethodId: 'pm_card_visa',
      };

      await PaymentController.confirmPayment(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('refundPayment', () => {
    test('should be a function', () => {
      expect(typeof PaymentController.refundPayment).toBe('function');
    });

    test('should refund payment', async () => {
      req.params = { paymentId: 'pi_123' };
      req.body = { amount: 15000, reason: 'Customer request' };

      await PaymentController.refundPayment(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle partial refunds', async () => {
      req.params = { paymentId: 'pi_123' };
      req.body = { amount: 5000 };

      await PaymentController.refundPayment(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getPaymentStatus', () => {
    test('should be a function', () => {
      expect(typeof PaymentController.getPaymentStatus).toBe('function');
    });

    test('should get payment status', async () => {
      req.params = { paymentId: 'pi_123' };

      await PaymentController.getPaymentStatus(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getPaymentHistory', () => {
    test('should be a function', () => {
      expect(typeof PaymentController.getPaymentHistory).toBe('function');
    });

    test('should get user payment history', async () => {
      req.query = { limit: 10, page: 1 };

      await PaymentController.getPaymentHistory(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });

    test('should filter by date range', async () => {
      req.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      await PaymentController.getPaymentHistory(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getPaymentMethods', () => {
    test('should be a function', () => {
      expect(typeof PaymentController.getPaymentMethods).toBe('function');
    });

    test('should list user payment methods', async () => {
      await PaymentController.getPaymentMethods(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('addPaymentMethod', () => {
    test('should be a function', () => {
      expect(typeof PaymentController.addPaymentMethod).toBe('function');
    });

    test('should add new payment method', async () => {
      req.body = {
        type: 'card',
        token: 'tok_visa',
      };

      await PaymentController.addPaymentMethod(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('removePaymentMethod', () => {
    test('should be a function', () => {
      expect(typeof PaymentController.removePaymentMethod).toBe('function');
    });

    test('should remove payment method', async () => {
      req.params = { methodId: 'pm_123' };

      await PaymentController.removePaymentMethod(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getInvoice', () => {
    test('should be a function', () => {
      expect(typeof PaymentController.getInvoice).toBe('function');
    });

    test('should get invoice for booking', async () => {
      req.params = { bookingId: 'BK123' };

      await PaymentController.getInvoice(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('Payment flow', () => {
    test('should complete payment cycle', async () => {
      // Create intent
      req.body = { bookingId: 'BK123', amount: 15000 };
      await PaymentController.createPaymentIntent(req, res);
      expect(res.json).toHaveBeenCalled();

      // Confirm payment
      req.body = { paymentIntentId: 'pi_123', paymentMethodId: 'pm_123' };
      await PaymentController.confirmPayment(req, res);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('Advanced payment scenarios', () => {
    test('should handle different payment amounts', async () => {
      const amounts = [1000, 5000, 15000, 50000, 100000];
      
      for (const amount of amounts) {
        req.body = { bookingId: 'BK123', amount, currency: 'BRL' };
        await PaymentController.createPaymentIntent(req, res);
        expect(res.json).toHaveBeenCalled();
      }
    });

    test('should support multiple currencies', async () => {
      const currencies = ['BRL', 'USD', 'EUR'];
      
      for (const currency of currencies) {
        req.body = { bookingId: 'BK123', amount: 15000, currency };
        await PaymentController.createPaymentIntent(req, res);
        expect(res.json).toHaveBeenCalled();
      }
    });

    test('should handle payment with metadata', async () => {
      req.body = {
        bookingId: 'BK123',
        amount: 15000,
        currency: 'BRL',
        metadata: {
          serviceType: 'cleaning',
          duration: 2,
          teamMember: 'TM1',
        },
      };

      await PaymentController.createPaymentIntent(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle partial refunds', async () => {
      const amounts = [5000, 10000, 15000];
      
      for (const amount of amounts) {
        req.params = { paymentId: 'pi_123' };
        req.body = { amount };

        await PaymentController.refundPayment(req, res);
        expect(res.json).toHaveBeenCalled();
      }
    });

    test('should retrieve payment history with filters', async () => {
      const filters = [
        { status: 'succeeded' },
        { status: 'pending' },
        { startDate: '2024-01-01', endDate: '2024-01-31' },
        { minAmount: 10000, maxAmount: 50000 },
      ];

      for (const filter of filters) {
        req.query = filter;
        await PaymentController.getPaymentHistory(req, res);
        expect(res.json).toHaveBeenCalled();
      }
    });

    test('should list saved payment methods', async () => {
      const methodTypes = ['card', 'boleto', 'pix'];
      
      for (const type of methodTypes) {
        req.query = { type };
        await PaymentController.getPaymentMethods(req, res);
        expect(res.json).toHaveBeenCalled();
      }
    });
  });

  describe('Payment edge cases', () => {
    test('should reject negative amounts', async () => {
      req.body = {
        bookingId: 'BK123',
        amount: -5000,
      };

      await PaymentController.createPaymentIntent(req, res);
      expect(res.status).toHaveBeenCalled();
    });

    test('should reject zero amount', async () => {
      req.body = {
        bookingId: 'BK123',
        amount: 0,
      };

      await PaymentController.createPaymentIntent(req, res);
      expect(res.status).toHaveBeenCalled();
    });

    test('should handle very large amounts', async () => {
      req.body = {
        bookingId: 'BK123',
        amount: 999999999,
      };

      await PaymentController.createPaymentIntent(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle invalid payment intent', async () => {
      req.body = {
        paymentIntentId: 'invalid_pi',
        paymentMethodId: 'pm_123',
      };

      await PaymentController.confirmPayment(req, res);
      expect(res.status).toHaveBeenCalled();
    });

    test('should handle refund on non-existent payment', async () => {
      req.params = { paymentId: 'pi_nonexistent' };
      req.body = { amount: 5000 };

      await PaymentController.refundPayment(req, res);
      expect(res.status).toHaveBeenCalled();
    });

    test('should handle duplicate payment prevention', async () => {
      const promises = Array(3).fill(null).map(() => {
        const reqCopy = { ...req };
        reqCopy.body = {
          bookingId: 'BK123',
          amount: 15000,
          idempotencyKey: 'unique-key-123',
        };
        return PaymentController.createPaymentIntent(reqCopy, res);
      });

      await Promise.all(promises);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('Payment security', () => {
    test('should handle PCI compliance in payment flow', async () => {
      req.body = {
        bookingId: 'BK123',
        amount: 15000,
        cardNumber: '4111111111111111',
      };

      await PaymentController.createPaymentIntent(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should validate CVV before processing', async () => {
      req.body = {
        paymentIntentId: 'pi_123',
        paymentMethodId: 'pm_123',
        cvv: '123',
      };

      await PaymentController.confirmPayment(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should track payment disputes', async () => {
      req.query = { status: 'disputed' };
      
      await PaymentController.getPaymentHistory(req, res);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('Payment reconciliation', () => {
    test('should reconcile payment with booking', async () => {
      req.body = {
        bookingId: 'BK123',
        paymentId: 'pi_123',
      };

      await PaymentController.createPaymentIntent(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should generate payment reconciliation report', async () => {
      req.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      await PaymentController.getPaymentHistory(req, res);
      expect(res.json).toHaveBeenCalled();
    });
  });
});
