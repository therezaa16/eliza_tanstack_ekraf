import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { db, getUserRole, logAudit, removeUserRole, setUserRole } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export const userRoleSchema = z.object({
	userId: z.string().min(1),
	role: z.enum(["admin", "user"]),
});

export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
	await requireAdmin();
	return db.user.map((u) => ({
		id: u.id,
		email: u.email,
		name: u.name,
		role: getUserRole(u.id),
		emailVerified: !!u.emailVerified,
		createdAt: u.createdAt.toISOString(),
	}));
});

export const getAuditLog = createServerFn({ method: "GET" }).handler(async () => {
	await requireAdmin();
	return db.auditLog.slice(0, 20);
});

export const updateUserRole = createServerFn({ method: "POST" })
	.validator(userRoleSchema)
	.handler(async ({ data }) => {
		const admin = await requireAdmin();
		if (data.userId === admin.user.id && data.role !== "admin") {
			const err = new Error("Anda tidak dapat menurunkan peran akun sendiri.") as Error & {
				status?: number;
			};
			err.status = 400;
			throw err;
		}
		if (data.role === "user" && getUserRole(data.userId) === "admin") {
			const adminCount = db.userRole.filter((r) => r.role === "admin").length;
			if (adminCount <= 1) {
				const err = new Error("Tidak dapat menurunkan admin terakhir.") as Error & {
					status?: number;
				};
				err.status = 400;
				throw err;
			}
		}
		setUserRole(data.userId, data.role);
		logAudit({
			actorId: admin.user.id,
			actorEmail: admin.user.email,
			action: "user.role",
			detail: `${data.userId} -> ${data.role}`,
		});
		return { ok: true };
	});

export const deleteUser = createServerFn({ method: "POST" })
	.validator(z.object({ userId: z.string().min(1) }))
	.handler(async ({ data }) => {
		const admin = await requireAdmin();
		if (data.userId === admin.user.id) {
			const err = new Error("Anda tidak dapat menghapus akun sendiri.") as Error & {
				status?: number;
			};
			err.status = 400;
			throw err;
		}
		const role = getUserRole(data.userId);
		if (role === "admin") {
			const adminCount = db.userRole.filter((r) => r.role === "admin").length;
			if (adminCount <= 1) {
				const err = new Error("Tidak dapat menghapus administrator terakhir.") as Error & {
					status?: number;
				};
				err.status = 400;
				throw err;
			}
		}
		const target = db.user.find((u) => u.id === data.userId);
		db.user = db.user.filter((u) => u.id !== data.userId);
		removeUserRole(data.userId);
		db.session = db.session.filter((row) => {
			const session = row as { userId?: string };
			return session.userId !== data.userId;
		});
		logAudit({
			actorId: admin.user.id,
			actorEmail: admin.user.email,
			action: "user.delete",
			detail: target?.email ?? data.userId,
		});
		return { ok: true };
	});
