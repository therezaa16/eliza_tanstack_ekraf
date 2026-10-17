import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants";
import { passwordIssues } from "@/lib/password";
import {
	attemptLogin,
	attemptSignUp,
	getLoginChallenge,
	getServerSession,
} from "@/lib/server/auth";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		const { session } = await getServerSession();
		if (session) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const loginFn = useServerFn(attemptLogin);
	const signUpFn = useServerFn(attemptSignUp);
	const challengeFn = useServerFn(getLoginChallenge);
	const [mode, setMode] = useState<"signin" | "signup">("signin");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [captchaId, setCaptchaId] = useState<string | null>(null);
	const [captchaQuestion, setCaptchaQuestion] = useState<string | null>(null);
	const [captchaAnswer, setCaptchaAnswer] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const refreshChallenge = async (nextEmail: string) => {
		if (!nextEmail.includes("@")) return;
		try {
			const gate = await challengeFn({ data: { email: nextEmail } });
			setCaptchaId(gate.captchaId);
			setCaptchaQuestion(gate.question);
			if (gate.locked) {
				setError(`Terlalu banyak percobaan. Coba lagi dalam ${gate.retryAfterSec} detik.`);
			}
		} catch {
			// Gate lookup is best-effort.
		}
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError("");
		if (!email.trim() || !password) {
			setError("Email dan kata sandi wajib diisi.");
			return;
		}
		if (mode === "signup") {
			if (name.trim().length < 2) {
				setError("Nama minimal 2 karakter.");
				return;
			}
			const issues = passwordIssues(password);
			if (issues.length) {
				setError(issues[0]);
				return;
			}
		}
		setLoading(true);
		try {
			if (mode === "signup") {
				await signUpFn({
					data: { name: name.trim(), email: email.trim(), password },
				});
			} else {
				await loginFn({
					data: {
						email: email.trim(),
						password,
						captchaId: captchaId ?? undefined,
						captchaAnswer: captchaAnswer || undefined,
					},
				});
			}
			await navigate({ to: "/dashboard" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Gagal masuk");
			await refreshChallenge(email);
			setCaptchaAnswer("");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="flex min-h-screen items-center justify-center px-4 py-10">
			<section className="island-shell w-full max-w-md rounded-2xl p-6 sm:p-8">
				<p className="island-kicker mb-2">{APP_NAME}</p>
				<h1 className="display-title text-3xl font-bold text-[var(--sea-ink)]">
					{mode === "signup" ? "Buat akun" : "Masuk"}
				</h1>
				<p className="mt-2 mb-6 text-sm text-[var(--sea-ink-soft)]">
					Kelola katalog karya UMKM. Sesi memakai cookie httpOnly.
				</p>

				<form onSubmit={handleSubmit} className="grid gap-4" noValidate>
					{mode === "signup" ? (
						<div className="grid gap-2">
							<Label htmlFor="name">Nama</Label>
							<Input
								id="name"
								value={name}
								onChange={(event) => setName(event.target.value)}
								autoComplete="name"
							/>
						</div>
					) : null}

					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(event) => {
								setEmail(event.target.value);
								setError("");
							}}
							onBlur={() => void refreshChallenge(email)}
							autoComplete="email"
						/>
					</div>

					<div className="grid gap-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="password">Kata sandi</Label>
							{mode === "signin" ? (
								<Link to="/forgot-password" className="text-xs">
									Lupa kata sandi?
								</Link>
							) : null}
						</div>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							autoComplete={mode === "signup" ? "new-password" : "current-password"}
							minLength={8}
						/>
						{mode === "signup" ? (
							<p className="text-xs text-[var(--sea-ink-soft)]">
								Minimal 10 karakter, huruf besar, huruf kecil, angka, dan karakter khusus.
							</p>
						) : (
							<p className="text-xs text-[var(--sea-ink-soft)]">
								Akun seed: admin@example.com / admin12345
							</p>
						)}
					</div>

					{captchaQuestion ? (
						<div className="grid gap-2">
							<Label htmlFor="captcha">Verifikasi: {captchaQuestion}</Label>
							<Input
								id="captcha"
								value={captchaAnswer}
								onChange={(event) => setCaptchaAnswer(event.target.value)}
								inputMode="numeric"
							/>
						</div>
					) : null}

					{error ? (
						<div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
							{error}
						</div>
					) : null}

					<Button type="submit" disabled={loading} className="w-full">
						{loading ? "Memproses..." : mode === "signup" ? "Daftar" : "Masuk"}
					</Button>
				</form>

				<div className="mt-4 text-center">
					<button
						type="button"
						className="text-sm text-[var(--sea-ink-soft)]"
						onClick={() => {
							setMode(mode === "signin" ? "signup" : "signin");
							setError("");
						}}
					>
						{mode === "signup" ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
					</button>
				</div>

				<p className="mt-6 text-center text-xs text-[var(--sea-ink-soft)]">
					Belum ada data?{" "}
					<Link to="/setup" className="font-medium">
						Seed admin
					</Link>
				</p>
			</section>
		</main>
	);
}
