import { createTemporaryLink, getTemporaryLink, deleteTemporaryLink } from "@/lib/temporary-links";

describe("Временные ссылки", () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	test("создаёт временную ссылку", () => {
		const { id, expiresAt } = createTemporaryLink("secret123");
		expect(id).toBeTruthy();
		expect(id.length).toBeGreaterThan(4);
		expect(expiresAt).toBeGreaterThan(Date.now());
	});

	test("возвращает пароль по валидному id", () => {
		const { id } = createTemporaryLink("mypassword");
		const result = getTemporaryLink(id);
		expect(result).not.toBeNull();
		expect(result?.password).toBe("mypassword");
		expect(result?.remainingSeconds).toBeGreaterThan(0);
	});

	test("ссылка истекает через 60 секунд", () => {
		const { id } = createTemporaryLink("expiring");
		jest.advanceTimersByTime(61_000);
		const result = getTemporaryLink(id);
		expect(result).toBeNull();
	});

	test("удаляет ссылку вручную", () => {
		const { id } = createTemporaryLink("deleteme");
		deleteTemporaryLink(id);
		const result = getTemporaryLink(id);
		expect(result).toBeNull();
	});

	test("отклоняет пустой пароль", () => {
		expect(() => createTemporaryLink("")).toThrow();
	});

	test("отклоняет слишком длинный пароль", () => {
		expect(() => createTemporaryLink("x".repeat(1001))).toThrow();
	});

	test("не находит несуществующий id", () => {
		const result = getTemporaryLink("nonexistent");
		expect(result).toBeNull();
	});

	test("не находит id с неверной подписью", () => {
		const result = getTemporaryLink("a1b2zzzzzzzz");
		expect(result).toBeNull();
	});
});

describe("Хранилище паролей", () => {
	const mockStorage: Record<string, unknown> = {};

	beforeEach(() => {
		const { openDB } = require("idb");
		openDB.mockResolvedValue({
			add: jest.fn().mockImplementation((store: string, entry: unknown) => {
				mockStorage[(entry as { id: string }).id] = entry;
				return Promise.resolve();
			}),
			getAll: jest.fn().mockResolvedValue(Object.values(mockStorage)),
			delete: jest.fn().mockImplementation((store: string, id: string) => {
				delete mockStorage[id];
				return Promise.resolve();
			}),
			get: jest.fn().mockImplementation((store: string, id: string) => {
				return Promise.resolve(mockStorage[id]);
			}),
			createObjectStore: jest.fn(),
		});
	});

	test("сохраняет пароль с шифрованием", async () => {
		const { savePassword } = await import("@/lib/storage");
		const entry = await savePassword("Wi-Fi", "mypassword");
		expect(entry.name).toBe("Wi-Fi");
		expect(entry.id).toBeTruthy();
		expect(entry.encryptedPassword).toBeTruthy();
		// Password should not be stored in plaintext
		expect(entry.encryptedPassword).not.toBe("mypassword");
	});

	test("не позволяет создать пустую временную ссылку", () => {
		expect(() => createTemporaryLink("")).toThrow("Password cannot be empty");
	});
});