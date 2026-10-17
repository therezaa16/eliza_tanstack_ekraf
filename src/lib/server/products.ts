import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { type Product, db, logAudit } from "@/lib/db";
import { assertProductImage } from "@/lib/image";
import { sanitizeText } from "@/lib/password";
import { requireAdmin, requireAuth } from "@/lib/session";

export const productSchema = z.object({
	name: z.string().trim().min(2, "Nama karya wajib diisi").max(80),
	description: z.string().trim().min(8, "Deskripsi minimal 8 karakter").max(400),
	price: z.coerce.number().min(0, "Harga tidak boleh negatif").max(100_000_000),
	stock: z.coerce.number().int("Stok harus bilangan bulat").min(0).max(100_000),
	category: z.enum(PRODUCT_CATEGORIES),
	artisan: z.string().trim().min(2, "Nama pelaku ekraf wajib diisi").max(80),
	image: z.string().nullable().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

function normalizeProductInput(data: ProductInput) {
	return {
		name: sanitizeText(data.name, 80),
		description: sanitizeText(data.description, 400),
		artisan: sanitizeText(data.artisan, 80),
		category: data.category,
		price: data.price,
		stock: data.stock,
		image: assertProductImage(data.image ?? null),
	};
}

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
	await requireAuth();
	return [...db.product].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) as Product[];
});

export const createProduct = createServerFn({ method: "POST" })
	.validator(productSchema)
	.handler(async ({ data }) => {
		const admin = await requireAdmin();
		const clean = normalizeProductInput(data);
		const now = new Date().toISOString();
		const product = {
			id: crypto.randomUUID(),
			...clean,
			createdAt: now,
			updatedAt: now,
		} as Product;
		db.product.push(product);
		logAudit({
			actorId: admin.user.id,
			actorEmail: admin.user.email,
			action: "product.create",
			detail: product.name,
		});
		return product;
	});

export const updateProduct = createServerFn({ method: "POST" })
	.validator(
		z.object({
			id: z.string().min(1),
			...productSchema.shape,
		}),
	)
	.handler(async ({ data }) => {
		const admin = await requireAdmin();
		const index = db.product.findIndex((p) => p.id === data.id);
		if (index === -1) {
			const err = new Error("Karya tidak ditemukan") as Error & { status?: number };
			err.status = 404;
			throw err;
		}
		const clean = normalizeProductInput(data);
		const now = new Date().toISOString();
		const updated = {
			...db.product[index],
			...clean,
			updatedAt: now,
		} as Product;
		db.product[index] = updated;
		logAudit({
			actorId: admin.user.id,
			actorEmail: admin.user.email,
			action: "product.update",
			detail: updated.name,
		});
		return updated;
	});

export const deleteProduct = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		const admin = await requireAdmin();
		const index = db.product.findIndex((p) => p.id === data.id);
		if (index === -1) {
			const err = new Error("Karya tidak ditemukan") as Error & { status?: number };
			err.status = 404;
			throw err;
		}
		const name = db.product[index].name;
		db.product.splice(index, 1);
		logAudit({
			actorId: admin.user.id,
			actorEmail: admin.user.email,
			action: "product.delete",
			detail: name,
		});
		return { ok: true };
	});
