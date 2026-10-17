import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { CATEGORY_LABEL, IDR } from "@/lib/constants";
import { getProducts } from "@/lib/server/products";
import { getAuditLog, getUsers } from "@/lib/server/users";

export const Route = createFileRoute("/_admin/dashboard")({
	component: Dashboard,
});

function Dashboard() {
	const { me } = Route.useRouteContext();
	const productsQuery = useQuery({
		queryKey: ["dashboard", "products"],
		queryFn: async () => getProducts(),
	});
	const usersQuery = useQuery({
		queryKey: ["dashboard", "users"],
		queryFn: async () => getUsers(),
		enabled: me.role === "admin",
	});
	const auditQuery = useQuery({
		queryKey: ["dashboard", "audit"],
		queryFn: async () => getAuditLog(),
		enabled: me.role === "admin",
	});

	const products = productsQuery.data ?? [];
	const users = usersQuery.data ?? [];
	const inventoryValue = products.reduce((sum, item) => sum + item.price * item.stock, 0);
	const lowStock = products.filter((item) => item.stock <= 5).length;

	return (
		<div className="mx-auto max-w-5xl">
			<p className="island-kicker mb-2">Dashboard</p>
			<h1 className="display-title mb-2 text-3xl font-bold text-[var(--sea-ink)]">Ringkasan karya</h1>
			<p className="mt-0 mb-6 text-[var(--sea-ink-soft)]">
				Pantau katalog UMKM ekraf. Semua angka diambil lewat server function yang mewajibkan sesi.
			</p>

			{productsQuery.isPending ? (
				<p className="text-sm text-[var(--sea-ink-soft)]">Memuat data...</p>
			) : null}
			{productsQuery.isError ? (
				<p className="text-sm text-red-600">
					Gagal memuat karya: {(productsQuery.error as Error).message}
				</p>
			) : null}

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Stat title="Karya" value={String(products.length)} />
				<Stat title="Nilai stok" value={IDR.format(inventoryValue)} />
				<Stat title="Stok menipis" value={String(lowStock)} />
				<Stat
					title={me.role === "admin" ? "Pengguna" : "Peran Anda"}
					value={me.role === "admin" ? String(users.length) : me.role}
				/>
			</div>

			<div className="mt-6 grid gap-4 lg:grid-cols-2">
				<section className="island-shell rounded-2xl p-5">
					<h2 className="mt-0 mb-1 text-base font-semibold">Karya terbaru</h2>
					{products.length === 0 && !productsQuery.isPending ? (
						<p className="text-sm text-[var(--sea-ink-soft)]">Belum ada karya. Tambahkan dari menu Karya.</p>
					) : (
						<ul className="m-0 grid list-none gap-3 p-0">
							{products.slice(0, 4).map((item) => (
								<li key={item.id} className="flex items-center justify-between gap-3">
									<div>
										<p className="m-0 font-medium">{item.name}</p>
										<p className="m-0 text-xs text-[var(--sea-ink-soft)]">
											{CATEGORY_LABEL[item.category]} · {item.artisan}
										</p>
									</div>
									<p className="m-0 text-sm">{IDR.format(item.price)}</p>
								</li>
							))}
						</ul>
					)}
					<Link to="/products" className="mt-4 inline-block text-sm font-semibold">
						Kelola karya →
					</Link>
				</section>

				<section className="island-shell rounded-2xl p-5">
					<h2 className="mt-0 mb-1 text-base font-semibold">Jejak admin</h2>
					{me.role !== "admin" ? (
						<p className="text-sm text-[var(--sea-ink-soft)]">
							Log audit hanya untuk administrator.
						</p>
					) : auditQuery.isError ? (
						<p className="text-sm text-red-600">Gagal memuat log.</p>
					) : (auditQuery.data ?? []).length === 0 ? (
						<p className="text-sm text-[var(--sea-ink-soft)]">Belum ada aksi admin.</p>
					) : (
						<ul className="m-0 grid max-h-64 list-none gap-2 overflow-auto p-0 text-sm">
							{(auditQuery.data ?? []).map((entry) => (
								<li key={entry.id} className="border-b border-[var(--line)] pb-2">
									<p className="m-0 font-medium">{entry.action}</p>
									<p className="m-0 text-xs text-[var(--sea-ink-soft)]">
										{entry.detail} · {new Date(entry.at).toLocaleString("id-ID")}
									</p>
								</li>
							))}
						</ul>
					)}
					{me.role === "admin" ? (
						<Link to="/users" className="mt-4 inline-block text-sm font-semibold">
							Kelola pengguna →
						</Link>
					) : null}
				</section>
			</div>
		</div>
	);
}

function Stat({ title, value }: { title: string; value: string }) {
	return (
		<div className="island-shell rounded-2xl p-5">
			<p className="m-0 text-sm text-[var(--sea-ink-soft)]">{title}</p>
			<p className="m-0 mt-1 text-2xl font-bold text-[var(--sea-ink)]">{value}</p>
		</div>
	);
}
