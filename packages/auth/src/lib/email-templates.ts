export interface OTPEmailOptions {
  email: string;
  otp: string;
  type?: "sign-in" | "email-verification" | "other";
}

export function generateOTPEmail({
  email,
  otp,
  type = "sign-in",
}: OTPEmailOptions): string {
  const verificationText =
    type === "sign-in"
      ? "complete your sign in"
      : type === "email-verification"
        ? "verify your email address"
        : "reset your password";

  return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Verification Code</title>
	<style>
		body {
			margin: 0;
			padding: 0;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
			background-color: #fafafa;
			-webkit-font-smoothing: antialiased;
			-moz-osx-font-smoothing: grayscale;
		}
		.email-wrapper {
			width: 100%;
			background-color: #fafafa;
			padding: 40px 0;
		}
		.email-container {
			max-width: 600px;
			margin: 0 auto;
			background-color: #ffffff;
			border-radius: 12px;
			overflow: hidden;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		}
		.email-header {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			padding: 40px 20px;
			text-align: center;
		}
		.logo-icon {
			font-size: 48px;
			margin-bottom: 16px;
		}
		.email-header h1 {
			margin: 0;
			color: #ffffff;
			font-size: 28px;
			font-weight: 700;
			letter-spacing: -0.5px;
		}
		.email-header p {
			margin: 8px 0 0;
			color: rgba(255, 255, 255, 0.9);
			font-size: 15px;
		}
		.email-body {
			padding: 40px 30px;
		}
		.greeting {
			font-size: 16px;
			line-height: 1.6;
			color: #374151;
			margin-bottom: 30px;
			text-align: center;
		}
		.otp-container {
			background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
			border-radius: 12px;
			padding: 25px;
			margin: 30px 0;
			text-align: center;
			border: 2px solid #e5e7eb;
		}
		.otp-code {
			font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
			font-size: 36px;
			font-weight: 700;
			color: #667eea;
			margin: 0;
			user-select: all;
		}
		.expiry-notice {
			background-color: #fef3c7;
			border-left: 4px solid #f59e0b;
			padding: 12px 16px;
			margin: 24px 0;
			border-radius: 6px;
			font-size: 14px;
			color: #92400e;
			text-align: center;
		}
		.security-tip {
			background-color: #f3f4f6;
			border-radius: 8px;
			padding: 16px;
			margin: 24px 0;
			font-size: 13px;
			color: #4b5563;
			line-height: 1.5;
		}
		.security-tip strong {
			color: #1f2937;
		}
		.email-footer {
			padding: 30px;
			background-color: #f9fafb;
			text-align: center;
			border-top: 1px solid #e5e7eb;
		}
		.footer-text {
			font-size: 13px;
			color: #6b7280;
			line-height: 1.6;
			margin: 0 0 8px 0;
		}
		.footer-brand {
			font-size: 16px;
			font-weight: 700;
			color: #374151;
			margin: 12px 0 0 0;
		}
		@media only screen and (max-width: 600px) {
			.email-container {
				border-radius: 0;
			}
			.email-body {
				padding: 30px 20px;
			}
			.otp-code {
				font-size: 28px;
				letter-spacing: 4px;
			}
		}
	</style>
</head>
<body>
	<div class="email-wrapper">
		<div class="email-container">
			<div class="email-header">
				<div class="logo-icon">🔐</div>
				<h1>Verification Code</h1>
				<p>Secure access to your account</p>
			</div>
			<div class="email-body">
				<p class="greeting">
					${email ? `We've sent a verification code to <strong>${email}</strong>.<br>` : ""}
					Enter the code below to ${verificationText}.
				</p>
				<div class="otp-container">
					<p class="otp-code">${otp}</p>
				</div>
				<div class="expiry-notice">
					⏰ <strong>This code expires in 10 minutes</strong>
				</div>
				<div class="security-tip">
					<strong>🛡️ Security tip:</strong> Never share this code with anyone.
					Our team will never ask for your verification code.
				</div>
			</div>
			<div class="email-footer">
				<p class="footer-text">
					If you didn't request this code, please ignore this email.
				</p>
				<p class="footer-text">
					Thank you for choosing us!
				</p>
				<p class="footer-brand">Taleem</p>
			</div>
		</div>
	</div>
</body>
</html>`;
}
