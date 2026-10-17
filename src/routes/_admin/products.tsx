import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	createColumnHelper,
	flexRender,
	rowSortingFeature,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ProductFormModal } from "@/components/ProductFormModal";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABEL, IDR } from "@/lib/constants";
import type { Product } from "@/lib/db";
import { deleteProduct, getProducts } from "@/lib/server/products";

export const Route = createFileRoute("/_admin/products")({
	component: Products,
});

function Products() {
	const { me } = Route.useRouteContext();
	const queryClient = useQueryClient();
	const productsQuery = useQuery({
		queryKey: ["products"],
		queryFn: async () => getProducts(),
	});
	const deleteFn = useServerFn(deleteProduct);
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<Product | null>(null);
	const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
	const [deleting, setDeleting] = useState(false);

	const features = tableFeatures({ rowSortingFeature });
	const columnHelper = createColumnHelper<typeof features, Product>();
	const isAdmin = me.role === "admin";

	const columns = columnHelper.columns([
		columnHelper.accessor("name", {
			header: "Karya",
			cell: (info) => {
				const product = info.row.original as Product;
				return (
					<div className="flex items-center gap-3">
						{product.image ? (
							<img
								src={product.image}
								alt=""
								className="size-10 rounded-lg object-cover"
							/>
						) : (
							<div className="size-10 rounded-lg bg-[var(--chip-bg)]" />
						)}
						<div>
							<p className="m-0 font-medium">{product.name}</p>
							<p className="m-0 text-xs text-[var(--sea-ink-soft)]">{product.artisan}</p>
						</div>
					</div>
				);
			},
		}),
		columnHelper.accessor("category", {
			header: "Subsektor",
			cell: (info) => CATEGORY_LABEL[info.getValue() as Product["category"]],
		}),
		columnHelper.accessor("price", {
			header: "Harga",
			cell: (info) => IDR.format(Number(info.getValue())),
		}),
		columnHelper.accessor("stock", { header: "Stok" }),
		columnHelper.display({
			id: "actions",
			header: "Aksi",
			cell: (info) => {
				if (!isAdmin) return <span className="text-xs text-[var(--sea-ink-soft)]">Lihat saja</span>;
				const product = info.row.original as Product;
				return (
					<div className="flex gap-2">
						<button
							type="button"
							className="text-xs underline underline-offset-4"
							onClick={() => {
								setEditing(product);
								setFormOpen(true);
							}}
						>
							Ubah
						</button>
						<button
							type="button"
							className="text-xs text-red-600 underline underline-offset-4"
							onClick={() => setPendingDelete(product)}
						>
							Hapus
						</button>
					</div>
				);
			},
		}),
	]);

	const table = useTable({
		features,
		columns,
		data: productsQuery.data ?? [],
	});

	const refresh = async () => {
		await queryClient.invalidateQueries({ queryKey: ["products"] });
		await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
	};

	return (
		<div className="mx-auto max-w-5xl">
			<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="island-kicker mb-2">Katalog</p>
					<h1 className="display-title m-0 text-3xl font-bold">Karya UMKM</h1>
					<p className="mt-1 mb-0 text-sm text-[var(--sea-ink-soft)]">
						Urutkan kolom. Tambah dan ubah lewat modal — bukan halaman terpisah.
					</p>
				</div>
				{isAdmin ? (
					<Button
						onClick={() => {
							setEditing(null);
							setFormOpen(true);
						}}
					>
						Tambah karya
					</Button>
				) : null}
			</div>

			{productsQuery.isError ? (
				<p className="mb-4 text-sm text-red-600">
					Gagal memuat: {(productsQuery.error as Error).message}
				</p>
			) : null}

			<div className="island-shell overflow-hidden rounded-2xl">
				<div className="hidden overflow-x-auto md:block">
					<table className="w-full text-sm">
						<thead>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th
											key={header.id}
											className="bg-[var(--chip-bg)] px-4 py-3 text-left text-xs font-semibold"
										>
											{header.isPlaceholder ? null : (
												<button
													type="button"
													className="cursor-pointer"
													onClick={header.column.getToggleSortingHandler()}
												>
													{flexRender(header.column.columnDef.header, header.getContext())}
													{{
														asc: " ▲",
														desc: " ▼",
													}[header.column.getIsSorted() as string] ?? null}
												</button>
											)}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody>
							{productsQuery.isPending ? (
								<tr>
									<td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--sea-ink-soft)]">
										Memuat karya...
									</td>
								</tr>
							) : table.getRowModel().rows.length === 0 ? (
								<tr>
									<td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--sea-ink-soft)]">
										Belum ada karya. {isAdmin ? "Tambahkan karya pertama." : ""}
									</td>
								</tr>
							) : (
								table.getRowModel().rows.map((row) => (
									<tr key={row.id} className="border-t border-[var(--line)]">
										{row.getAllCells().map((cell) => (
											<td key={cell.id} className="px-4 py-3">
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										))}
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				<div className="grid gap-3 p-4 md:hidden">
					{productsQuery.isPending ? (
						<p className="text-sm text-[var(--sea-ink-soft)]">Memuat karya...</p>
					) : (productsQuery.data ?? []).length === 0 ? (
						<p className="text-sm text-[var(--sea-ink-soft)]">Belum ada karya.</p>
					) : (
						(productsQuery.data ?? []).map((product) => (
							<article key={product.id} className="rounded-xl border border-[var(--line)] p-4">
								<div className="flex gap-3">
									{product.image ? (
										<img src={product.image} alt="" className="size-14 rounded-lg object-cover" />
									) : null}
									<div>
										<p className="m-0 font-semibold">{product.name}</p>
										<p className="m-0 text-xs text-[var(--sea-ink-soft)]">
											{CATEGORY_LABEL[product.category]} · {product.artisan}
										</p>
										<p className="mt-1 mb-0 text-sm">{IDR.format(product.price)}</p>
									</div>
								</div>
								{isAdmin ? (
									<div className="mt-3 flex gap-3">
										<button
											type="button"
											className="text-xs underline"
											onClick={() => {
												setEditing(product);
												setFormOpen(true);
											}}
										>
											Ubah
										</button>
										<button
											type="button"
											className="text-xs text-red-600 underline"
											onClick={() => setPendingDelete(product)}
										>
											Hapus
										</button>
									</div>
								) : null}
							</article>
						))
					)}
				</div>
			</div>

			<ProductFormModal
				open={formOpen}
				onOpenChange={setFormOpen}
				product={editing}
				onSaved={refresh}
			/>
			<ConfirmDialog
				open={!!pendingDelete}
				onOpenChange={(open) => {
					if (!open) setPendingDelete(null);
				}}
				title="Hapus karya?"
				description={`Karya “${pendingDelete?.name ?? ""}” akan dihapus dari katalog in-memory.`}
				busy={deleting}
				onConfirm={async () => {
					if (!pendingDelete) return;
					setDeleting(true);
					try {
						await deleteFn({ data: { id: pendingDelete.id } });
						await refresh();
						setPendingDelete(null);
					} catch (err) {
						window.alert(err instanceof Error ? err.message : "Hapus gagal");
					} finally {
						setDeleting(false);
					}
				}}
			/>
		</div>
	);
}
