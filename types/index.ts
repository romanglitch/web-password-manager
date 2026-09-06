export interface PasswordEntry {
	id: string;
	name: string;
	password: string; // encrypted via Web Crypto when stored
	createdAt: number;
	updatedAt: number;
}

export interface EncryptedPasswordEntry {
	id: string;
	name: string;
	encryptedPassword: string; // base64 encoded ArrayBuffer
	iv: string; // base64 encoded IV
	createdAt: number;
	updatedAt: number;
}

export interface TemporaryLink {
	id: string;
	password: string;
	expiresAt: number;
	createdAt: number;
}

export interface CreateLinkResponse {
	id: string;
	expiresAt: number;
	url: string;
}

export interface GetLinkResponse {
	password: string;
	expiresAt: number;
	remainingSeconds: number;
}

export interface WebAuthnCredential {
	credentialId: string;
	publicKey: string;
	userHandle: string;
}

export type ViewMode = "list" | "grid";