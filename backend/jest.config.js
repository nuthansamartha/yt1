module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // Inline tsconfig override for test files: adds 'jest' to types
        // so describe/it/expect globals are recognised without polluting
        // the main tsconfig (which excludes tests/).
        tsconfig: {
          types: ['node', 'jest']
        }
      }
    ]
  }
};


