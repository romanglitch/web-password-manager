import "@testing-library/jest-dom";

// Mock IndexedDB
const mockIDB = {
	open: jest.fn(),
	get: jest.fn(),
	put: jest.fn(),
	add: jest.fn(),
	delete: jest.fn(),
	getAll: jest.fn(),
	createObjectStore: jest.fn(),
};

jest.mock("idb", () => ({
	openDB: jest.fn().mockResolvedValue(mockIDB),
}));

// Mock crypto
Object.defineProperty(globalThis, "crypto", {
	value: {
		randomUUID: () => "test-uuid-" + Math.random().toString(36).slice(2),
		getRandomValues: (arr: Uint8Array) => {
			for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
			return arr;
		},
		subtle: {
			generateKey: jest.fn().mockResolvedValue({ type: "secret" }),
			encrypt: jest.fn().mockResolvedValue(new ArrayBuffer(16)),
			decrypt: jest.fn().mockResolvedValue(new TextEncoder().encode("test-password").buffer),
		},
	},
});

// Mock navigator.clipboard
Object.defineProperty(navigator, "clipboard", {
	value: { writeText: jest.fn().mockResolvedValue(undefined) },
});