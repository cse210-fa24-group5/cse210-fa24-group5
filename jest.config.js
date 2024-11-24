
/** @type {import('jest').Config} */
const config = {
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
      '.src/timer.js': {
        branches: 20,
        functions: 20,
        lines: 20,
        statements: 20, // TODO Please add more unit tests and remove
      }
    },
    projects: [
      {
        'displayName': 'browser',
        'testEnvironment': 'jest-environment-jsdom',
        'testMatch': ['**/tests/unit/**'],
      },
      {
        "displayName": "node",
        "testEnvironment": "node",
        "testMatch": ["**/tests/integration/**"]
      }
    ],
  };
  
  module.exports = config;