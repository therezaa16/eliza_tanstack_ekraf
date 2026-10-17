import { z } from "zod";

export const strongPasswordSchema = z
	.string()
	.min(10, "Minimal 10 karakter")
	.regex(/[a-z]/, "Harus ada huruf kecil")
	.regex(/[A-Z]/, "Harus ada huruf besar")
	.regex(/[0-9]/, "Harus ada angka")
	.regex(/[^A-Za-z0-9]/, "Harus ada karakter khusus");

export function passwordIssues(password: string): string[] {
	const parsed = strongPasswordSchema.safeParse(password);
	if (parsed.success) return [];
	return parsed.error.issues.map((issue) => issue.message);
}

export function sanitizeText(input: string, max = 400): string {
	return Array.from(input.replace(/<[^>]*>/g, ""))
		.filter((character) => {
			const codePoint = character.codePointAt(0);
			return codePoint !== undefined && codePoint > 0x1f && codePoint !== 0x7f;
		})
		.join("")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, max);
}
