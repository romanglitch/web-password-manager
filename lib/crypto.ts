"use client";

const DB_KEY_NAME = "pm-encryption-key";
const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;

/**
 * Derive or retrieve the AES-GCM encryption key stored in IndexedDB.
 * The key never leaves the browser — it is generated once and persisted.
 */
async function getOrCreateEncryptionKey(): Promise<CryptoKey> {
	const { openDB } = await import("idb");

	const keyDb = await openDB("pm-keystore", 1, {
		upgrade(db) {
			db.createObjectStore("keys");
		},
	});

	const existing = await keyDb.get("keys", DB_KEY_NAME);
	if (existing) {
		return existing as CryptoKey;
	}

	const key = await crypto.subtle.generateKey(
		{ name: ALGORITHM, length: KEY_LENGTH },
		false, // non-extractable
		["encrypt", "decrypt"]
	);

	await keyDb.put("keys", key, DB_KEY_NAME);
	return key;
}

export async function encryptPassword(plaintext: string): Promise<{ encrypted: string; iv: string }> {
	const key = await getOrCreateEncryptionKey();
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encoded = new TextEncoder().encode(plaintext);

	const encryptedBuffer = await crypto.subtle.encrypt(
		{ name: ALGORITHM, iv },
		key,
		encoded
	);

	return {
		encrypted: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
		iv: btoa(String.fromCharCode(...iv)),
	};
}

export async function decryptPassword(encrypted: string, iv: string): Promise<string> {
	const key = await getOrCreateEncryptionKey();

	const encryptedBytes = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
	const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

	const decryptedBuffer = await crypto.subtle.decrypt(
		{ name: ALGORITHM, iv: ivBytes },
		key,
		encryptedBytes
	);

	return new TextDecoder().decode(decryptedBuffer);
}

export function generateSecureId(length: number = 4): string {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	const randomValues = crypto.getRandomValues(new Uint8Array(length));
	return Array.from(randomValues)
		.map((v) => chars[v % chars.length])
		.join("");
}