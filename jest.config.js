module.exports = {
    testEnvironment: 'node',
    verbose: true,
    moduleFileExtensions: ['js', 'json', 'node'],
    roots: ['<rootDir>/src', '<rootDir>/test'],
    testMatch: ['**/test/**/*.test.js'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.js'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov']
};
