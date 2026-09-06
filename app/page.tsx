"use client";

import {useState, useCallback, useEffect, useRef} from "react";
import AuthGate from "@/components/AuthGate";
import PasswordForm from "@/components/PasswordForm";
import PasswordList from "@/components/PasswordList";
import ShareModal from "@/components/ShareModal";
import { usePasswords } from "@/hooks/usePasswords";
import type { DecryptedEntry } from "@/hooks/usePasswords";
import type { CreateLinkResponse } from "@/types";

export default function HomePage() {
  const [formPassword, setFormPassword] = useState("");
  const { passwords, loading, error, add, remove } = usePasswords();
  const [selectedEntry, setSelectedEntry] = useState<DecryptedEntry | null>(null);
  const [shareData, setShareData] = useState<CreateLinkResponse | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleSelect = useCallback((entry: DecryptedEntry) => {
    setSelectedEntry((prev) => (prev?.id === entry.id ? null : entry));
    setSendError(null);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedEntry(null);
    setSendError(null);
  }, []);

  const sendingRef = useRef(false);

  const handleSend = useCallback(async (password: string) => {
    if (!password.trim() || sending || sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setSendError(null);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error ?? "Ошибка создания ссылки");
      }

      const data = await response.json() as CreateLinkResponse;
      setShareData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Неизвестная ошибка";
      setSendError(message);
    } finally {
      setSending(false);
      sendingRef.current = false;
    }
  }, [sending]);

  const handleShareCancel = useCallback(() => {
    setShareData(null);
    setSelectedEntry(null);
  }, []);

  const handleShareExpired = useCallback(() => {
    setShareData(null);
  }, []);

  // Подставлять пароль при выборе записи
  useEffect(() => {
    if (selectedEntry) {
      setFormPassword(selectedEntry.password);
    }
  }, [selectedEntry]);

  return (
      <AuthGate>
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="max-w-sm mx-auto px-4 pt-safe pb-32">
            {/* Header */}
            <header className="pt-6 pb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Менеджер паролей
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Пароли хранятся только на вашем устройстве
              </p>
            </header>

            {/* Error banner */}
            {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" role="alert">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Password Form */}
            <section className="mb-3" aria-label="Добавить пароль">
              <PasswordForm
                  selectedEntry={selectedEntry}
                  passwordValue={formPassword}
                  onPasswordChange={setFormPassword}
                  onAdd={add}
                  onSend={handleSend}
                  onClearSelection={() => {
                    handleClearSelection();
                    setFormPassword("");
                  }}
                  sending={sending}
              />
              {sendError && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2 px-1" role="alert">
                    {sendError}
                  </p>
              )}
            </section>

            {/* Password List */}
            <PasswordList
                passwords={passwords}
                loading={loading}
                selectedId={selectedEntry?.id ?? null}
                onSelect={handleSelect}
                onDelete={remove}
            />
          </div>

          {/* Share Modal */}
          {shareData && (
              <ShareModal
                  linkId={shareData.id}
                  linkUrl={shareData.url}
                  expiresAt={shareData.expiresAt}
                  onCancel={handleShareCancel}
                  onExpired={handleShareExpired}
              />
          )}
        </main>
      </AuthGate>
  );
}