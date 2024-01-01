// import type { Config } from 'jest'

const config = {
  verbose: true,
  testEnvironment: 'node',
  preset: 'ts-jest',
  testPathIgnorePatterns: ['test/lib'],
  testMatch: ['<rootDir>/test/**/*.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: true,
      },
    ],
  },
}

export default config
