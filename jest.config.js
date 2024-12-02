/** @type {import('jest').Config} */
const config = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
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
