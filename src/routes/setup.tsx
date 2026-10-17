import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import Footer from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { seedAdmin } from "@/lib/server/auth";

export const Route = createFileRoute("/setup")({ component: Setup });

function Setup() {
	const seedAdminFn = useServerFn(seedAdmin);
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [message, setMessage] = useState("");

	const handleSeed = async () => {
		setStatus("loading");
		setMessage("");
		try {
			const result = await seedAdminFn();
			setStatus("success");
			setMessage(
				result.alreadySeeded
					? "Akun admin sudah ada. Data in-memory tidak diulang."
					: "Admin dan 3 karya contoh siap. Masuk dengan admin@example.com / admin12345",
			);
		} catch (err) {
			setStatus("error");
			setMessage(err instanceof Error ? err.message : "Seed gagal");
		}
	};

	return (
		<div className="flex min-h-screen flex-col">
			<SiteHeader />
			<main className="page-wrap flex-1 px-4 py-12">
				<section className="island-shell rounded-2xl p-6 sm:p-8">
					<p className="island-kicker mb-2">Setup</p>
					<h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)]">
						Seed akun admin
					</h1>
					<p className="m-0 max-w-2xl text-base leading-8 text-[var(--sea-ink-soft)]">
						Membuat administrator (kata sandi di-hash Better Auth) dan tiga karya UMKM contoh.
						Aman dijalankan berulang kali.
					</p>

					<div className="mt-8">
						<button
							type="button"
							onClick={() => void handleSeed()}
							disabled={status === "loading"}
							className="rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-5 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)] disabled:opacity-50"
						>
							{status === "loading" ? "Menyiapkan..." : "Seed Admin Account"}
						</button>

						{status !== "idle" && (
							<div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] p-4">
								<p
									className={`m-0 text-sm ${
										status === "success"
											? "text-green-700 dark:text-green-400"
											: status === "error"
												? "text-red-700 dark:text-red-400"
												: "text-[var(--sea-ink-soft)]"
									}`}
								>
									{message}
								</p>
							</div>
						)}

						<p className="mt-6 mb-0 text-sm text-[var(--sea-ink-soft)]">
							Sudah siap?{" "}
							<Link to="/login" className="font-medium underline underline-offset-4">
								Masuk
							</Link>
						</p>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}
