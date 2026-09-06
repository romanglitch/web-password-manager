"use client";

import { useWebAuthn } from "@/hooks/useWebAuthn";

interface AuthGateProps {
	children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
	const {
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
	} = useWebAuthn();

	if (!initialized) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
				<div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
					 aria-label="Загрузка" />
			</div>
		);
	}

	if (enabled && !authenticated) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
				<div className="w-full max-w-sm space-y-6">
					<div className="text-center">
						<div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
							<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-600 dark:text-blue-400">
								<circle cx="12" cy="8" r="4" />
								<path d="M6 20v-2a6 6 0 0 1 12 0v2" />
							</svg>
						</div>
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Менеджер паролей</h1>
						<p className="text-gray-500 dark:text-gray-400 mt-2">
							Войдите с помощью Face ID или Touch ID
						</p>
					</div>

					{error && (
						<div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
							<p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
						</div>
					)}

					<button
						onClick={authenticate}
						disabled={loading}
						className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base
                       active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						aria-label="Войти с помощью Face ID"
					>
						{loading ? "Проверка..." : "Войти с Face ID / Touch ID"}
					</button>

					{!platformAvailable && (
						<div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
							<p className="text-xs text-amber-700 dark:text-amber-400">
								Биометрический аутентификатор недоступен на этом устройстве или требуется HTTPS.
							</p>
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<>
			{children}
			{/* Settings bar */}
			<div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md
                      border-t border-gray-200 dark:border-gray-800 px-4 pt-2 pb-safe z-40">
				<div className="max-w-sm mx-auto flex items-center justify-between gap-2">
					{!enabled && supported && platformAvailable && (
						<button
							onClick={enable}
							disabled={loading}
							className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-blue-600 dark:text-blue-400
                         hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 min-h-[44px]"
							aria-label="Включить Face ID"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
								<path d="M7 11V7a5 5 0 0 1 10 0v4" />
							</svg>
							Заблокировать
						</button>
					)}
					{enabled && (
						<button
							onClick={disable}
							disabled={loading}
							className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 min-h-[44px]"
							aria-label="Отключить Face ID"
						>
							Отключить Face ID
						</button>
					)}
					{enabled && authenticated && (
						<button
							onClick={lock}
							className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 dark:text-red-400
                         hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px] ml-auto"
							aria-label="Заблокировать приложение"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
								<path d="M7 11V7a5 5 0 0 1 9.9-1" />
							</svg>
							Заблокировать
						</button>
					)}
					{!supported && (
						<p className="text-xs text-gray-400 dark:text-gray-500 px-2">
							WebAuthn не поддерживается (нужен HTTPS)
						</p>
					)}
				</div>
			</div>
		</>
	);
}