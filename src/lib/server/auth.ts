import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import {
	SEED_ADMIN_EMAIL,
	SEED_ADMIN_PASSWORD,
	db,
	getUserRole,
	logAudit,
	setUserRole,
} from "@/lib/db";
import { sanitizeText, strongPasswordSchema } from "@/lib/password";
import {
	consumeCaptcha,
	createCaptcha,
	getClientIp,
	getLoginGate,
	lastResetLinks,
	loginKey,
	recordLoginFailure,
	recordLoginSuccess,
} from "@/lib/security";
import { getCurrentSession } from "@/lib/session";

export const getServerSession = createServerFn({ method: "GET" }).handler(async () => {
	return getCurrentSession();
});

export const getMe = createServerFn({ method: "GET" }).handler(async () => {
	const { session, user } = await getCurrentSession();
	if (!session || !user) return null;
	return {
		id: user.id,
		email: user.email,
		name: user.name,
		role: getUserRole(user.id),
	};
});

export const seedAdmin = createServerFn({ method: "POST" }).handler(async () => {
	const hasAdmin = db.user.some((u) => {
		const role = db.userRole.find((r) => r.userId === u.id)?.role;
		return role === "admin";
	});
	if (hasAdmin) {
		return { ok: true, alreadySeeded: true, admin: SEED_ADMIN_EMAIL };
	}

	await auth.api.signUpEmail({
		body: {
			email: SEED_ADMIN_EMAIL,
			password: SEED_ADMIN_PASSWORD,
			name: "Pengelola KaryaLokal",
		},
		headers: new Headers(),
	});

	const adminUser = db.user.find((u) => u.email === SEED_ADMIN_EMAIL);
	if (adminUser) {
		const existing = db.userRole.find((r) => r.userId === adminUser.id);
		if (existing) {
			existing.role = "admin";
		} else {
			db.userRole.push({ userId: adminUser.id, role: "admin" });
		}
	}

	const now = new Date().toISOString();
	const products = [
		{
			name: "Tenun Ikat Flores",
			description: "Kain tenun ikat buatan pengrajin Sikka, pewarna alami.",
			price: 450000,
			stock: 8,
			category: "kriya" as const,
			artisan: "Koperasi Sikka Indah",
		},
		{
			name: "Batik Tulis Mega Mendung",
			description: "Batik tulis Cirebon motif mega mendung, katun prima.",
			price: 275000,
			stock: 14,
			category: "fashion" as const,
			artisan: "Batik Sari Wangi",
		},
		{
			name: "Kopi Gayo Honey Process",
			description: "Biji kopi Arabika Gayo proses honey, roasting medium.",
			price: 95000,
			stock: 40,
			category: "kuliner" as const,
			artisan: "Gayo Highland Roastery",
		},
	].map((p) => ({
		id: crypto.randomUUID(),
		...p,
		image: null,
		createdAt: now,
		updatedAt: now,
	}));
	db.product.push(...products);

	if (adminUser) {
		logAudit({
			actorId: adminUser.id,
			actorEmail: adminUser.email,
			action: "seed",
			detail: "Akun admin dan 3 karya contoh dibuat",
		});
	}

	return { ok: true, alreadySeeded: false, admin: SEED_ADMIN_EMAIL };
});

const loginSchema = z.object({
	email: z.string().trim().email("Email tidak valid"),
	password: z.string().min(1, "Kata sandi wajib diisi"),
	captchaId: z.string().optional(),
	captchaAnswer: z.string().optional(),
});

export const getLoginChallenge = createServerFn({ method: "POST" })
	.validator(z.object({ email: z.string().trim().email() }))
	.handler(async ({ data }) => {
		const key = loginKey(getClientIp(), data.email);
		const gate = getLoginGate(key);
		if (gate.requireCaptcha && !gate.locked) {
			const captcha = createCaptcha();
			return { ...gate, ...captcha };
		}
		return { ...gate, captchaId: null as string | null, question: null as string | null };
	});

export const attemptLogin = createServerFn({ method: "POST" })
	.validator(loginSchema)
	.handler(async ({ data }) => {
		const request = getRequest();
		const key = loginKey(getClientIp(), data.email);
		const gate = getLoginGate(key);
		if (gate.locked) {
			const err = new Error(
				`Terlalu banyak percobaan. Coba lagi dalam ${gate.retryAfterSec} detik.`,
			) as Error & { status?: number };
			err.status = 429;
			throw err;
		}
		if (gate.requireCaptcha) {
			if (!data.captchaId || !data.captchaAnswer?.trim()) {
				const err = new Error("Selesaikan verifikasi angka terlebih dahulu.") as Error & {
					status?: number;
				};
				err.status = 400;
				throw err;
			}
			if (!consumeCaptcha(data.captchaId, data.captchaAnswer.trim())) {
				recordLoginFailure(key);
				const err = new Error("Verifikasi angka salah. Muat ulang soal.") as Error & {
					status?: number;
				};
				err.status = 400;
				throw err;
			}
		}

		try {
			await auth.api.signInEmail({
				body: {
					email: data.email.trim().toLowerCase(),
					password: data.password,
				},
				headers: request.headers,
			});
			recordLoginSuccess(key);
			return { ok: true };
		} catch {
			const next = recordLoginFailure(key);
			const extra = next.locked
				? " Akun dikunci sementara karena terlalu banyak percobaan."
				: next.requireCaptcha
					? " Verifikasi tambahan diperlukan."
					: ` Sisa percobaan: ${next.remaining}.`;
			const err = new Error(`Email atau kata sandi salah.${extra}`) as Error & { status?: number };
			err.status = 401;
			throw err;
		}
	});

const signUpSchema = z.object({
	name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
	email: z.string().trim().email("Email tidak valid"),
	password: strongPasswordSchema,
});

export const attemptSignUp = createServerFn({ method: "POST" })
	.validator(signUpSchema)
	.handler(async ({ data }) => {
		const request = getRequest();
		const name = sanitizeText(data.name, 80);
		const email = data.email.trim().toLowerCase();
		try {
			await auth.api.signUpEmail({
				body: {
					email,
					password: data.password,
					name,
				},
				headers: request.headers,
			});
		} catch {
			const err = new Error("Pendaftaran gagal. Email mungkin sudah terdaftar.") as Error & {
				status?: number;
			};
			err.status = 400;
			throw err;
		}
		const created = db.user.find((u) => u.email === email);
		if (created) {
			setUserRole(created.id, "user");
		}
		return { ok: true };
	});

export const requestPasswordReset = createServerFn({ method: "POST" })
	.validator(z.object({ email: z.string().trim().email() }))
	.handler(async ({ data }) => {
		const email = data.email.trim().toLowerCase();
		const request = getRequest();
		try {
			await auth.api.requestPasswordReset({
				body: {
					email,
					redirectTo: "/reset-password",
				},
				headers: request.headers,
			});
		} catch {
			// Don't leak whether the email exists.
		}
		const resetUrl = lastResetLinks.get(email) ?? null;
		lastResetLinks.delete(email);
		return {
			ok: true,
			message: resetUrl
				? "Tidak ada layanan email pada aplikasi in-memory ini. Gunakan tautan sekali pakai di bawah."
				: "Jika email terdaftar, tautan reset akan dikirim.",
			resetUrl,
		};
	});

export const resetPasswordWithToken = createServerFn({ method: "POST" })
	.validator(
		z.object({
			token: z.string().min(8),
			password: strongPasswordSchema,
		}),
	)
	.handler(async ({ data }) => {
		try {
			await auth.api.resetPassword({
				body: {
					newPassword: data.password,
					token: data.token,
				},
			});
		} catch {
			const err = new Error("Tautan reset tidak valid atau sudah kedaluwarsa.") as Error & {
				status?: number;
			};
			err.status = 400;
			throw err;
		}
		return { ok: true };
	});
