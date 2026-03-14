import { auth } from "@client-pulse/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const getAuth = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return session;
};

export const getCurrentUser = async () => {
	const session = await getAuth();
	if (!session) return null;
	return session?.user;
};

export const requireAuth = async () => {
	const session = await getAuth();
	if (!session) {
		redirect("/");
	}
	return session;
};
export const requireNoAuth = async () => {
	const session = await getAuth();
	if (session) {
		redirect("/");
	}
	return null;
};
