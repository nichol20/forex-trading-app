/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";

const config: Config = {
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    testMatch: ["**/?(*.)+(spec|test).(ts|tsx)"],
    moduleFileExtensions: ["ts", "js", "json", "node"],
    globalSetup: "./src/__tests__/setup/index.ts",
    globalTeardown: "./src/__tests__/setup/teardown.ts",
    setupFilesAfterEnv: ["<rootDir>/jest.setup-env.ts"],
};

export default config;
