import { renderHook, act, waitFor } from "@testing-library/react";
import { usePasswords } from "@/hooks/usePasswords";
import * as storage from "@/lib/storage";

jest.mock("@/lib/storage");

const mockPasswords = [
	{ id: "1", name: "Wi-Fi", password: "secret123", createdAt: Date.now() },
	{ id: "2", name: "Почта", password: "email456", createdAt: Date.now() - 1000 },
];

beforeEach(() => {
	jest.spyOn(storage, "getAllPasswords").mockResolvedValue(mockPasswords);
	jest.spyOn(storage, "savePassword").mockResolvedValue({
		id: "3",
		name: "Bank",
		encryptedPassword: "enc",
		iv: "iv",
		createdAt: Date.now(),
		updatedAt: Date.now(),
	});
	jest.spyOn(storage, "deletePassword").mockResolvedValue(undefined);
});

test("загружает список паролей", async () => {
	const { result } = renderHook(() => usePasswords());
	await waitFor(() => expect(result.current.loading).toBe(false));
	expect(result.current.passwords).toHaveLength(2);
	expect(result.current.passwords[0].name).toBe("Wi-Fi");
});

test("добавляет пароль", async () => {
	const { result } = renderHook(() => usePasswords());
	await waitFor(() => expect(result.current.loading).toBe(false));

	await act(async () => {
		const res = await result.current.add("Bank", "bankpass");
		expect(res.success).toBe(true);
	});

	expect(storage.savePassword).toHaveBeenCalledWith("Bank", "bankpass");
});

test("не позволяет добавить пароль без названия", async () => {
	const { result } = renderHook(() => usePasswords());
	await waitFor(() => expect(result.current.loading).toBe(false));

	const res = await result.current.add("", "somepass");
	expect(res.success).toBe(false);
	expect(res.error).toContain("Название");
});

test("не позволяет добавить пустой пароль", async () => {
	const { result } = renderHook(() => usePasswords());
	await waitFor(() => expect(result.current.loading).toBe(false));

	const res = await result.current.add("Test", "");
	expect(res.success).toBe(false);
	expect(res.error).toContain("Пароль");
});

test("удаляет пароль", async () => {
	const { result } = renderHook(() => usePasswords());
	await waitFor(() => expect(result.current.loading).toBe(false));

	await act(async () => {
		const res = await result.current.remove("1");
		expect(res.success).toBe(true);
	});

	expect(storage.deletePassword).toHaveBeenCalledWith("1");
});

test("отклоняет пароль длиннее 1000 символов", async () => {
	const { result } = renderHook(() => usePasswords());
	await waitFor(() => expect(result.current.loading).toBe(false));

	const res = await result.current.add("Long", "x".repeat(1001));
	expect(res.success).toBe(false);
});