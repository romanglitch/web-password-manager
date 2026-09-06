import type {Metadata, Viewport} from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Менеджер паролей",
	description: "Безопасное хранение паролей на вашем устройстве",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default"
	},
	manifest: "/manifest.json",
	icons: {
		icon: "/favicon.ico",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: "cover",
};

export default function RootLayout({children}: { children: React.ReactNode }) {
	return (
		<html lang="ru" suppressHydrationWarning>
		<head>
			<meta name="mobile-web-app-capable" content="yes"/>
			<meta name="apple-mobile-web-app-capable" content="yes"/>
			<meta name="apple-mobile-web-app-title" content="PM"/>
			<meta name="theme-color" content="#f9fafb" media="(prefers-color-scheme: light)"/>
			<meta name="theme-color" content="#030712" media="(prefers-color-scheme: dark)"/>
		</head>
		<body className="antialiased font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden	">
			{children}
		</body>
		</html>
	);
}