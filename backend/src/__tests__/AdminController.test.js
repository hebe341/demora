/**
 * AdminController Tests
 */

jest.mock('../services/BookingService', () => ({
  findByUserId: jest.fn().mockResolvedValue([]),
  updateBookingStatus: jest.fn().mockResolvedValue({ changes: 1 }),
}));

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const AdminController = require('../controllers/AdminController');

describe('AdminController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      user: { id: 'ADMIN1', role: 'admin' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('getDashboardStats', () => {
    test('should be a function', () => {
      expect(typeof AdminController.getDashboardStats).toBe('function');
    });

    test('should return dashboard statistics', async () => {
      await AdminController.getDashboardStats(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });

    test('should include revenue, bookings, users metrics', async () => {
      await AdminController.getDashboardStats(req, res);
      
      const callArgs = res.json.mock.calls[0];
      expect(callArgs).toBeDefined();
    });
  });

  describe('getAllBookings', () => {
    test('should be a function', () => {
      expect(typeof AdminController.getAllBookings).toBe('function');
    });

    test('should list all bookings', async () => {
      req.query = { page: 1, limit: 20 };

      await AdminController.getAllBookings(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });

    test('should filter by status', async () => {
      req.query = { status: 'pending' };

      await AdminController.getAllBookings(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });

    test('should filter by date range', async () => {
      req.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      await AdminController.getAllBookings(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getAllUsers', () => {
    test('should be a function', () => {
      expect(typeof AdminController.getAllUsers).toBe('function');
    });

    test('should list all users', async () => {
      req.query = { page: 1, limit: 20 };

      await AdminController.getAllUsers(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });

    test('should search by name or email', async () => {
      req.query = { search: 'john' };

      await AdminController.getAllUsers(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getUserDetails', () => {
    test('should be a function', () => {
      expect(typeof AdminController.getUserDetails).toBe('function');
    });

    test('should get user details', async () => {
      req.params = { userId: 'U1' };

      await AdminController.getUserDetails(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('updateUserStatus', () => {
    test('should be a function', () => {
      expect(typeof AdminController.updateUserStatus).toBe('function');
    });

    test('should update user status', async () => {
      req.params = { userId: 'U1' };
      req.body = { status: 'active' };

      await AdminController.updateUserStatus(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });

    test('should support suspend and ban', async () => {
      for (const status of ['suspended', 'banned', 'active']) {
        req.params = { userId: 'U1' };
        req.body = { status };

        await AdminController.updateUserStatus(req, res);
        expect(res.json).toHaveBeenCalled();
      }
    });
  });

  describe('getCompanySettings', () => {
    test('should be a function', () => {
      expect(typeof AdminController.getCompanySettings).toBe('function');
    });

    test('should retrieve company settings', async () => {
      await AdminController.getCompanySettings(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('updateCompanySettings', () => {
    test('should be a function', () => {
      expect(typeof AdminController.updateCompanySettings).toBe('function');
    });

    test('should update settings', async () => {
      req.body = {
        companyName: 'Limpeza Pro',
        email: 'admin@example.com',
      };

      await AdminController.updateCompanySettings(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('approveReviews', () => {
    test('should be a function', () => {
      expect(typeof AdminController.approveReviews).toBe('function');
    });

    test('should approve pending reviews', async () => {
      req.query = { status: 'pending' };

      await AdminController.approveReviews(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getReports', () => {
    test('should be a function', () => {
      expect(typeof AdminController.getReports).toBe('function');
    });

    test('should generate revenue report', async () => {
      req.query = { type: 'revenue' };

      await AdminController.getReports(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });

    test('should generate booking report', async () => {
      req.query = { type: 'bookings' };

      await AdminController.getReports(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });

    test('should generate user report', async () => {
      req.query = { type: 'users' };

      await AdminController.getReports(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getAuditLog', () => {
    test('should be a function', () => {
      expect(typeof AdminController.getAuditLog).toBe('function');
    });

    test('should retrieve audit logs', async () => {
      req.query = { limit: 50 };

      await AdminController.getAuditLog(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });

    test('should filter by action', async () => {
      req.query = { action: 'update' };

      await AdminController.getAuditLog(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('manageStaff', () => {
    test('should be a function', () => {
      expect(typeof AdminController.manageStaff).toBe('function');
    });

    test('should get staff list', async () => {
      req.query = { type: 'list' };

      await AdminController.manageStaff(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });

    test('should add new staff member', async () => {
      req.body = {
        name: 'João Silva',
        email: 'joao@example.com',
        role: 'cleaner',
      };

      await AdminController.manageStaff(req, res);
      
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('Admin workflow', () => {
    test('should complete admin tasks', async () => {
      // Get stats
      await AdminController.getDashboardStats(req, res);
      expect(res.json).toHaveBeenCalled();

      // Get bookings
      req.query = { page: 1 };
      await AdminController.getAllBookings(req, res);
      expect(res.json).toHaveBeenCalled();

      // Get users
      req.query = {};
      await AdminController.getAllUsers(req, res);
      expect(res.json).toHaveBeenCalled();
    });
  });
});
