import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { createColumnHelper, flexRender, tableFeatures, useTable } from "@tanstack/react-table";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { UserRoleModal } from "@/components/UserRoleModal";
import type { Role } from "@/lib/db";
import { getMe } from "@/lib/server/auth";
import { deleteUser, getUsers } from "@/lib/server/users";

type UserRow = {
	id: string;
	email: string;
	name: string | null;
	role: Role;
	emailVerified: boolean;
	createdAt: string;
};

export const Route = createFileRoute("/_admin/users")({
	beforeLoad: async () => {
		const me = await getMe();
		if (!me) throw redirect({ to: "/login" });
		if (me.role !== "admin") throw redirect({ to: "/dashboard" });
	},
	component: Users,
});

function Users() {
	const { me } = Route.useRouteContext();
	const queryClient = useQueryClient();
	const usersQuery = useQuery({
		queryKey: ["users"],
		queryFn: async () => getUsers(),
	});
	const deleteFn = useServerFn(deleteUser);
	const [roleUser, setRoleUser] = useState<UserRow | null>(null);
	const [pendingDelete, setPendingDelete] = useState<UserRow | null>(null);
	const [deleting, setDeleting] = useState(false);

	const features = tableFeatures({});
	const columnHelper = createColumnHelper<typeof features, UserRow>();
	const adminCount = usersQuery.data?.filter((user) => user.role === "admin").length ?? 0;

	const columns = columnHelper.columns([
		columnHelper.accessor("name", {
			header: "Nama",
			cell: (info) => info.getValue() || "—",
		}),
		columnHelper.accessor("email", { header: "Email" }),
		columnHelper.accessor("role", { header: "Peran" }),
		columnHelper.accessor("createdAt", {
			header: "Bergabung",
			cell: (info) => new Date(info.getValue() as string).toLocaleDateString("id-ID"),
		}),
		columnHelper.display({
			id: "actions",
			header: "Aksi",
			cell: (info) => {
				const user = info.row.original as UserRow;
				const isSelf = user.id === me.id;
				const lastAdmin = user.role === "admin" && adminCount <= 1;
				return (
					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							className="text-xs underline underline-offset-4"
							onClick={() => setRoleUser(user)}
						>
							Peran
						</button>
						{isSelf || lastAdmin ? (
							<span className="text-xs text-[var(--sea-ink-soft)]">
								{isSelf ? "Akun Anda" : "Admin terakhir"}
							</span>
						) : (
							<button
								type="button"
								className="text-xs text-red-600 underline underline-offset-4"
								onClick={() => setPendingDelete(user)}
							>
								Hapus
							</button>
						)}
					</div>
				);
			},
		}),
	]);

	const table = useTable({
		features,
		columns,
		data: usersQuery.data ?? [],
	});

	const refresh = async () => {
		await queryClient.invalidateQueries({ queryKey: ["users"] });
		await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
	};

	return (
		<div className="mx-auto max-w-5xl">
			<p className="island-kicker mb-2">Akses</p>
			<h1 className="display-title mb-2 text-3xl font-bold">Pengguna</h1>
			<p className="mt-0 mb-6 text-sm text-[var(--sea-ink-soft)]">
				Ubah peran lewat modal. Hapus diri sendiri dan admin terakhir ditolak di server.
			</p>

			{usersQuery.isError ? (
				<p className="mb-4 text-sm text-red-600">
					Gagal memuat: {(usersQuery.error as Error).message}
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
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody>
							{usersQuery.isPending ? (
								<tr>
									<td
										colSpan={columns.length}
										className="px-4 py-8 text-center text-[var(--sea-ink-soft)]"
									>
										Memuat pengguna...
									</td>
								</tr>
							) : table.getRowModel().rows.length === 0 ? (
								<tr>
									<td
										colSpan={columns.length}
										className="px-4 py-8 text-center text-[var(--sea-ink-soft)]"
									>
										Belum ada pengguna.
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
					{(usersQuery.data ?? []).map((user) => (
						<article key={user.id} className="rounded-xl border border-[var(--line)] p-4">
							<p className="m-0 font-semibold">{user.name || "—"}</p>
							<p className="m-0 text-xs break-all text-[var(--sea-ink-soft)]">{user.email}</p>
							<p className="mt-1 mb-2 text-sm">{user.role}</p>
							<button type="button" className="text-xs underline" onClick={() => setRoleUser(user)}>
								Ubah peran
							</button>
						</article>
					))}
				</div>
			</div>

			<UserRoleModal
				open={!!roleUser}
				onOpenChange={(open) => {
					if (!open) setRoleUser(null);
				}}
				user={roleUser}
				currentUserId={me.id}
				onSaved={refresh}
			/>
			<ConfirmDialog
				open={!!pendingDelete}
				onOpenChange={(open) => {
					if (!open) setPendingDelete(null);
				}}
				title="Hapus pengguna?"
				description={`Akun ${pendingDelete?.email ?? ""} akan dihapus dari memori proses ini.`}
				busy={deleting}
				onConfirm={async () => {
					if (!pendingDelete) return;
					setDeleting(true);
					try {
						await deleteFn({ data: { userId: pendingDelete.id } });
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
