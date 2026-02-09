/**
 * jest.setup.js - Post-setup for Jest
 * Silenciar logs do winston e configurar mockups globais
 */

// Silenciar winston logs durante testes
jest.mock('winston', () => ({
  createLogger: jest.fn().mockReturnValue({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
  }),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

// Set timeout global to 10s para testes mais lentos
jest.setTimeout(10000);

// Suppress console errors em testes (exceto quando explicitamente necessário)
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn((...args) => {
    if (typeof args[0] === 'string' && args[0].includes('[winston]')) {
      // Silenciar avisos do winston
      return;
    }
    originalError.call(console, ...args);
  });
});

afterAll(() => {
  console.error = originalError;
});
