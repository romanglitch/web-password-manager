"use client";

import { useState, useEffect, useCallback } from "react";
import {
	isWebAuthnSupported,
	isPlatformAuthenticatorAvailable,
	isAuthEnabled,
	hasValidSession,
	registerPasskey,
	authenticateWithPasskey,
	disablePasskey,
	clearSession,
} from "@/lib/webauthn";

export function useWebAuthn() {
	const [supported, setSupported] = useState(false);
	const [platformAvailable, setPlatformAvailable] = useState(false);
	const [enabled, setEnabled] = useState(false);
	const [authenticated, setAuthenticated] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		const init = async () => {
			const sup = isWebAuthnSupported();
			setSupported(sup);
			if (sup) {
				const avail = await isPlatformAuthenticatorAvailable();
				setPlatformAvailable(avail);
			}
			const en = isAuthEnabled();
			setEnabled(en);
			// If auth is not enabled, consider authenticated by default
			if (!en) {
				setAuthenticated(true);
			} else {
				setAuthenticated(hasValidSession());
			}
			setInitialized(true);
		};
		init();
	}, []);

	const enable = useCallback(async () => {
		setLoading(true);
		setError(null);
		const result = await registerPasskey();
		if (result.success) {
			setEnabled(true);
			setAuthenticated(true);
		} else {
			setError(result.error ?? "Неизвестная ошибка");
		}
		setLoading(false);
		return result;
	}, []);

	const authenticate = useCallback(async () => {
		setLoading(true);
		setError(null);
		const result = await authenticateWithPasskey();
		if (result.success) {
			setAuthenticated(true);
		} else {
			setError(result.error ?? "Неизвестная ошибка");
		}
		setLoading(false);
		return result;
	}, []);

	const disable = useCallback(async () => {
		setLoading(true);
		setError(null);
		await disablePasskey();
		setEnabled(false);
		setAuthenticated(true);
		setLoading(false);
	}, []);

	const lock = useCallback(() => {
		clearSession();
		setAuthenticated(false);
	}, []);

	return {
		supported,
		platformAvailable,
		enabled,
		authenticated,
		initialized,
		loading,
		error,
		enable,
		authenticate,
		disable,
		lock,
	};
}