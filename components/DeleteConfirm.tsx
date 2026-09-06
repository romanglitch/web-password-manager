"use client";

import { useEffect, useRef } from "react";

interface DeleteConfirmProps {
	name: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export default function DeleteConfirm({ name, onConfirm, onCancel }: DeleteConfirmProps) {
	const cancelRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		cancelRef.current?.focus();
	}, []);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onCancel();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [onCancel]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4 pb-safe"
			role="dialog"
			aria-modal="true"
			aria-labelledby="delete-dialog-title"
			onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
		>
			<div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
				<div className="p-6">
					<h2
						id="delete-dialog-title"
						className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
					>
						Удалить пароль?
					</h2>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Удалить сохранённый пароль <strong className="text-gray-900 dark:text-white">&ldquo;{name}&rdquo;</strong>? Это действие нельзя отменить.
					</p>
				</div>
				<div className="flex border-t border-gray-200 dark:border-gray-700">
					<button
						ref={cancelRef}
						onClick={onCancel}
						className="flex-1 py-4 text-sm font-medium text-gray-700 dark:text-gray-300
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                       focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800"
					>
						Отмена
					</button>
					<div className="w-px bg-gray-200 dark:bg-gray-700" />
					<button
						onClick={onConfirm}
						className="flex-1 py-4 text-sm font-semibold text-red-600 dark:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors
                       focus:outline-none focus:bg-red-50 dark:focus:bg-red-900/20"
					>
						Удалить
					</button>
				</div>
			</div>
		</div>
	);
}