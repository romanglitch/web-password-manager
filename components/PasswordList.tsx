"use client";

import { useState } from "react";
import type { DecryptedEntry } from "@/hooks/usePasswords";
import type { ViewMode } from "@/types";
import PasswordCard from "./PasswordCard";
import ViewToggle from "./ViewToggle";
import DeleteConfirm from "./DeleteConfirm";

interface PasswordListProps {
	passwords: DecryptedEntry[];
	loading: boolean;
	selectedId: string | null;
	onSelect: (entry: DecryptedEntry) => void;
	onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export default function PasswordList({
										 passwords,
										 loading,
										 selectedId,
										 onSelect,
										 onDelete,
									 }: PasswordListProps) {
	const [viewMode, setViewMode] = useState<ViewMode>("list");
	const [deleteTarget, setDeleteTarget] = useState<DecryptedEntry | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const handleDeleteConfirm = async () => {
		if (!deleteTarget) return;
		const result = await onDelete(deleteTarget.id);
		if (result.success) {
			setDeleteTarget(null);
			setDeleteError(null);
		} else {
			setDeleteError(result.error ?? "Ошибка удаления");
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12" aria-live="polite" aria-busy="true">
				<div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
					 aria-label="Загрузка паролей" />
			</div>
		);
	}

	return (
		<section aria-label="Сохранённые пароли">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-base font-semibold text-gray-900 dark:text-white">
					Сохранённые пароли
					{passwords.length > 0 && (
						<span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
              ({passwords.length})
            </span>
					)}
				</h2>
				{passwords.length > 0 && (
					<ViewToggle mode={viewMode} onChange={setViewMode} />
				)}
			</div>

			{deleteError && (
				<p className="text-sm text-red-600 dark:text-red-400 mb-3" role="alert">{deleteError}</p>
			)}

			{passwords.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4" aria-hidden="true">
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
							<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
							<path d="M7 11V7a5 5 0 0 1 10 0v4" />
						</svg>
					</div>
					<p className="text-gray-500 dark:text-gray-400 font-medium">Сохранённых паролей пока нет</p>
					<p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Добавьте первый пароль выше</p>
				</div>
			) : viewMode === "list" ? (
				<div className="flex flex-col gap-2" role="list">
					{passwords.map((entry) => (
						<div key={entry.id} role="listitem">
							<PasswordCard
								entry={entry}
								isSelected={selectedId === entry.id}
								viewMode="list"
								onSelect={onSelect}
								onDelete={setDeleteTarget}
							/>
						</div>
					))}
				</div>
			) : (
				<div className="grid grid-cols-2 gap-3" role="list">
					{passwords.map((entry) => (
						<div key={entry.id} role="listitem">
							<PasswordCard
								entry={entry}
								isSelected={selectedId === entry.id}
								viewMode="grid"
								onSelect={onSelect}
								onDelete={setDeleteTarget}
							/>
						</div>
					))}
				</div>
			)}

			{deleteTarget && (
				<DeleteConfirm
					name={deleteTarget.name}
					onConfirm={handleDeleteConfirm}
					onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
				/>
			)}
		</section>
	);
}