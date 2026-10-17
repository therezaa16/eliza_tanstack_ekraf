import { memoryAdapter } from "better-auth/adapters/memory";

import type { ProductCategory } from "./constants";

export type Role = "admin" | "user";

export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	stock: number;
	category: ProductCategory;
	artisan: string;
	image: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface UserRole {
	userId: string;
	role: Role;
}

export interface AuditEntry {
	id: string;
	at: string;
	actorId: string;
	actorEmail: string;
	action: string;
	detail: string;
}

/**
 * In-memory development database.
 *
 * better-auth owns the `user`, `session`, `account` and `verification` tables
 * (managed through `memoryAdapter`). This app adds `product`, `userRole`, and
 * `auditLog`.
 *
 * NOTE: this is memory only. Data survives within a single running server
 * process (local dev, or one warmed Vercel serverless instance) but is reset
 * on every redeploy / cold start. There is no persistent database by design.
 */
const memoryDb = {
	user: [] as Array<{
		id: string;
		email: string;
		name: string | null;
		image: string | null;
		emailVerified: boolean;
		emailVerifiedAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
		lastSignInAt: Date | null;
	}>,
	session: [] as unknown[],
	account: [] as unknown[],
	verification: [] as unknown[],
	product: [] as Product[],
	userRole: [] as UserRole[],
	auditLog: [] as AuditEntry[],
};

export const adapter = memoryAdapter(memoryDb);
export const db = memoryDb;

export const SEED_ADMIN_EMAIL = "admin@example.com";
export const SEED_ADMIN_PASSWORD = "admin12345";

export function getUserRole(userId: string): Role {
	return db.userRole.find((r) => r.userId === userId)?.role ?? "user";
}

export function setUserRole(userId: string, role: Role) {
	const existing = db.userRole.find((r) => r.userId === userId);
	if (existing) {
		existing.role = role;
	} else {
		db.userRole.push({ userId, role });
	}
}

export function removeUserRole(userId: string) {
	db.userRole = db.userRole.filter((r) => r.userId !== userId);
}

export function logAudit(entry: Omit<AuditEntry, "id" | "at">) {
	db.auditLog.unshift({
		id: crypto.randomUUID(),
		at: new Date().toISOString(),
		...entry,
	});
	if (db.auditLog.length > 80) {
		db.auditLog.length = 80;
	}
}
