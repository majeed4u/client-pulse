import { betterFetch } from "@better-fetch/fetch";
import { env } from "@client-pulse/env/web";
import type { Session } from "better-auth/types";
import { type NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Portal routes are public — no auth needed
	if (pathname.startsWith("/portal")) {
		return NextResponse.next();
	}

	// Dashboard and onboarding routes require authentication
	if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
		const { data: session } = await betterFetch<Session>(
			"/api/auth/get-session",
			{
				baseURL: env.NEXT_PUBLIC_SERVER_URL,
				headers: {
					cookie: request.headers.get("cookie") ?? "",
				},
			},
		);

		if (!session) {
			return NextResponse.redirect(
				new URL(
					`/sign-in?redirect=${encodeURIComponent(pathname)}`,
					request.url,
				),
			);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/portal/:path*",
		"/onboarding/:path*",
		"/onboarding",
	],
};
