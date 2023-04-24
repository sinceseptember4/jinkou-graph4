/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: "node",
  setupFilesAfterEnv: ['jest-fetch-mock'],
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  moduleNameMapper: {
    "^node-fetch$": "jest-fetch-mock"
  }
  
};