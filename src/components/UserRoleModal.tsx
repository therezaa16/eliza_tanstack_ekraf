import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Role } from "@/lib/db";
import { updateUserRole } from "@/lib/server/users";

type UserRow = {
	id: string;
	email: string;
	name: string | null;
	role: Role;
};

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: UserRow | null;
	currentUserId: string;
	onSaved: () => Promise<void> | void;
};

export function UserRoleModal({ open, onOpenChange, user, currentUserId, onSaved }: Props) {
	const updateFn = useServerFn(updateUserRole);
	const [role, setRole] = useState<Role>("user");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!open || !user) return;
		setRole(user.role);
		setError("");
		setSubmitting(false);
	}, [open, user]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!user) return;
		setSubmitting(true);
		setError("");
		try {
			await updateFn({ data: { userId: user.id, role } });
			await onSaved();
			onOpenChange(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Gagal mengubah peran");
		} finally {
			setSubmitting(false);
		}
	};

	const isSelf = user?.id === currentUserId;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Ubah peran</DialogTitle>
					<DialogDescription>
						{user?.name || user?.email}. Penurunan peran diri sendiri diblokir di server.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="user-role">Peran</Label>
						<select
							id="user-role"
							value={role}
							onChange={(event) => setRole(event.target.value as Role)}
							disabled={isSelf}
							className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
						>
							<option value="user">Pengguna</option>
							<option value="admin">Administrator</option>
						</select>
					</div>
					{isSelf ? (
						<p className="text-xs text-[var(--sea-ink-soft)]">
							Anda tidak dapat menurunkan peran akun yang sedang dipakai.
						</p>
					) : null}
					{error ? <p className="text-sm text-red-600">{error}</p> : null}
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Batal
						</Button>
						<Button type="submit" disabled={submitting || isSelf}>
							{submitting ? "Menyimpan..." : "Simpan peran"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
