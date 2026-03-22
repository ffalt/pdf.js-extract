export default {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.mjs'],
  collectCoverageFrom: [
    'lib/**/*.mjs'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/local/'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/local/'
  ]
};

