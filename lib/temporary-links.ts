// SERVER-SIDE ONLY — runs in Node.js process
// WARNING: This is in-memory storage. It works only within a single
// server process. On serverless platforms (Vercel, Netlify) each
// request may hit a different process, making links unreliable.
// This is intentionally documented as a demo/single-process mode.

import { createHmac, randomBytes } from "crypto";

interface StoredLink {
	password: string;
	expiresAt: number;
	createdAt: number;
}

// Module-level Map — lives for the lifetime of the Node.js process
const linkStore = new Map<string, StoredLink>();

// Cleanup interval: remove expired links every 30 seconds
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
	if (cleanupInterval !== null) return;
	cleanupInterval = setInterval(() => {
		const now = Date.now();
		for (const [id, link] of linkStore.entries()) {
			if (now >= link.expiresAt) {
				// Overwrite password before deletion
				linkStore.set(id, { password: "", expiresAt: 0, createdAt: 0 });
				linkStore.delete(id);
			}
		}
	}, 10_000);

	// Don't block process exit
	if (typeof cleanupInterval === "object" && cleanupInterval !== null && "unref" in cleanupInterval) {
		(cleanupInterval as ReturnType<typeof setInterval> & { unref?: () => void }).unref?.();
	}
}

function generateId(): string {
	// 3 random bytes → 6 hex chars, then take first 4
	const bytes = randomBytes(3);
	return bytes.toString("hex").slice(0, 4);
}

function signId(id: string): string {
	const secret = process.env.LINK_SIGNING_SECRET ?? "dev-secret-change-in-production";
	return createHmac("sha256", secret).update(id).digest("hex").slice(0, 8);
}

export function createTemporaryLink(password: string): { id: string; expiresAt: number } {
	if (!password || password.length === 0) {
		throw new Error("Password cannot be empty");
	}
	if (password.length > 1000) {
		throw new Error("Password too long");
	}

	startCleanup();

	const rawId = generateId();
	const sig = signId(rawId);
	const id = `${rawId}${sig}`; // e.g. "a7f3b9c2e1f0"

	const TTL_MS = 60_000;
	const expiresAt = Date.now() + TTL_MS;

	linkStore.set(id, { password, expiresAt, createdAt: Date.now() });

	// Schedule precise deletion
	setTimeout(() => {
		const entry = linkStore.get(id);
		if (entry) {
			// Clear password string from memory explicitly
			linkStore.set(id, { password: "", expiresAt: 0, createdAt: 0 });
			linkStore.delete(id);
		}
	}, TTL_MS + 1000);

	return { id, expiresAt };
}

export function getTemporaryLink(id: string): { password: string; expiresAt: number; remainingSeconds: number } | null {
	if (!id || id.length > 20) return null;

	// Validate HMAC signature
	const rawId = id.slice(0, 4);
	const sig = id.slice(4);
	const expectedSig = signId(rawId);
	if (sig !== expectedSig) return null;

	const link = linkStore.get(id);
	if (!link) return null;

	const now = Date.now();
	if (now >= link.expiresAt || link.password === "") {
		linkStore.delete(id);
		return null;
	}

	const remainingSeconds = Math.max(0, Math.ceil((link.expiresAt - now) / 1000));

	return {
		password: link.password,
		expiresAt: link.expiresAt,
		remainingSeconds,
	};
}

export function deleteTemporaryLink(id: string): void {
	if (!id) return;
	const entry = linkStore.get(id);
	if (entry) {
		linkStore.set(id, { password: "", expiresAt: 0, createdAt: 0 });
		linkStore.delete(id);
	}
}