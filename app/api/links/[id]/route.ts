import { NextRequest, NextResponse } from "next/server";
import { getTemporaryLink, deleteTemporaryLink } from "@/lib/temporary-links";

export const runtime = "nodejs";

export async function GET(
	_request: NextRequest,
	context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const { id } = await context.params;

	if (!id || typeof id !== "string" || id.length > 20) {
		return NextResponse.json({ error: "Неверный идентификатор" }, { status: 400 });
	}

	const link = getTemporaryLink(id);

	if (!link) {
		return NextResponse.json({ error: "Ссылка не найдена или уже истекла" }, { status: 404 });
	}

	return NextResponse.json({
		password: link.password,
		expiresAt: link.expiresAt,
		remainingSeconds: link.remainingSeconds,
	});
}

export async function DELETE(
	_request: NextRequest,
	context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const { id } = await context.params;

	if (!id || typeof id !== "string" || id.length > 20) {
		return NextResponse.json({ error: "Неверный идентификатор" }, { status: 400 });
	}

	deleteTemporaryLink(id);
	return NextResponse.json({ success: true });
}