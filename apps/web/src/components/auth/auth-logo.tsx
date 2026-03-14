export const AuthLogo = ({ text }: { text?: string }) => {
	return (
		<div className="space-y-4">
			<div className="text-center">
				<strong className="rounded-sm bg-primary px-2 text-2xl text-secondary">
					C
				</strong>{" "}
				<span className="-ml-0.5 text-2xl tracking-wide">lient Pulse</span>
			</div>
			<p className="text-center font-semibold text-base">{text}</p>
		</div>
	);
};
