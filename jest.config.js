module.exports = {
  projects: [
    {
      displayName: 'test'
    },
    {
      runner: 'jest-runner-eslint',
      verbose: false,
      displayName: 'lint',
      testMatch: ['<rootDir>/lib/**/*.js', '<rootDir>/test/**/*.js']
    }
  ],
  collectCoverageFrom: ['<rootDir>/lib/**/*.js'],
  collectCoverage: true,
  coverageReporters: [
    'lcov',
    'clover',
    'text-summary',
    'html'
  ]
};

