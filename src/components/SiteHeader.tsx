import { Link } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { APP_NAME } from "@/lib/constants";
import ThemeToggle from "./ThemeToggle";

export function SiteHeader() {
	const { data: session, isPending } = authClient.useSession();

	return (
		<header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
			<nav className="page-wrap flex items-center gap-3 py-3">
				<Link
					to="/"
					className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] no-underline"
				>
					<span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
					{APP_NAME}
				</Link>
				<div className="ml-auto flex items-center gap-2">
					{isPending ? (
						<div className="h-8 w-20 animate-pulse rounded-md bg-[var(--chip-bg)]" />
					) : session?.user ? (
						<Link
							to="/dashboard"
							className="rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)] no-underline"
						>
							Dashboard
						</Link>
					) : (
						<Link
							to="/login"
							className="rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)] no-underline"
						>
							Masuk
						</Link>
					)}
					<ThemeToggle />
				</div>
			</nav>
		</header>
	);
}
