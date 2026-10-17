import { getRequest } from "@tanstack/react-start/server";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const CAPTCHA_AFTER = 3;

type LoginAttempt = {
	count: number;
	windowStart: number;
	lockedUntil: number;
};

const loginAttempts = new Map<string, LoginAttempt>();
const captchas = new Map<string, { answer: number; expiresAt: number }>();
export const lastResetLinks = new Map<string, string>();

export function getClientIp(): string {
	const request = getRequest();
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) {
		return forwarded.split(",")[0]?.trim() || "127.0.0.1";
	}
	return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

export function loginKey(ip: string, email: string): string {
	return `${ip}|${email.trim().toLowerCase()}`;
}

function pruneLogin(key: string) {
	const row = loginAttempts.get(key);
	if (!row) return;
	if (row.lockedUntil && row.lockedUntil < Date.now()) {
		loginAttempts.delete(key);
		return;
	}
	if (Date.now() - row.windowStart > LOGIN_WINDOW_MS && row.lockedUntil < Date.now()) {
		loginAttempts.delete(key);
	}
}

export function getLoginGate(key: string) {
	pruneLogin(key);
	const row = loginAttempts.get(key);
	if (row?.lockedUntil && row.lockedUntil > Date.now()) {
		return {
			locked: true,
			requireCaptcha: true,
			retryAfterSec: Math.ceil((row.lockedUntil - Date.now()) / 1000),
			remaining: 0,
		};
	}
	const count = row?.count ?? 0;
	return {
		locked: false,
		requireCaptcha: count >= CAPTCHA_AFTER,
		retryAfterSec: 0,
		remaining: Math.max(0, LOGIN_MAX_ATTEMPTS - count),
	};
}

export function recordLoginFailure(key: string) {
	pruneLogin(key);
	const existing = loginAttempts.get(key);
	const now = Date.now();
	if (!existing) {
		loginAttempts.set(key, { count: 1, windowStart: now, lockedUntil: 0 });
		return getLoginGate(key);
	}
	existing.count += 1;
	if (existing.count >= LOGIN_MAX_ATTEMPTS) {
		existing.lockedUntil = now + LOGIN_LOCK_MS;
	}
	return getLoginGate(key);
}

export function recordLoginSuccess(key: string) {
	loginAttempts.delete(key);
}

export function createCaptcha() {
	const a = 2 + Math.floor(Math.random() * 8);
	const b = 1 + Math.floor(Math.random() * 9);
	const captchaId = crypto.randomUUID();
	captchas.set(captchaId, { answer: a + b, expiresAt: Date.now() + 10 * 60 * 1000 });
	return { captchaId, question: `${a} + ${b} = ?` };
}

export function consumeCaptcha(captchaId: string, answer: string): boolean {
	const row = captchas.get(captchaId);
	captchas.delete(captchaId);
	if (!row || row.expiresAt < Date.now()) return false;
	return Number.parseInt(answer, 10) === row.answer;
}

