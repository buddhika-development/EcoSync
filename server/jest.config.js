export default {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js', '**/*.test.js'],
  verbose: true,
  collectCoverage: false,
  coverageDirectory: 'coverage',
  extensionsToTreatAsEsm: ['.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transformIgnorePatterns: ['node_modules/'],
};