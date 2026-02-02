/**
 * Newsletter Controller Tests
 */

const NewsletterController = require('../controllers/NewsletterController');

describe('NewsletterController', () => {
  describe('isValidEmail', () => {
    test('deve validar email correto', () => {
      expect(NewsletterController.isValidEmail('test@example.com')).toBe(true);
    });

    test('deve validar email com múltiplos domínios', () => {
      expect(NewsletterController.isValidEmail('user@mail.co.uk')).toBe(true);
    });

    test('deve rejeitar email sem @', () => {
      expect(NewsletterController.isValidEmail('testemail.com')).toBe(false);
    });

    test('deve rejeitar email vazio', () => {
      expect(NewsletterController.isValidEmail('')).toBe(false);
    });

    test('deve rejeitar email com espaços', () => {
      expect(NewsletterController.isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('subscribe', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
      mockRequest = {
        body: {
          email: 'test@example.com',
          name: 'Test User'
        }
      };

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    test('deve retornar erro com email inválido', async () => {
      mockRequest.body.email = 'invalid-email';
      
      await NewsletterController.subscribe(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    test('deve retornar erro com email em branco', async () => {
      mockRequest.body.email = '';
      
      await NewsletterController.subscribe(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('unsubscribe', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
      mockRequest = {
        body: {
          email: 'test@example.com'
        }
      };

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    test('deve retornar erro com email inválido', async () => {
      mockRequest.body.email = 'invalid-email';
      
      await NewsletterController.unsubscribe(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});
