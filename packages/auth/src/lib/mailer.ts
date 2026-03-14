import { env } from "@client-pulse/env/server";
import { generateOTPEmail } from "./email-templates";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);
export async function sendOTPEmail(
	email: string,
	otp: string,
	type?: "sign-in" | "email-verification" | "other",
) {
	const emailHtml = generateOTPEmail({ email, otp, type });
	const subjectMap = {
		"sign-in": "Your Sign-In Verification Code",
		"email-verification": "Verify Your Email Address",
		other: "Your One-Time Password (OTP)",
	};

	const { data, error } = await resend.emails.send({
		from: `${env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`,
		to: [email],
		subject: subjectMap[type || "other"],
		html: emailHtml,
	});

	if (error) {
		console.error("Failed to send OTP email:", error);
		throw new Error("Failed to send OTP email");
	}

	return data;
}
