import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Менеджер паролей",
  description: "Безопасное хранение паролей на вашем устройстве",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Пароли",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="ru" suppressHydrationWarning>
      <head>
          <meta name="mobile-web-app-capable" content="yes"/>
          <meta name="apple-mobile-web-app-capable" content="yes"/>
          <meta name="theme-color" content="#f9fafb" media="(prefers-color-scheme: light)"/>
          <meta name="theme-color" content="#030712" media="(prefers-color-scheme: dark)"/>
          <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96"/>
          <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
          <link rel="shortcut icon" href="/favicon.ico"/>
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
          <meta name="apple-mobile-web-app-title" content="PM"/>
          <link rel="manifest" href="/site.webmanifest"/>
      </head>
      <body className="antialiased font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
        {children}
      </body>
      </html>
  );
}