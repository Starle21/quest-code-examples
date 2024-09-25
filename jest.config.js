module.exports = {
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  testEnvironment: "jsdom",
  silent: false,
  verbose: true,
  globals: {
    __DEV__: true,
    __RCTProfileIsProfiling: false,
  },
};
