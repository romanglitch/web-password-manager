"use client";

import type { ViewMode } from "@/types";

interface ViewToggleProps {
	mode: ViewMode;
	onChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ mode, onChange }: ViewToggleProps) {
	return (
		<div
			className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1"
			role="group"
			aria-label="Режим отображения"
		>
			<button
				onClick={() => onChange("list")}
				className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
					mode === "list"
						? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
						: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
				}`}
				aria-label="Список"
				aria-pressed={mode === "list"}
			>
				<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
					<rect x="1" y="3" width="16" height="2" rx="1" fill="currentColor" />
					<rect x="1" y="8" width="16" height="2" rx="1" fill="currentColor" />
					<rect x="1" y="13" width="16" height="2" rx="1" fill="currentColor" />
				</svg>
			</button>
			<button
				onClick={() => onChange("grid")}
				className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
					mode === "grid"
						? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
						: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
				}`}
				aria-label="Сетка"
				aria-pressed={mode === "grid"}
			>
				<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
					<rect x="1" y="1" width="7" height="7" rx="1.5" fill="currentColor" />
					<rect x="10" y="1" width="7" height="7" rx="1.5" fill="currentColor" />
					<rect x="1" y="10" width="7" height="7" rx="1.5" fill="currentColor" />
					<rect x="10" y="10" width="7" height="7" rx="1.5" fill="currentColor" />
				</svg>
			</button>
		</div>
	);
}