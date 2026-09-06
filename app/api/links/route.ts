import { NextRequest, NextResponse } from "next/server";
import { createTemporaryLink } from "@/lib/temporary-links";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		const body = await request.json() as unknown;

		if (typeof body !== "object" || body === null) {
			return NextResponse.json({ error: "Неверный формат запроса" }, { status: 400 });
		}

		const { password } = body as Record<string, unknown>;

		if (typeof password !== "string" || password.length === 0) {
			return NextResponse.json({ error: "Пароль обязателен" }, { status: 400 });
		}

		if (password.length > 1000) {
			return NextResponse.json({ error: "Пароль слишком длинный" }, { status: 400 });
		}

		const { id, expiresAt } = createTemporaryLink(password);

		const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${request.nextUrl.protocol}//${request.nextUrl.host}`;
		const url = `${baseUrl}/${id}`;

		return NextResponse.json({ id, expiresAt, url }, { status: 201 });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Внутренняя ошибка сервера";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}