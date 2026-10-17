import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordIssues } from "@/lib/password";
import { resetPasswordWithToken } from "@/lib/server/auth";

export const Route = createFileRoute("/reset-password")({
	validateSearch: (search: Record<string, unknown>) => ({
		token: typeof search.token === "string" ? search.token : "",
	}),
	component: ResetPasswordPage,
});

function ResetPasswordPage() {
	const { token } = Route.useSearch();
	const navigate = useNavigate();
	const resetFn = useServerFn(resetPasswordWithToken);
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError("");
		if (!token) {
			setError("Token reset tidak ada.");
			return;
		}
		if (password !== confirm) {
			setError("Konfirmasi kata sandi tidak sama.");
			return;
		}
		const issues = passwordIssues(password);
		if (issues.length) {
			setError(issues[0]);
			return;
		}
		setLoading(true);
		try {
			await resetFn({ data: { token, password } });
			await navigate({ to: "/login" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Reset gagal");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="flex min-h-screen items-center justify-center px-4 py-10">
			<section className="island-shell w-full max-w-md rounded-2xl p-6 sm:p-8">
				<p className="island-kicker mb-2">Akun</p>
				<h1 className="display-title text-3xl font-bold">Atur kata sandi baru</h1>
				<p className="mt-2 mb-6 text-sm text-[var(--sea-ink-soft)]">
					Minimal 10 karakter dengan huruf besar, huruf kecil, angka, dan karakter khusus.
				</p>
				<form onSubmit={handleSubmit} className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="password">Kata sandi baru</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							autoComplete="new-password"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="confirm">Ulangi kata sandi</Label>
						<Input
							id="confirm"
							type="password"
							value={confirm}
							onChange={(event) => setConfirm(event.target.value)}
							autoComplete="new-password"
						/>
					</div>
					{error ? <p className="text-sm text-red-600">{error}</p> : null}
					<Button type="submit" disabled={loading || !token}>
						{loading ? "Menyimpan..." : "Simpan kata sandi"}
					</Button>
				</form>
				<p className="mt-6 text-center text-sm">
					<Link to="/login">Kembali ke masuk</Link>
				</p>
			</section>
		</main>
	);
}
