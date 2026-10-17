import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { adapter } from "./db";

const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
	database: adapter,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		minPasswordLength: 8,
		maxPasswordLength: 128,
		sendResetPassword: async ({ user, url }) => {
			const { lastResetLinks } = await import("./security");
			lastResetLinks.set(user.email.toLowerCase(), url);
		},
	},
	session: {
		expiresIn: 60 * 60 * 8,
		updateAge: 60 * 30,
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5,
		},
	},
	advanced: {
		useSecureCookies: isProd,
		defaultCookieAttributes: {
			httpOnly: true,
			sameSite: "lax",
			path: "/",
			secure: isProd,
		},
	},
	plugins: [tanstackStartCookies()],
});

export default auth;
