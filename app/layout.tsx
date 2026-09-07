import type {Metadata, Viewport} from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Менеджер паролей",
	description: "Безопасное хранение паролей на вашем устройстве",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default"
	},
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
	themeColor: [
		{media: "(prefers-color-scheme: light)", color: "white"},
		{media: "(prefers-color-scheme: dark)", color: "black"},
	],
};

export default function RootLayout({children}: { children: React.ReactNode }) {
	return (
		<html lang="ru" suppressHydrationWarning>
		<head>
			<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96"/>
			<link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
			<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
			<link rel="manifest" href="/site.webmanifest"/>
			<meta name="apple-mobile-web-app-title" content="PM"/>
			<meta name="mobile-web-app-capable" content="yes"/>
			<meta name="apple-mobile-web-app-capable" content="yes"/>
		</head>
		<body
			className="antialiased font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden	">
		{children}
		</body>
		</html>
	);
}