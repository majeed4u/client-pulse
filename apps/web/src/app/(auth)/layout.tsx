import type React from "react";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="mx-auto flex h-full max-w-7xl flex-col items-center justify-center">
			{children}
		</div>
	);
}
