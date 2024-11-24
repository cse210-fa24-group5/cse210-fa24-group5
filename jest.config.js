
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
    testEnvironment: 'jest-environment-jsdom'
  };
  
  module.exports = config;