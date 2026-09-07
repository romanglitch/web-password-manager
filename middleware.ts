import { NextRequest, NextResponse } from "next/server";

// Пропускаем через [id] только строки формата: буква + 2 цифры
const TEMP_LINK_RE = /^\/[a-z]\d{2}$/;

// Пути без расширения, которые никогда не должны попасть в [id]
const BYPASS_PATHS_RE = /^\/(api|_next|icons)(\/|$)/;

export function middleware(request: NextRequest): NextResponse {
	const { pathname } = request.nextUrl;

	// Системные пути без расширения — пропускаем
	if (BYPASS_PATHS_RE.test(pathname)) {
		return NextResponse.next();
	}

	// Корень — пропускаем
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
	// Исключаем статику Next.js и ВСЕ файлы с расширением (.json, .png, .ico, .txt и т.д.)
	// Middleware не будет их перехватывать, они отдаются напрямую из public/
	matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};