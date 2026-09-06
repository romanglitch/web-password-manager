import { NextRequest, NextResponse } from "next/server";

// Пропускаем через [id] только строки формата: буква + 2 цифры
const TEMP_LINK_RE = /^\/[a-z]\d{2}$/;

// Пути, которые никогда не должны попасть в [id]
const BYPASS_RE = /^\/(api|_next|favicon\.ico|robots\.txt|manifest\.json|icons)/;

export function middleware(request: NextRequest): NextResponse {
	const { pathname } = request.nextUrl;

	// Системные пути — пропускаем как есть
	if (BYPASS_RE.test(pathname)) {
		return NextResponse.next();
	}

	// Корень — пропускаем как есть
	if (pathname === "/") {
		return NextResponse.next();
	}

	// Формат временной ссылки — разрешаем
	if (TEMP_LINK_RE.test(pathname)) {
		return NextResponse.next();
	}

	// Всё остальное — 404
	return NextResponse.rewrite(new URL("/not-found", request.url));
}

export const config = {
	// Применяем ко всем путям кроме статики Next.js
	matcher: ["/((?!_next/static|_next/image).*)"],
};