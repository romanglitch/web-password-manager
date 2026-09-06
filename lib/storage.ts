"use client";

import type { EncryptedPasswordEntry } from "@/types";
import { encryptPassword, decryptPassword } from "./crypto";

const DB_NAME = "password-manager";
const DB_VERSION = 1;
const STORE_NAME = "passwords";

async function getDB() {
	const { openDB } = await import("idb");

	return openDB(DB_NAME, DB_VERSION, {
		upgrade(db) {
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
				store.createIndex("createdAt", "createdAt");
			}
		},
	});
}

export async function savePassword(name: string, password: string): Promise<EncryptedPasswordEntry> {
	const db = await getDB();
	const { encrypted, iv } = await encryptPassword(password);

	const entry: EncryptedPasswordEntry = {
		id: crypto.randomUUID(),
		name: name.trim().slice(0, 100),
		encryptedPassword: encrypted,
		iv,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	};

	await db.add(STORE_NAME, entry);
	return entry;
}

export async function getAllPasswords(): Promise<Array<{ id: string; name: string; password: string; createdAt: number }>> {
	const db = await getDB();
	const entries = await db.getAll(STORE_NAME) as EncryptedPasswordEntry[];

	const decrypted = await Promise.all(
		entries.map(async (entry) => {
			try {
				const password = await decryptPassword(entry.encryptedPassword, entry.iv);
				return {
					id: entry.id,
					name: entry.name,
					password,
					createdAt: entry.createdAt,
				};
			} catch {
				return {
					id: entry.id,
					name: entry.name,
					password: "[ошибка расшифровки]",
					createdAt: entry.createdAt,
				};
			}
		})
	);

	return decrypted.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deletePassword(id: string): Promise<void> {
	const db = await getDB();
	await db.delete(STORE_NAME, id);
}

export async function passwordExists(id: string): Promise<boolean> {
	const db = await getDB();
	const entry = await db.get(STORE_NAME, id);
	return entry !== undefined;
}