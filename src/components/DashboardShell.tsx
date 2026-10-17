import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Menu, Package, Users, X } from "lucide-react";
import { useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { APP_NAME } from "@/lib/constants";
import { authClient } from "@/lib/auth-client";

type Me = {
	id: string;
	email: string;
	name: string | null;
	role: "admin" | "user";
};

export function DashboardShell({ me, children }: { me: Me; children: React.ReactNode }) {
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const navigate = useNavigate();

	const items = [
		{ to: "/dashboard" as const, label: "Ringkasan", icon: LayoutDashboard },
		{ to: "/products" as const, label: "Karya", icon: Package },
		...(me.role === "admin"
			? [{ to: "/users" as const, label: "Pengguna", icon: Users }]
			: []),
	];

	const nav = (
		<nav className="flex flex-1 flex-col gap-1 p-3">
			{items.map((item) => {
				const active = pathname === item.to;
				const Icon = item.icon;
				return (
					<Link
						key={item.to}
						to={item.to}
						onClick={() => setMobileOpen(false)}
						className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold no-underline transition ${
							active
								? "bg-[var(--chip-bg)] text-[var(--sea-ink)]"
								: "text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
						} ${collapsed ? "justify-center" : ""}`}
					>
						<Icon className="size-4 shrink-0" />
						{collapsed ? <span className="sr-only">{item.label}</span> : item.label}
					</Link>
				);
			})}
		</nav>
	);

	return (
		<div className="min-h-screen lg:grid lg:grid-cols-[auto_1fr]">
			<aside
				className={`hidden border-r border-[var(--line)] bg-[var(--header-bg)] lg:flex lg:flex-col ${
					collapsed ? "w-[4.5rem]" : "w-60"
				}`}
			>
				<div className="flex items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-4">
					{collapsed ? null : (
						<Link to="/" className="truncate text-sm font-semibold text-[var(--sea-ink)] no-underline">
							{APP_NAME}
						</Link>
					)}
					<button
						type="button"
						className="rounded-lg p-2 text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)]"
						onClick={() => setCollapsed((value) => !value)}
						aria-label={collapsed ? "Perlebar menu" : "Ciutkan menu"}
					>
						<Menu className="size-4" />
					</button>
				</div>
				{nav}
				<div className="mt-auto border-t border-[var(--line)] p-3 text-xs text-[var(--sea-ink-soft)]">
					{collapsed ? me.role : me.email}
				</div>
			</aside>

			{mobileOpen ? (
				<div className="fixed inset-0 z-50 lg:hidden">
					<button
						type="button"
						className="absolute inset-0 bg-black/40"
						aria-label="Tutup menu"
						onClick={() => setMobileOpen(false)}
					/>
					<div className="relative flex h-full w-72 flex-col bg-[var(--header-bg)]">
						<div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-4">
							<p className="font-semibold">{APP_NAME}</p>
							<button type="button" onClick={() => setMobileOpen(false)} aria-label="Tutup">
								<X className="size-4" />
							</button>
						</div>
						{nav}
					</div>
				</div>
			) : null}

			<div className="min-w-0">
				<header className="sticky top-0 z-30 flex items-center gap-2 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 py-3 backdrop-blur-lg">
					<button
						type="button"
						className="rounded-lg p-2 lg:hidden"
						onClick={() => setMobileOpen(true)}
						aria-label="Buka menu"
					>
						<Menu className="size-5" />
					</button>
					<p className="truncate text-sm font-medium text-[var(--sea-ink-soft)]">{me.name || me.email}</p>
					<div className="ml-auto flex items-center gap-2">
						<ThemeToggle />
						<button
							type="button"
							className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm"
							onClick={async () => {
								await authClient.signOut();
								await navigate({ to: "/login" });
							}}
						>
							<LogOut className="size-4" />
							Keluar
						</button>
					</div>
				</header>
				<div className="px-4 py-6 sm:px-6">{children}</div>
			</div>
		</div>
	);
}
