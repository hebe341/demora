module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.env.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^newrelic$': '<rootDir>/__mocks__/newrelic.js'
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/index.js',
  ],
  coverageDirectory: 'coverage',
  // Threshold disabled initially; can be enabled after more tests are added
  // coverageThreshold: {
  //   global: {
  //     branches: 30,
  //     functions: 30,
  //     lines: 30,
  //     statements: 30,
  //   },
  // },
  testMatch: ['src/**/__tests__/**/*.js', 'src/**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/e2e/', '/coverage/'],
  verbose: true,
  maxWorkers: '50%',
};
