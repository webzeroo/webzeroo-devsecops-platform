const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/e2e/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/layout.js',
  ],
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'WebZero LMS API Security Report',
      outputPath: './jest-report.html',
      includeFailureMsg: true,
      includeConsoleLog: true
    }]
  ],
};

module.exports = createJestConfig(customJestConfig);
