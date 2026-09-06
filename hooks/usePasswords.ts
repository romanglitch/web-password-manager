"use client";

import { useState, useEffect, useCallback } from "react";
import { savePassword, getAllPasswords, deletePassword } from "@/lib/storage";

export interface DecryptedEntry {
	id: string;
	name: string;
	password: string;
	createdAt: number;
}

export function usePasswords() {
	const [passwords, setPasswords] = useState<DecryptedEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getAllPasswords();
			setPasswords(data);
		} catch (err) {
			setError("Не удалось загрузить пароли из хранилища");
			console.error("Storage load error:", err instanceof Error ? err.message : "unknown");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const add = useCallback(async (name: string, password: string): Promise<{ success: boolean; error?: string }> => {
		const trimmedName = name.trim();
		const trimmedPass = password.trim();

		if (!trimmedName) return { success: false, error: "Название обязательно" };
		if (trimmedName.length > 100) return { success: false, error: "Название слишком длинное (макс. 100 символов)" };
		if (!trimmedPass) return { success: false, error: "Пароль не может быть пустым" };
		if (trimmedPass.length > 1000) return { success: false, error: "Пароль слишком длинный (макс. 1000 символов)" };

		try {
			await savePassword(trimmedName, trimmedPass);
			await load();
			return { success: true };
		} catch (err) {
			const message = err instanceof Error ? err.message : "Ошибка сохранения";
			return { success: false, error: message };
		}
	}, [load]);

	const remove = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
		if (!id) return { success: false, error: "Неверный ID" };
		try {
			await deletePassword(id);
			await load();
			return { success: true };
		} catch (err) {
			const message = err instanceof Error ? err.message : "Ошибка удаления";
			return { success: false, error: message };
		}
	}, [load]);

	return { passwords, loading, error, add, remove, reload: load };
}