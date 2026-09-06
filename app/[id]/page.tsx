"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { useCountdown } from "@/hooks/useCountdown";
import type { GetLinkResponse } from "@/types";

interface PageProps {
	params: Promise<{ id: string }>;
}

type PageState = "loading" | "valid" | "expired" | "not_found" | "error";

export default function TempLinkPage({ params }: PageProps) {
	const { id } = use(params);

	const [state, setState] = useState<PageState>("loading");
	const [password, setPassword] = useState<string>("");
	const [expiresAt, setExpiresAt] = useState<number | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [copied, setCopied] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const passwordRef = useRef<string>("");

	const remaining = useCountdown(expiresAt);

	const fetchLink = useCallback(async () => {
		// Проверяем формат до запроса — буква + 2 цифры
		if (!id || !/^[a-z]\d{2}$/.test(id)) {
			setState("not_found");
			return;
		}

		try {
			const res = await fetch(`/api/links/${encodeURIComponent(id)}`);
			if (res.status === 404) { setState("not_found"); return; }
			if (!res.ok) { setState("error"); setErrorMessage("Ошибка загрузки ссылки"); return; }

			const data = await res.json() as GetLinkResponse;
			passwordRef.current = data.password;
			setPassword(data.password);
			setExpiresAt(data.expiresAt);
			setState("valid");
		} catch {
			setState("error");
			setErrorMessage("Не удалось подключиться к серверу");
		}
	}, [id]);

	useEffect(() => { fetchLink(); }, [fetchLink]);

	useEffect(() => {
		if (state === "valid" && remaining === 0) {
			setPassword("");
			passwordRef.current = "";
			setShowPassword(false);
			setState("expired");
		}
	}, [remaining, state]);

	const handleCopy = async () => {
		const pwd = passwordRef.current;
		if (!pwd) return;
		try {
			await navigator.clipboard.writeText(pwd);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			const el = document.createElement("textarea");
			el.value = pwd;
			el.setAttribute("readonly", "");
			el.style.cssText = "position:absolute;left:-9999px";
			document.body.appendChild(el);
			el.select();
			document.execCommand("copy");
			document.body.removeChild(el);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const urgentColor =
		remaining <= 15 ? "text-red-600 dark:text-red-400" :
			remaining <= 30 ? "text-orange-500 dark:text-orange-400" :
				"text-green-600 dark:text-green-400";

	if (state === "loading") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
				<div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
					 aria-label="Загрузка" role="status" />
			</div>
		);
	}

	if (state === "not_found") {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6 text-center">
				<div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
					<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
						<line x1="11" y1="8" x2="11" y2="12" />
						<line x1="11" y1="16" x2="11.01" y2="16" />
					</svg>
				</div>
				<h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ссылка не найдена</h1>
				<p className="text-gray-500 dark:text-gray-400 text-sm">Ссылка не существует или уже истекла.</p>
				<a href="/" className="mt-6 px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
					На главную
				</a>
			</div>
		);
	}

	if (state === "expired") {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6 text-center">
				<div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
					<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-500">
						<circle cx="12" cy="12" r="10" />
						<polyline points="12 6 12 12 16 14" />
					</svg>
				</div>
				<h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ссылка истекла</h1>
				<p className="text-gray-500 dark:text-gray-400 text-sm">Пароль был автоматически удалён.</p>
				<a href="/" className="mt-6 px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
					На главную
				</a>
			</div>
		);
	}

	if (state === "error") {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6 text-center">
				<h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ошибка</h1>
				<p className="text-gray-500 dark:text-gray-400 text-sm">{errorMessage}</p>
				<button onClick={fetchLink}
						className="mt-6 px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
					Повторить
				</button>
			</div>
		);
	}

	return (
		<main className="min-h-screen bg-gray-50 dark:bg-gray-950">
			<div className="max-w-sm mx-auto px-4 pt-safe pb-safe min-h-screen flex flex-col">
				<header className="pt-6 pb-6">
					<p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
						Временный пароль
					</p>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Получите пароль</h1>
				</header>

				{/* Timer */}
				<div className="mb-4 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
					<div className="flex items-center gap-4">
						<div>
							<p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Ссылка истечёт через</p>
							<p className={`text-3xl font-mono font-bold ${urgentColor}`} aria-live="polite" aria-atomic="true">
								{remaining}с
							</p>
						</div>
						<div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
							<div
								className={`h-full rounded-full transition-all duration-1000 ${
									remaining <= 15 ? "bg-red-500" : remaining <= 30 ? "bg-orange-400" : "bg-green-500"
								}`}
								style={{ width: `${(remaining / 60) * 100}%` }}
								role="progressbar"
								aria-valuenow={remaining}
								aria-valuemin={0}
								aria-valuemax={60}
								aria-label={`Осталось ${remaining} секунд`}
							/>
						</div>
					</div>
				</div>

				{/* Warning */}
				<div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
					<p className="text-xs text-amber-700 dark:text-amber-400">
						⚠️ Скопируйте пароль до истечения таймера. После этого он будет удалён навсегда.
					</p>
				</div>

				{/* Password */}
				<div className="mb-4 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm space-y-3">
					<p className="text-xs font-medium text-gray-500 dark:text-gray-400">Пароль</p>
					<div className="flex items-center gap-2">
						<p className="flex-1 font-mono text-base text-gray-900 dark:text-white break-all"
						   aria-label={showPassword ? `Пароль: ${password}` : "Пароль скрыт"}>
							{showPassword ? password : "••••••••••••"}
						</p>
						<button
							onClick={() => setShowPassword((v) => !v)}
							className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                         min-h-[44px] min-w-[44px] flex items-center justify-center"
							aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
						>
							{showPassword ? <EyeOffIcon /> : <EyeIcon />}
						</button>
					</div>
				</div>

				{/* Copy */}
				<button
					onClick={handleCopy}
					className={`w-full py-4 rounded-2xl font-semibold text-base transition-all active:scale-95 ${
						copied ? "bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
					}`}
					aria-label="Скопировать пароль"
				>
					{copied ? "✓ Пароль скопирован!" : "Скопировать пароль"}
				</button>

				<div className="mt-auto pt-6 pb-4 text-center">
					<a href="/"
					   className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
						Перейти в менеджер паролей
					</a>
				</div>
			</div>
		</main>
	);
}

function EyeIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
			 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	);
}

function EyeOffIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
			 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
			<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
			<line x1="1" y1="1" x2="23" y2="23" />
		</svg>
	);
}