"use client";

import { useState, useEffect, useRef } from "react";

export function useCountdown(expiresAt: number | null) {
	const [remaining, setRemaining] = useState<number>(() => {
		if (expiresAt === null) return -1; // -1 означает "ещё не инициализирован"
		return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
	});

	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		if (expiresAt === null) return;

		const tick = () => {
			const diff = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
			setRemaining(diff);
			if (diff <= 0 && intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};

		tick();
		intervalRef.current = setInterval(tick, 1000);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [expiresAt]);

	return remaining;
}