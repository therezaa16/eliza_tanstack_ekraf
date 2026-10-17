import { CLIENT_MAX_EDGE } from "./image";

export async function normalizeProductImage(source: File | string): Promise<string> {
	const bitmap = await loadBitmap(source);
	const scale = Math.min(1, CLIENT_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
	const width = Math.max(1, Math.round(bitmap.width * scale));
	const height = Math.max(1, Math.round(bitmap.height * scale));
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("Canvas tidak tersedia di peramban ini.");
	}
	ctx.drawImage(bitmap, 0, 0, width, height);
	if ("close" in bitmap && typeof bitmap.close === "function") {
		bitmap.close();
	}
	return canvas.toDataURL("image/jpeg", 0.82);
}

async function loadBitmap(source: File | string): Promise<ImageBitmap> {
	if (source instanceof File) {
		if (!source.type.startsWith("image/")) {
			throw new Error("Berkas harus berupa gambar.");
		}
		return createImageBitmap(source);
	}
	const trimmed = source.trim();
	if (!trimmed) {
		throw new Error("Sumber gambar kosong.");
	}
	if (trimmed.startsWith("data:image/")) {
		const blob = await (await fetch(trimmed)).blob();
		return createImageBitmap(blob);
	}
	if (!/^https?:\/\//i.test(trimmed)) {
		throw new Error("URL gambar tidak valid.");
	}
	const response = await fetch(trimmed, { mode: "cors" });
	if (!response.ok) {
		throw new Error("Gagal mengunduh gambar dari URL.");
	}
	const blob = await response.blob();
	return createImageBitmap(blob);
}
