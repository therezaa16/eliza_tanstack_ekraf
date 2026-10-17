const MAX_EDGE = 512;
const MAX_DATA_URL_CHARS = 400_000;
const ALLOWED_PREFIX = /^data:image\/(jpeg|jpg|png|webp);base64,/i;

export function assertProductImage(image: string | null | undefined): string | null {
	if (!image) return null;
	const value = image.trim();
	if (!value) return null;
	if (!ALLOWED_PREFIX.test(value)) {
		throwObject("Gambar harus diunggah sebagai file (JPEG/PNG/WebP), bukan URL mentah.", 400);
	}
	if (value.length > MAX_DATA_URL_CHARS) {
		throwObject("Berkas gambar terlalu besar setelah diperkecil.", 400);
	}
	const comma = value.indexOf(",");
	const b64 = value.slice(comma + 1);
	let bytes: Uint8Array;
	try {
		bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
	} catch {
		throwObject("Data gambar tidak valid.", 400);
	}
	const size = readImageSize(bytes);
	if (!size) {
		throwObject("Format gambar tidak dikenali.", 400);
	}
	if (size.width > MAX_EDGE || size.height > MAX_EDGE) {
		throwObject(`Gambar melebihi ${MAX_EDGE}px. Perkecil sebelum menyimpan.`, 400);
	}
	if (size.width < 1 || size.height < 1) {
		throwObject("Dimensi gambar tidak valid.", 400);
	}
	return value;
}

function throwObject(message: string, status: number): never {
	const err = new Error(message) as Error & { status?: number };
	err.status = status;
	throw err;
}

function readImageSize(bytes: Uint8Array): { width: number; height: number } | null {
	if (bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e) {
		const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
		return { width: view.getUint32(16), height: view.getUint32(20) };
	}
	if (bytes.length > 10 && bytes[0] === 0xff && bytes[1] === 0xd8) {
		return readJpegSize(bytes);
	}
	if (
		bytes.length > 30 &&
		bytes[0] === 0x52 &&
		bytes[1] === 0x49 &&
		bytes[2] === 0x46 &&
		bytes[3] === 0x46
	) {
		return readWebpSize(bytes);
	}
	return null;
}

function readJpegSize(bytes: Uint8Array): { width: number; height: number } | null {
	let offset = 2;
	while (offset + 9 < bytes.length) {
		if (bytes[offset] !== 0xff) return null;
		const marker = bytes[offset + 1];
		if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
			const height = (bytes[offset + 5] << 8) + bytes[offset + 6];
			const width = (bytes[offset + 7] << 8) + bytes[offset + 8];
			return { width, height };
		}
		const length = (bytes[offset + 2] << 8) + bytes[offset + 3];
		offset += 2 + length;
	}
	return null;
}

function readWebpSize(bytes: Uint8Array): { width: number; height: number } | null {
	const riff = String.fromCharCode(...bytes.slice(8, 16));
	if (!riff.startsWith("WEBP")) return null;
	const chunk = String.fromCharCode(...bytes.slice(12, 16));
	if (chunk === "VP8X" && bytes.length >= 30) {
		const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
		const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
		return { width, height };
	}
	if (chunk === "VP8 " && bytes.length >= 30) {
		const width = bytes[26] + ((bytes[27] & 0x3f) << 8);
		const height = bytes[28] + ((bytes[29] & 0x3f) << 8);
		return { width, height };
	}
	return null;
}

export const CLIENT_MAX_EDGE = MAX_EDGE;
