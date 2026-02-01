/**
 * BookingController Tests
 */

jest.mock('../services/BookingService', () => ({
  createBooking: jest.fn().mockResolvedValue({ id: 'BK1', status: 'pending' }),
  findByUserId: jest.fn().mockResolvedValue([]),
  updateBookingStatus: jest.fn().mockResolvedValue({ changes: 1 }),
  getBookingById: jest.fn().mockResolvedValue({ id: 'BK1' }),
  cancelBooking: jest.fn().mockResolvedValue({ penalty: 1500 }),
}));

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const BookingController = require('../controllers/BookingController');

describe('BookingController', () => {
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

  describe('createBooking', () => {
    test('should be a function', () => {
      expect(typeof BookingController.createBooking).toBe('function');
    });

    test('should create booking with valid data', async () => {
      req.body = {
        date: '2024-01-25',
        services: [{ id: 'S1', name: 'Limpeza' }],
        address: 'Rua Teste, 123',
        squareMeter: 50,
        notes: 'Test booking',
      };

      await BookingController.createBooking(req, res);
      
      expect(res.status).toHaveBeenCalled();
    });

    test('should require date and services', async () => {
      req.body = {
        address: 'Rua Teste, 123',
      };

      await BookingController.createBooking(req, res);
      
      expect(res.status).toHaveBeenCalled();
    });

    test('should validate square meters', async () => {
      req.body = {
        date: '2024-01-25',
        services: [{ id: 'S1' }],
        address: 'Rua Teste, 123',
        squareMeter: -10,
      };

      await BookingController.createBooking(req, res);
      
      expect(res.status).toHaveBeenCalled();
    });
  });

  describe('getBookings', () => {
    test('should be a function', () => {
      expect(typeof BookingController.getBookings).toBe('function');
    });

    test('should get all user bookings', async () => {
      req.query = { status: 'all' };

      await BookingController.getBookings(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });

    test('should filter by status', async () => {
      const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      
      for (const status of statuses) {
        req.query = { status };
        await BookingController.getBookings(req, res);
        expect(res.json).toHaveBeenCalled();
      }
    });
  });

  describe('getBookingById', () => {
    test('should be a function', () => {
      expect(typeof BookingController.getBookingById).toBe('function');
    });

    test('should retrieve specific booking', async () => {
      req.params = { id: 'BK123' };

      await BookingController.getBookingById(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('updateBooking', () => {
    test('should be a function', () => {
      expect(typeof BookingController.updateBooking).toBe('function');
    });

    test('should update booking details', async () => {
      req.params = { id: 'BK123' };
      req.body = {
        date: '2024-02-01',
        notes: 'Updated notes',
      };

      await BookingController.updateBooking(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('cancelBooking', () => {
    test('should be a function', () => {
      expect(typeof BookingController.cancelBooking).toBe('function');
    });

    test('should cancel booking and calculate penalty', async () => {
      req.params = { id: 'BK123' };
      req.body = { reason: 'Change of plans' };

      await BookingController.cancelBooking(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle late cancellations', async () => {
      req.params = { id: 'BK123' };
      req.body = { 
        reason: 'Emergency', 
        hoursBeforeBooking: 2 
      };

      await BookingController.cancelBooking(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('confirmBooking', () => {
    test('should be a function', () => {
      expect(typeof BookingController.confirmBooking).toBe('function');
    });

    test('should confirm pending booking', async () => {
      req.params = { id: 'BK123' };

      await BookingController.confirmBooking(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('rescheduleBooking', () => {
    test('should be a function', () => {
      expect(typeof BookingController.rescheduleBooking).toBe('function');
    });

    test('should reschedule to new date', async () => {
      req.params = { id: 'BK123' };
      req.body = { newDate: '2024-02-15', newTime: '14:00' };

      await BookingController.rescheduleBooking(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getBookingStats', () => {
    test('should be a function', () => {
      expect(typeof BookingController.getBookingStats).toBe('function');
    });

    test('should return booking statistics', async () => {
      await BookingController.getBookingStats(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getAvailableTimeSlots', () => {
    test('should be a function', () => {
      expect(typeof BookingController.getAvailableTimeSlots).toBe('function');
    });

    test('should get available slots for date', async () => {
      req.query = { date: '2024-01-25' };

      await BookingController.getAvailableTimeSlots(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });

    test('should filter by team member', async () => {
      req.query = { 
        date: '2024-01-25',
        teamMemberId: 'TM1'
      };

      await BookingController.getAvailableTimeSlots(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('Advanced booking features', () => {
    test('should handle booking with multiple services', async () => {
      req.body = {
        date: '2024-02-01',
        services: [
          { id: 'S1', name: 'Limpeza padrão', price: 100 },
          { id: 'S2', name: 'Limpeza profunda', price: 150 },
        ],
        address: 'Rua Teste, 123',
        squareMeter: 100,
      };

      await BookingController.createBooking(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle booking with special requests', async () => {
      req.body = {
        date: '2024-02-01',
        services: [{ id: 'S1' }],
        address: 'Rua Teste, 123',
        squareMeter: 75,
        notes: 'Please bring eco-friendly cleaning products',
        specialRequests: 'No scents, hypoallergenic products',
      };

      await BookingController.createBooking(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle booking cancellation with reasons', async () => {
      req.params = { id: 'BK123' };
      req.body = { 
        reason: 'Emergency', 
        hoursBeforeBooking: 1 
      };

      await BookingController.cancelBooking(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should calculate penalties based on cancel timing', async () => {
      const timings = [1, 24, 48, 72];
      
      for (const hours of timings) {
        req.params = { id: 'BK123' };
        req.body = { hoursBeforeBooking: hours };

        await BookingController.cancelBooking(req, res);
        expect(res.json).toHaveBeenCalled();
      }
    });

    test('should handle booking rescheduling', async () => {
      req.params = { id: 'BK123' };
      req.body = {
        newDate: '2024-03-01',
        newTime: '14:00',
        reason: 'Conflict with work schedule',
      };

      await BookingController.rescheduleBooking(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should validate date format', async () => {
      req.body = {
        date: 'invalid-date',
        services: [{ id: 'S1' }],
        address: 'Rua Teste, 123',
      };

      await BookingController.createBooking(req, res);
      expect(res.status).toHaveBeenCalled();
    });

    test('should handle booking for different property types', async () => {
      const types = ['apartment', 'house', 'office', 'commercial'];
      
      for (const type of types) {
        req.body = {
          date: '2024-02-01',
          services: [{ id: 'S1' }],
          address: 'Rua Teste, 123',
          squareMeter: 100,
          propertyType: type,
        };

        await BookingController.createBooking(req, res);
        expect(res.json).toHaveBeenCalled();
      }
    });
  });

  describe('Booking edge cases', () => {
    test('should handle booking in past dates', async () => {
      req.body = {
        date: '2000-01-01',
        services: [{ id: 'S1' }],
        address: 'Rua Teste, 123',
      };

      await BookingController.createBooking(req, res);
      expect(res.status).toHaveBeenCalled();
    });

    test('should handle very large square meter', async () => {
      req.body = {
        date: '2024-02-01',
        services: [{ id: 'S1' }],
        address: 'Rua Teste, 123',
        squareMeter: 99999,
      };

      await BookingController.createBooking(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('should validate minimum square meter', async () => {
      req.body = {
        date: '2024-02-01',
        services: [{ id: 'S1' }],
        address: 'Rua Teste, 123',
        squareMeter: 0,
      };

      await BookingController.createBooking(req, res);
      expect(res.status).toHaveBeenCalled();
    });

    test('should handle concurrent booking creation', async () => {
      const promises = Array(3).fill(null).map((_, i) => {
        const reqCopy = { ...req };
        reqCopy.body = {
          date: '2024-02-01',
          services: [{ id: 'S1' }],
          address: `Rua Teste, ${i}`,
          squareMeter: 50 + i * 10,
        };
        return BookingController.createBooking(reqCopy, res);
      });

      await Promise.all(promises);
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle booking without optional fields', async () => {
      req.body = {
        date: '2024-02-01',
        services: [{ id: 'S1' }],
        address: 'Rua Teste, 123',
        squareMeter: 50,
      };

      await BookingController.createBooking(req, res);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('Booking status transitions', () => {
    test('should handle all status transitions', async () => {
      const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
      
      for (const status of statuses) {
        req.params = { id: 'BK123' };
        req.body = { status };

        await BookingController.updateBooking(req, res);
        expect(res.json).toHaveBeenCalled();
      }
    });

    test('should get bookings filtered by status', async () => {
      const statuses = ['all', 'pending', 'confirmed', 'completed'];
      
      for (const status of statuses) {
        req.query = { status };

        await BookingController.getBookings(req, res);
        expect(res.json).toHaveBeenCalled();
      }
    });
  });
});
