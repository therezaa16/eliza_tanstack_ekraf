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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { normalizeProductImage } from "@/lib/client-image";
import { CATEGORY_LABEL, PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/constants";
import type { Product } from "@/lib/db";
import { createProduct, updateProduct } from "@/lib/server/products";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product: Product | null;
	onSaved: () => Promise<void> | void;
};

export function ProductFormModal({ open, onOpenChange, product, onSaved }: Props) {
	const createFn = useServerFn(createProduct);
	const updateFn = useServerFn(updateProduct);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState("");
	const [stock, setStock] = useState("");
	const [category, setCategory] = useState<ProductCategory>("kriya");
	const [artisan, setArtisan] = useState("");
	const [image, setImage] = useState<string | null>(null);
	const [imageUrl, setImageUrl] = useState("");
	const [error, setError] = useState("");
	const [imageHint, setImageHint] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!open) return;
		setName(product?.name ?? "");
		setDescription(product?.description ?? "");
		setPrice(product ? String(product.price) : "");
		setStock(product ? String(product.stock) : "");
		setCategory(product?.category ?? "kriya");
		setArtisan(product?.artisan ?? "");
		setImage(product?.image ?? null);
		setImageUrl("");
		setError("");
		setImageHint("");
		setSubmitting(false);
	}, [open, product]);

	const applyImage = async (source: File | string) => {
		setImageHint("Memproses gambar (maks. 512px)...");
		try {
			const dataUrl = await normalizeProductImage(source);
			setImage(dataUrl);
			setImageHint("Gambar diperkecil dan siap disimpan.");
		} catch (err) {
			setImageHint("");
			setError(err instanceof Error ? err.message : "Gagal memproses gambar");
		}
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError("");
		if (name.trim().length < 2) {
			setError("Nama karya minimal 2 karakter.");
			return;
		}
		if (description.trim().length < 8) {
			setError("Deskripsi minimal 8 karakter.");
			return;
		}
		if (artisan.trim().length < 2) {
			setError("Nama pelaku ekraf wajib diisi.");
			return;
		}
		const priceValue = Number(price);
		const stockValue = Number(stock);
		if (!Number.isFinite(priceValue) || priceValue < 0) {
			setError("Harga harus angka yang valid.");
			return;
		}
		if (!Number.isInteger(stockValue) || stockValue < 0) {
			setError("Stok harus bilangan bulat non-negatif.");
			return;
		}
		setSubmitting(true);
		try {
			const payload = {
				name: name.trim(),
				description: description.trim(),
				price: priceValue,
				stock: stockValue,
				category,
				artisan: artisan.trim(),
				image,
			};
			if (product) {
				await updateFn({ data: { id: product.id, ...payload } });
			} else {
				await createFn({ data: payload });
			}
			await onSaved();
			onOpenChange(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Gagal menyimpan karya");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{product ? "Ubah karya" : "Tambah karya"}</DialogTitle>
					<DialogDescription>
						Data divalidasi di server. Gambar otomatis diperkecil maksimal 512px.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="product-name">Nama karya</Label>
						<Input
							id="product-name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="Contoh: Tenun Ikat Flores"
							autoComplete="off"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="product-artisan">Pelaku ekraf / UMKM</Label>
						<Input
							id="product-artisan"
							value={artisan}
							onChange={(event) => setArtisan(event.target.value)}
							placeholder="Nama pengrajin atau merek"
							autoComplete="off"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="product-category">Subsektor</Label>
						<select
							id="product-category"
							value={category}
							onChange={(event) => setCategory(event.target.value as ProductCategory)}
							className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
						>
							{PRODUCT_CATEGORIES.map((item) => (
								<option key={item} value={item}>
									{CATEGORY_LABEL[item]}
								</option>
							))}
						</select>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="product-description">Deskripsi</Label>
						<Textarea
							id="product-description"
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							placeholder="Cerita singkat bahan, teknik, dan asal daerah."
						/>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="product-price">Harga (IDR)</Label>
							<Input
								id="product-price"
								type="number"
								min={0}
								value={price}
								onChange={(event) => setPrice(event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="product-stock">Stok</Label>
							<Input
								id="product-stock"
								type="number"
								min={0}
								step={1}
								value={stock}
								onChange={(event) => setStock(event.target.value)}
							/>
						</div>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="product-image-file">Gambar karya</Label>
						<Input
							id="product-image-file"
							type="file"
							accept="image/jpeg,image/png,image/webp"
							onChange={(event) => {
								const file = event.target.files?.[0];
								if (file) void applyImage(file);
							}}
						/>
						<div className="flex gap-2">
							<Input
								placeholder="atau tempel URL gambar"
								value={imageUrl}
								onChange={(event) => setImageUrl(event.target.value)}
							/>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									if (imageUrl.trim()) void applyImage(imageUrl.trim());
								}}
							>
								Pakai
							</Button>
						</div>
						{imageHint ? <p className="text-xs text-[var(--sea-ink-soft)]">{imageHint}</p> : null}
						{image ? (
							<div className="overflow-hidden rounded-lg border border-[var(--line)]">
								<img src={image} alt="Pratinjau karya" className="max-h-48 w-full object-cover" />
								<button
									type="button"
									className="w-full py-2 text-xs text-red-600"
									onClick={() => setImage(null)}
								>
									Hapus gambar
								</button>
							</div>
						) : null}
					</div>
					{error ? <p className="text-sm text-red-600">{error}</p> : null}
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Batal
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? "Menyimpan..." : product ? "Simpan perubahan" : "Tambah karya"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
