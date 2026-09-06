"use client";

import { useState, useRef, useId } from "react";
import type { DecryptedEntry } from "@/hooks/usePasswords";

interface PasswordFormProps {
	selectedEntry: DecryptedEntry | null;
	passwordValue: string;
	onPasswordChange: (v: string) => void;
	onAdd: (name: string, password: string) => Promise<{ success: boolean; error?: string }>;
	onSend: (password: string) => Promise<void>;
	onClearSelection: () => void;
	sending: boolean;
}

export default function PasswordForm({
										 selectedEntry,
										 passwordValue,
										 onPasswordChange,
										 onAdd,
										 onSend,
										 onClearSelection,
										 sending,
									 }: PasswordFormProps) {
	const [showPassword, setShowPassword] = useState(false);
	const [showNameField, setShowNameField] = useState(false);
	const [name, setName] = useState("");
	const [addError, setAddError] = useState<string | null>(null);
	const [adding, setAdding] = useState(false);
	const nameInputRef = useRef<HTMLInputElement>(null);
	const passwordId = useId();
	const nameId = useId();

	const handleAddClick = () => {
		setShowNameField(true);
		setAddError(null);
		setTimeout(() => nameInputRef.current?.focus(), 50);
	};

	const handleSave = async () => {
		setAddError(null);
		setAdding(true);
		const result = await onAdd(name, passwordValue);
		setAdding(false);
		if (result.success) {
			onPasswordChange("");
			setName("");
			setShowNameField(false);
			setShowPassword(false);
		} else {
			setAddError(result.error ?? "Ошибка сохранения");
		}
	};

	const handleSend = async () => {
		if (!passwordValue.trim() || sending) return;
		await onSend(passwordValue);
		onClearSelection()
	};

	const handlePasswordChange = (value: string) => {
		onPasswordChange(value.slice(0, 1000));
		if (selectedEntry) {
			onClearSelection();
		}
		if (showNameField && !value.trim()) {
			setShowNameField(false);
			setName("");
			setAddError(null);
		}
	};

	const canAdd = passwordValue.trim().length > 0;
	const canSend = passwordValue.trim().length > 0 && !sending;
	const showSendButton = selectedEntry !== null;

	return (
		<div className="space-y-3">
			{selectedEntry && (
				<div className="selected-entry flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
					<div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" aria-hidden="true" />
					<p className="text-sm text-blue-700 dark:text-blue-300 flex-1 min-w-0 truncate">
						Выбран: <strong>{selectedEntry.name}</strong>
					</p>
					<button
						id="clear-selection"
						onClick={onClearSelection}
						className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 text-xs underline flex-shrink-0"
						aria-label="Снять выбор"
					>
						<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 24 24">
							<path d="M 4.9902344 3.9902344 A 1.0001 1.0001 0 0 0 4.2929688 5.7070312 L 10.585938 12 L 4.2929688 18.292969 A 1.0001 1.0001 0 1 0 5.7070312 19.707031 L 12 13.414062 L 18.292969 19.707031 A 1.0001 1.0001 0 1 0 19.707031 18.292969 L 13.414062 12 L 19.707031 5.7070312 A 1.0001 1.0001 0 0 0 18.980469 3.9902344 A 1.0001 1.0001 0 0 0 18.292969 4.2929688 L 12 10.585938 L 5.7070312 4.2929688 A 1.0001 1.0001 0 0 0 4.9902344 3.9902344 z"></path>
						</svg>
					</button>
				</div>
			)}

			{/* Password input */}
			<div>
				<label htmlFor={passwordId} className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 sr-only">
					Пароль
				</label>
				<div className="relative">
					<input
						id={passwordId}
						type={showPassword ? "text" : "password"}
						value={passwordValue}
						onChange={(e) => handlePasswordChange(e.target.value)}
						placeholder="Введите пароль"
						className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-gray-200 dark:border-gray-700
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                       text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all"
						autoComplete="off"
						aria-label="Пароль"
						aria-describedby={addError ? `${passwordId}-error` : undefined}
					/>
					<button
						type="button"
						onClick={() => setShowPassword((v) => !v)}
						className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                       transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
						aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
						tabIndex={0}
					>
						{showPassword ? <EyeOffIcon /> : <EyeIcon />}
					</button>
				</div>
			</div>

			{/* Name field — appears after clicking "Добавить" */}
			{showNameField && (
				<div className="space-y-2 animate-fade-in add-form">
					<div>
						<label htmlFor={nameId} className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
							Название <span className="text-red-500" aria-hidden="true">*</span>
						</label>
						<input
							id={nameId}
							ref={nameInputRef}
							type="text"
							value={name}
							onChange={(e) => { setName(e.target.value.slice(0, 100)); setAddError(null); }}
							placeholder="Например: Wi-Fi, Почта, Банк"
							className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                         text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
							autoComplete="off"
							aria-label="Название пароля"
							aria-required="true"
							onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
						/>
					</div>

					{addError && (
						<p id={`${passwordId}-error`} className="text-sm text-red-600 dark:text-red-400 px-1" role="alert">
							{addError}
						</p>
					)}

					<div className="flex gap-2">
						<button
							onClick={() => { setShowNameField(false); setName(""); setAddError(null); }}
							className="flex-1 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700
                         text-sm font-semibold text-gray-700 dark:text-gray-300
                         hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all"
						>
							Отмена
						</button>
						<button
							onClick={handleSave}
							disabled={adding || !name.trim() || !passwordValue.trim()}
							className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white
                         text-sm font-semibold active:scale-95 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
							aria-label="Сохранить пароль"
						>
							{adding ? "Сохранение..." : "Сохранить"}
						</button>
					</div>
				</div>
			)}

			{/* Action buttons */}
			{!showNameField && (
				<div className="flex gap-2">
					{canAdd && (
						<button
							onClick={handleAddClick}
							className="action-btn flex-1 py-3.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900
                         text-sm font-semibold hover:bg-gray-700 dark:hover:bg-gray-100 active:scale-95 transition-all"
							aria-label="Добавить пароль"
						>
							Добавить
						</button>
					)}
					{showSendButton && (
						<button
							onClick={handleSend}
							disabled={!canSend}
							className="action-btn flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white
                         text-sm font-semibold active:scale-95 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
							aria-label="Отправить пароль по временной ссылке"
						>
							{sending ? "Создание ссылки..." : "Отправить"}
						</button>
					)}
				</div>
			)}
		</div>
	);
}

function EyeIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	);
}

function EyeOffIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
			<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
			<line x1="1" y1="1" x2="23" y2="23" />
		</svg>
	);
}