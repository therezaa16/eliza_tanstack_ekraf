import { Link, createFileRoute } from "@tanstack/react-router";
import { Palette, ShieldCheck, Store } from "lucide-react";

import Footer from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const { data: session, isPending } = authClient.useSession();

	return (
		<div className="flex min-h-screen flex-col">
			<SiteHeader />
			<main className="page-wrap flex-1 px-4 py-10">
				<section className="island-shell rise-in rounded-2xl p-6 sm:p-10">
					<p className="island-kicker mb-2">Ekonomi kreatif daerah</p>
					<h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
						{APP_NAME}
					</h1>
					<p className="m-0 max-w-2xl text-base leading-8 text-[var(--sea-ink-soft)]">{APP_TAGLINE}</p>
					<p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--sea-ink-soft)]">
						Kelola karya UMKM — kriya, fashion, kuliner, seni, musik, dan film — dari satu dasbor
						aman. Login, peran, dan seluruh perubahan data dicek ulang di server.
					</p>

					{isPending ? (
						<p className="mt-8 text-sm text-[var(--sea-ink-soft)]">Memuat sesi...</p>
					) : session?.user ? (
						<div className="mt-8 flex flex-wrap gap-3">
							<div className="rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] p-4">
								<p className="m-0 text-sm text-[var(--sea-ink-soft)]">
									Masuk sebagai <span className="font-semibold">{session.user.email}</span>
								</p>
							</div>
							<Link
								to="/dashboard"
								className="rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] no-underline"
							>
								Buka dashboard
							</Link>
						</div>
					) : (
						<div className="mt-8 flex flex-wrap gap-3">
							<Link
								to="/login"
								className="rounded-xl bg-[var(--lagoon)] px-5 py-3 text-sm font-semibold text-white no-underline"
							>
								Masuk
							</Link>
							<Link
								to="/setup"
								className="rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-5 py-3 text-sm font-semibold text-[var(--sea-ink)] no-underline"
							>
								Seed akun admin
							</Link>
						</div>
					)}
				</section>

				<section className="mt-6 grid gap-4 sm:grid-cols-3">
					<Feature
						icon={Store}
						title="Katalog UMKM"
						body="Catat karya, pelaku, harga, dan stok per subsektor ekraf."
					/>
					<Feature
						icon={ShieldCheck}
						title="Akses terkontrol"
						body="Sesi httpOnly, batas percobaan login, dan otorisasi admin di server."
					/>
					<Feature
						icon={Palette}
						title="Siap penilaian"
						body="Fokus pada modul yang benar-benar jalan, bukan tumpukan fitur palsu."
					/>
				</section>
			</main>
			<Footer />
		</div>
	);
}

function Feature({
	icon: Icon,
	title,
	body,
}: {
	icon: typeof Store;
	title: string;
	body: string;
}) {
	return (
		<div className="island-shell rounded-2xl p-5">
			<Icon className="mb-3 size-5 text-[var(--lagoon-deep)]" />
			<h2 className="m-0 text-base font-semibold text-[var(--sea-ink)]">{title}</h2>
			<p className="mt-2 mb-0 text-sm leading-6 text-[var(--sea-ink-soft)]">{body}</p>
		</div>
	);
}
