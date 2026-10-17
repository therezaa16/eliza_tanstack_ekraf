import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/server/auth";

export const Route = createFileRoute("/forgot-password")({
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	const requestFn = useServerFn(requestPasswordReset);
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [resetUrl, setResetUrl] = useState<string | null>(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError("");
		setMessage("");
		setResetUrl(null);
		setLoading(true);
		try {
			const result = await requestFn({ data: { email: email.trim() } });
			setMessage(result.message);
			setResetUrl(result.resetUrl);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Permintaan gagal");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="flex min-h-screen items-center justify-center px-4 py-10">
			<section className="island-shell w-full max-w-md rounded-2xl p-6 sm:p-8">
				<p className="island-kicker mb-2">Akun</p>
				<h1 className="display-title text-3xl font-bold">Lupa kata sandi</h1>
				<p className="mt-2 mb-6 text-sm text-[var(--sea-ink-soft)]">
					Masukkan email akun. Karena data in-memory tanpa SMTP, tautan reset ditampilkan di sini
					jika email terdaftar.
				</p>
				<form onSubmit={handleSubmit} className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							required
						/>
					</div>
					{error ? <p className="text-sm text-red-600">{error}</p> : null}
					{message ? <p className="text-sm text-[var(--sea-ink)]">{message}</p> : null}
					{resetUrl ? (
						<a href={resetUrl} className="break-all text-sm font-medium">
							{resetUrl}
						</a>
					) : null}
					<Button type="submit" disabled={loading}>
						{loading ? "Mengirim..." : "Minta tautan reset"}
					</Button>
				</form>
				<p className="mt-6 text-center text-sm">
					<Link to="/login">Kembali ke masuk</Link>
				</p>
			</section>
		</main>
	);
}
