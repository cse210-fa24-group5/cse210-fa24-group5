/** @type {import('jest').Config} */
const config = {
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  projects: [
    {
      displayName: "browser",
      testEnvironment: "jest-environment-jsdom",
      testMatch: ["**/tests/unit/**"],
    },
    {
      displayName: "node",
      testEnvironment: "node",
      testMatch: ["**/tests/integration/**"],
    },
  ],
};

module.exports = config;
