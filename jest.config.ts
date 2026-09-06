import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
	testEnvironment: "jsdom",
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
	},
	transform: {
		"^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
	},
	testMatch: [
		"**/__tests__/**/*.ts?(x)"
	]
};

export default createJestConfig(config);