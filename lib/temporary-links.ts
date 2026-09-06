// SERVER-SIDE ONLY — runs in Node.js process
import { randomBytes } from "crypto";

interface StoredLink {
	password: string;
	expiresAt: number;
	createdAt: number;
}

const linkStore = new Map<string, StoredLink>();
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
	if (cleanupInterval !== null) return;
	cleanupInterval = setInterval(() => {
		const now = Date.now();
		for (const [id, link] of linkStore.entries()) {
			if (now >= link.expiresAt) {
				linkStore.set(id, { password: "", expiresAt: 0, createdAt: 0 });
				linkStore.delete(id);
			}
		}
	}, 10_000);

	if (
		typeof cleanupInterval === "object" &&
		cleanupInterval !== null &&
		"unref" in cleanupInterval
	) {
		(cleanupInterval as ReturnType<typeof setInterval> & { unref?: () => void }).unref?.();
	}
}

function generateId(): string {
	const letters = "abcdefghijklmnopqrstuvwxyz";
	const digits = "0123456789";

	// Генерируем пока не найдём свободный ID (коллизии крайне редки)
	for (let attempt = 0; attempt < 100; attempt++) {
		const rand = randomBytes(3);
		const letter = letters[rand[0] % letters.length];
		const digit1 = digits[rand[1] % digits.length];
		const digit2 = digits[rand[2] % digits.length];
		const id = `${letter}${digit1}${digit2}`;

		if (!linkStore.has(id)) return id;
	}

	throw new Error("Не удалось сгенерировать уникальный ID");
}

function isValidFormat(id: string): boolean {
	// Ровно 3 символа: буква + цифра + цифра
	return /^[a-z]\d{2}$/.test(id);
}

export function createTemporaryLink(password: string): { id: string; expiresAt: number } {
	if (!password || password.length === 0) {
		throw new Error("Password cannot be empty");
	}
	if (password.length > 1000) {
		throw new Error("Password too long");
	}

	startCleanup();

	const id = generateId(); // ровно 3 символа, например "q48"
	const TTL_MS = 60_000;
	const expiresAt = Date.now() + TTL_MS;

	linkStore.set(id, { password, expiresAt, createdAt: Date.now() });

	setTimeout(() => {
		const entry = linkStore.get(id);
		if (entry) {
			linkStore.set(id, { password: "", expiresAt: 0, createdAt: 0 });
			linkStore.delete(id);
		}
	}, TTL_MS + 1000);

	return { id, expiresAt };
}

export function getTemporaryLink(
	id: string
): { password: string; expiresAt: number; remainingSeconds: number } | null {
	if (!id || !isValidFormat(id)) return null;

	const link = linkStore.get(id);
	if (!link) return null;

	const now = Date.now();
	if (now >= link.expiresAt || link.password === "") {
		linkStore.set(id, { password: "", expiresAt: 0, createdAt: 0 });
		linkStore.delete(id);
		return null;
	}

	return {
		password: link.password,
		expiresAt: link.expiresAt,
		remainingSeconds: Math.max(0, Math.ceil((link.expiresAt - now) / 1000)),
	};
}

export function deleteTemporaryLink(id: string): void {
	if (!id || !isValidFormat(id)) return;
	const entry = linkStore.get(id);
	if (entry) {
		linkStore.set(id, { password: "", expiresAt: 0, createdAt: 0 });
		linkStore.delete(id);
	}
}