"use client";

import { useState } from "react";
import type { DecryptedEntry } from "@/hooks/usePasswords";

interface PasswordCardProps {
	entry: DecryptedEntry;
	isSelected: boolean;
	viewMode: "list" | "grid";
	onSelect: (entry: DecryptedEntry) => void;
	onDelete: (entry: DecryptedEntry) => void;
}

const AVATAR_COLORS = [
	"bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500",
	"bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-red-500",
];

function getAvatarColor(name: string): string {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function PasswordCard({ entry, isSelected, viewMode, onSelect, onDelete }: PasswordCardProps) {
	const [visible, setVisible] = useState(false);
	const avatarColor = getAvatarColor(entry.name);
	const initial = entry.name.charAt(0).toUpperCase();

	if (viewMode === "grid") {
		return (
			<div
				className={`relative rounded-2xl p-4 cursor-pointer transition-all select-none
          ${isSelected
					? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
					: "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 shadow-sm hover:shadow-md"
				}`}
				onClick={() => onSelect(entry)}
				role="button"
				tabIndex={0}
				aria-label={`Выбрать пароль ${entry.name}`}
				aria-pressed={isSelected}
				onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(entry); } }}
			>
				<div className="flex flex-col items-center gap-3">
					<div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}
						 aria-hidden="true">
						{initial}
					</div>
					<div className="w-full text-center">
						<p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{entry.name}</p>
						<p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
							{visible ? entry.password : "••••••••"}
						</p>
					</div>
				</div>
				<div className="flex items-center justify-center gap-2 mt-3">
					<button
						onClick={(e) => { e.stopPropagation(); setVisible((v) => !v); }}
						className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
						aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
					>
						{visible ? <EyeOffIcon /> : <EyeIcon />}
					</button>
					<button
						onClick={(e) => { e.stopPropagation(); onDelete(entry); }}
						className="p-2 rounded-lg text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
						aria-label={`Удалить пароль ${entry.name}`}
					>
						<TrashIcon />
					</button>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all select-none
        ${isSelected
				? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
				: "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 shadow-sm hover:shadow-md"
			}`}
			onClick={() => onSelect(entry)}
			role="button"
			tabIndex={0}
			aria-label={`Выбрать пароль ${entry.name}`}
			aria-pressed={isSelected}
			onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(entry); } }}
		>
			<div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-base flex-shrink-0`}
				 aria-hidden="true">
				{initial}
			</div>
			<div className="flex-1 min-w-0">
				<p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{entry.name}</p>
				<p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
					{visible ? entry.password : "••••••••"}
				</p>
			</div>
			<div className="flex items-center gap-1 flex-shrink-0">
				<button
					onClick={(e) => { e.stopPropagation(); setVisible((v) => !v); }}
					className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                     hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
					aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
				>
					{visible ? <EyeOffIcon /> : <EyeIcon />}
				</button>
				<button
					onClick={(e) => { e.stopPropagation(); onDelete(entry); }}
					className="p-2 rounded-lg text-red-400 hover:text-red-600 dark:text-red-400
                     hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
					aria-label={`Удалить пароль ${entry.name}`}
				>
					<TrashIcon />
				</button>
			</div>
		</div>
	);
}

function EyeIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	);
}

function EyeOffIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
			<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
			<line x1="1" y1="1" x2="23" y2="23" />
		</svg>
	);
}

function TrashIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<polyline points="3 6 5 6 21 6" />
			<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
			<path d="M10 11v6M14 11v6" />
			<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
		</svg>
	);
}