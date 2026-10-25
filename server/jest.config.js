/**
 * jest.config.js — Jest configuration for ESM (type: "module") server
 *
 * Run with:
 *   NODE_OPTIONS='--experimental-vm-modules' npx jest
 *   or: npm test
 */
export default {
  // Use Node environment (no DOM)
  testEnvironment: 'node',

  // No transform needed for ESM — Jest reads native ES modules
  transform: {},

  // NOTE: '.js' is automatically inferred as ESM when package.json has "type":"module".
  // Including it explicitly in extensionsToTreatAsEsm causes a Jest validation error,
  // so the array is removed. The moduleNameMapper below handles ESM import resolution.

  // Map bare .js imports to omit extension (needed for some ESM interop)
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Global setup/teardown for mongodb-memory-server lifecycle
  globalSetup:    './__tests__/setup/globalSetup.js',
  globalTeardown: './__tests__/setup/globalTeardown.js',

  // Per-file setup (connect mongoose before each test file)
  // M-4 FIX: was `setupFilesAfterFramework` (invalid key — Mongoose strict mode
  // silently dropped it), now corrected to `setupFilesAfterEnv` (the real Jest key).
  // This means dbSetup.js now actually runs, connecting Mongoose to the in-memory
  // MongoDB before each test file executes.
  setupFilesAfterEnv: ['./__tests__/setup/dbSetup.js'],

  // Test file pattern
  testMatch: ['**/__tests__/**/*.test.js'],

  // Coverage configuration
  collectCoverage: false, // enable via --coverage flag
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  // M-4 bonus: `coverageThresholds` was also a typo — the correct key is `coverageThreshold`
  coverageThreshold: {
    global: {
      lines:      85,
      functions:  85,
      branches:   75,
      statements: 85,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],

  // Verbose output
  verbose: true,

  // Force exit after tests complete (prevents Jest hanging on open handles)
  forceExit: true,

  // Detect open handles (useful for debugging)
  detectOpenHandles: false,

  // Timeout per test
  testTimeout: 30000,
};
