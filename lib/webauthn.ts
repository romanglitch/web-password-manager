"use client";

// WebAuthn / Passkeys — client-side helpers
// IMPORTANT LIMITATIONS:
// - Full WebAuthn requires HTTPS and a valid domain (rpId must match origin)
// - Credential storage here uses localStorage as a demo — production should use server-side storage
// - On localhost, rpId = "localhost" works for testing
// - Biometric data is NEVER stored — WebAuthn stores only a credential ID and public key
// - This demo mode stores the credential ID in localStorage; the private key stays in the authenticator

const RP_ID = typeof window !== "undefined" ? window.location.hostname : "localhost";
const RP_NAME = "Password Manager";
const USER_ID = "pm-user-01";
const CREDENTIAL_KEY = "pm-webauthn-credential";
const AUTH_ENABLED_KEY = "pm-webauthn-enabled";
const AUTH_SESSION_KEY = "pm-webauthn-session";
const SESSION_TTL_MS = 5 * 60 * 1000; // 5 min session

export function isWebAuthnSupported(): boolean {
	return (
		typeof window !== "undefined" &&
		typeof window.PublicKeyCredential !== "undefined" &&
		typeof navigator.credentials !== "undefined"
	);
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
	if (!isWebAuthnSupported()) return false;
	try {
		return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
	} catch {
		return false;
	}
}

export function isAuthEnabled(): boolean {
	if (typeof window === "undefined") return false;
	return localStorage.getItem(AUTH_ENABLED_KEY) === "true";
}

export function getStoredCredentialId(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(CREDENTIAL_KEY);
}

export function hasValidSession(): boolean {
	if (typeof window === "undefined") return false;
	const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
	if (!raw) return false;
	try {
		const { expiresAt } = JSON.parse(raw) as { expiresAt: number };
		return Date.now() < expiresAt;
	} catch {
		return false;
	}
}

function setSession() {
	sessionStorage.setItem(
		AUTH_SESSION_KEY,
		JSON.stringify({ expiresAt: Date.now() + SESSION_TTL_MS })
	);
}

export function clearSession() {
	sessionStorage.removeItem(AUTH_SESSION_KEY);
}

export async function registerPasskey(): Promise<{ success: boolean; error?: string }> {
	if (!isWebAuthnSupported()) {
		return { success: false, error: "WebAuthn не поддерживается в этом браузере" };
	}

	try {
		const challenge = crypto.getRandomValues(new Uint8Array(32));
		const userId = new TextEncoder().encode(USER_ID);

		const credential = await navigator.credentials.create({
			publicKey: {
				challenge,
				rp: { id: RP_ID, name: RP_NAME },
				user: {
					id: userId,
					name: "user@passwordmanager",
					displayName: "Password Manager User",
				},
				pubKeyCredParams: [
					{ type: "public-key", alg: -7 }, // ES256
					{ type: "public-key", alg: -257 }, // RS256
				],
				authenticatorSelection: {
					authenticatorAttachment: "platform",
					userVerification: "required",
					residentKey: "preferred",
				},
				timeout: 60000,
				attestation: "none",
			},
		}) as PublicKeyCredential | null;

		if (!credential) {
			return { success: false, error: "Регистрация отменена" };
		}

		// Store credential ID (not biometric data)
		const credId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
		localStorage.setItem(CREDENTIAL_KEY, credId);
		localStorage.setItem(AUTH_ENABLED_KEY, "true");
		setSession();

		return { success: true };
	} catch (err) {
		const message = err instanceof Error ? err.message : "Неизвестная ошибка";
		return { success: false, error: `Ошибка регистрации: ${message}` };
	}
}

export async function authenticateWithPasskey(): Promise<{ success: boolean; error?: string }> {
	if (!isWebAuthnSupported()) {
		return { success: false, error: "WebAuthn не поддерживается" };
	}

	const storedCredId = getStoredCredentialId();
	if (!storedCredId) {
		return { success: false, error: "Passkey не зарегистрирован. Сначала включите Face ID." };
	}

	try {
		const challenge = crypto.getRandomValues(new Uint8Array(32));
		const credIdBytes = Uint8Array.from(atob(storedCredId), (c) => c.charCodeAt(0));

		const assertion = await navigator.credentials.get({
			publicKey: {
				challenge,
				rpId: RP_ID,
				allowCredentials: [{ type: "public-key", id: credIdBytes }],
				userVerification: "required",
				timeout: 60000,
			},
		}) as PublicKeyCredential | null;

		if (!assertion) {
			return { success: false, error: "Аутентификация отменена" };
		}

		setSession();
		return { success: true };
	} catch (err) {
		const message = err instanceof Error ? err.message : "Неизвестная ошибка";
		return { success: false, error: `Ошибка аутентификации: ${message}` };
	}
}

export async function disablePasskey(): Promise<void> {
	localStorage.removeItem(CREDENTIAL_KEY);
	localStorage.removeItem(AUTH_ENABLED_KEY);
	clearSession();
}