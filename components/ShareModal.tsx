"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useCountdown } from "@/hooks/useCountdown";
import QRCode from "./QRCode";

interface ShareModalProps {
	linkId: string;
	linkUrl: string;
	expiresAt: number;
	onCancel: () => void;
	onExpired: () => void;
}

export default function ShareModal({ linkId, linkUrl, expiresAt, onCancel, onExpired }: ShareModalProps) {
	const remaining = useCountdown(expiresAt);
	const [copied, setCopied] = useState(false);
	const [shareSupported] = useState(() =>
		typeof navigator !== "undefined" && "share" in navigator
	);
	const [cancelling, setCancelling] = useState(false);

	const handleExpired = useCallback(() => {
		onExpired();
	}, [onExpired]);

	const mountedRef = useRef(false);

	useEffect(() => {
		if (remaining < 0) return;

		if (!mountedRef.current) {
			mountedRef.current = true;
			return;
		}

		if (remaining === 0) {
			handleExpired();
		}
	}, [remaining, handleExpired]);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(linkUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback for older browsers
			const el = document.createElement("textarea");
			el.value = linkUrl;
			el.setAttribute("readonly", "");
			el.style.position = "absolute";
			el.style.left = "-9999px";
			document.body.appendChild(el);
			el.select();
			document.execCommand("copy");
			document.body.removeChild(el);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleShare = async () => {
		if (!shareSupported) return;
		try {
			await navigator.share({ title: "Временный пароль", url: linkUrl });
		} catch {
			// User cancelled share — not an error
		}
	};

	const handleCancel = async () => {
		setCancelling(true);
		try {
			await fetch(`/api/links/${linkId}`, { method: "DELETE" });
		} catch {
			// Ignore network errors on cancel
		}
		onCancel();
	};

	const urgentColor = remaining <= 15 ? "text-red-600 dark:text-red-400" : remaining <= 30 ? "text-orange-500 dark:text-orange-400" : "text-green-600 dark:text-green-400";

	return (
		<div
			className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm share-modal"
			role="dialog"
			aria-modal="true"
			aria-labelledby="share-modal-title"
		>
			<div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto pb-safe">
				<div className="flex items-center justify-between px-5 pt-5 pb-3">
					<h2 id="share-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">
						Временная ссылка
					</h2>
					<button
						onClick={handleCancel}
						disabled={cancelling}
						className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
						aria-label="Закрыть"
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
							<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>

				{/* Timer */}
				<div className="mx-5 mb-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center gap-3">
					<div className="flex-1">
						<p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Ссылка истечёт через</p>
						<p className={`text-2xl font-mono font-bold ${urgentColor}`} aria-live="polite" aria-atomic="true">
							{remaining}с
						</p>
					</div>
					<svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
						<circle cx="18" cy="18" r="16" stroke="#e5e7eb" strokeWidth="3" />
						<circle
							cx="18" cy="18" r="16"
							stroke={remaining <= 15 ? "#ef4444" : remaining <= 30 ? "#f97316" : "#22c55e"}
							strokeWidth="3"
							strokeDasharray={`${(remaining / 60) * 100.53} 100.53`}
							strokeLinecap="round"
							transform="rotate(-90 18 18)"
							style={{ transition: "stroke-dasharray 1s linear, stroke 0.5s" }}
						/>
					</svg>
				</div>

				{/* Warning */}
				<div className="mx-5 mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
					<p className="text-xs text-amber-700 dark:text-amber-400">
						⚠️ Ссылка автоматически удалится через 60 секунд. Пароль хранится только в памяти сервера (single-process режим).
					</p>
				</div>

				{/* QR Code */}
				<div className="flex justify-center mb-4 px-5">
					<div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
						<QRCode value={linkUrl} size={200} />
					</div>
				</div>

				{/* Link */}
				<div className="mx-5 mb-3">
					<p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Ссылка</p>
					<div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
						<p className="flex-1 text-sm font-mono text-gray-700 dark:text-gray-300 break-all min-w-0">{linkUrl}</p>
					</div>
				</div>

				{/* Buttons */}
				<div className="flex flex-col gap-2 px-5 pb-5">
					<button
						onClick={handleCopy}
						className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all
              ${copied
							? "bg-green-500 text-white"
							: "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white"
						}`}
						aria-label="Скопировать ссылку"
					>
						{copied ? "✓ Скопировано!" : "Скопировать ссылку"}
					</button>

					{shareSupported && (
						<button
							onClick={handleShare}
							className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-gray-100 dark:bg-gray-800
                         text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all"
							aria-label="Поделиться ссылкой"
						>
							Поделиться
						</button>
					)}

					<button
						onClick={handleCancel}
						disabled={cancelling}
						className="w-full py-3.5 rounded-2xl font-semibold text-sm text-red-600 dark:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
						aria-label="Отменить ссылку"
					>
						{cancelling ? "Отмена..." : "Отменить ссылку"}
					</button>
				</div>
			</div>
		</div>
	);
}