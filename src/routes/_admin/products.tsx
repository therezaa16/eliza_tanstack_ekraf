import { createFileRoute } from "@tanstack/react-router";
import {
	BookOpen,
	Calculator,
	CheckCircle2,
	Coins,
	Globe,
	Package,
	Pencil,
	Plus,
	Sparkles,
	Trash2,
} from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ProductFormModal } from "@/components/ProductFormModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_LABEL, IDR, type ProductCategory } from "@/lib/constants";
import type { Product } from "@/lib/db";

export const Route = createFileRoute("/_admin/products")({
	component: AdminProductsUlos,
});

// Mock Initial Ulos Products untuk UMKM Samosir
const INITIAL_ULOS_PRODUCTS: Product[] = [
	{
		id: "ulos-001",
		name: "Ulos Ragidup Tenun Asli Samosir",
		description:
			"Kasta tertinggi tenun Batak Toba melambangkan kehidupan dan doa restu sakral orang tua kepada pengantin.",
		price: 1850000,
		stock: 5,
		category: "kriya",
		artisan: "Inang Nainggolan (Lumban Suhi-Suhi)",
		image:
			"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: "ulos-002",
		name: "Ulos Sadum Songket Toba",
		description:
			"Ulos penuh warna ceria melambangkan suka cita, sering dipakai dalam pesta adat, penyambutan tamu, dan tari tor-tor.",
		price: 650000,
		stock: 14,
		category: "fashion",
		artisan: "Galeri Tenun Tomok",
		image:
			"https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: "ulos-003",
		name: "Ulos Ragihotang Hantaran Adat",
		description:
			"Ulos rotan bermakna ikatan kasih yang teguh dan kokoh, disematkan mertua kepada menantu laki-laki.",
		price: 950000,
		stock: 8,
		category: "kriya",
		artisan: "Sentra Ulos Pangururan",
		image:
			"https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: "ulos-004",
		name: "Ulos Mangiring Doa Keturunan",
		description:
			"Diberikan kepada ibu hamil dengan harapan anak yang lahir menjadi penerus yang baik dan membawa berkah beriringan.",
		price: 520000,
		stock: 10,
		category: "kriya",
		artisan: "Kelompok Tenun Lumban Suhi",
		image:
			"https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

// Database Filosofi Budaya Ulos untuk AI Storytelling
const ULOS_PHILOSOPHY_DB: Record<string, { id: string; en: string }> = {
	ragidup: {
		id: "Filosofi Ulos Ragidup: Ragidup berarti 'pola kehidupan'. Merupakan simbol restu hidup, kesehatan, dan umur panjang. Bagian tengahnya (badan) berwarna putih yang ditenun terpisah mencerminkan ketulusan dan kesucian restu orang tua kepada pengantin.",
		en: "Philosophy of Ulos Ragidup: 'Ragidup' translates to 'pattern of life'. It symbolizes blessings for vitality, longevity, and sacred life continuity. Handwoven with extreme precision, it represents unconditional parental blessings.",
	},
	sadum: {
		id: "Filosofi Ulos Sadum: Dikenal dengan ragam motif warna-warni yang cerah dan ornamen bunga mekar. Melambangkan sukacita (las ni roha), keriangan keluarga, dan optimisme. Sering dipakai pada perayaan kemenangan dan sukacita Batak.",
		en: "Philosophy of Ulos Sadum: Known for its vibrant colors and blossoming floral patterns. It symbolizes pure joy, merriment, and hope. Traditionally worn during joyful celebrations and tor-tor cultural ceremonies.",
	},
	ragihotang: {
		id: "Filosofi Ulos Ragihotang: 'Hotang' berarti rotan. Rotan melambangkan kekuatan ikatan persaudaraan dan kekeluargaan yang lentur namun tak terputuskan. Diberikan orang tua kepada menantu agar memiliki keteguhan hati menjaga rumah tangga.",
		en: "Philosophy of Ulos Ragihotang: 'Hotang' signifies rattan, reflecting unbreakable yet flexible ties of family and loyalty. Traditionally gifted to sons-in-law to grant fortitude in protecting the household.",
	},
	mangiring: {
		id: "Filosofi Ulos Mangiring: 'Mangiring' berarti membimbing atau beriringan. Menjadi simbol harapan agar kelahiran anak pertama disusul oleh kelahiran adik-adiknya secara beriringan dalam limpahan rezeki dan kerukunan.",
		en: "Philosophy of Ulos Mangiring: 'Mangiring' conveys guiding in harmony. Given to expectant mothers symbolizing the prayer for harmonious birth order and continuous family prosperity.",
	},
};

function AdminProductsUlos() {
	// 1. Mock State CRUD Produk (React useState aman dari crash kompilasi)
	const [products, setProducts] = useState<Product[]>(INITIAL_ULOS_PRODUCTS);

	// State Modal Bawaan
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<Product | null>(null);
	const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
	const [deleting, setDeleting] = useState(false);

	// State Form Tambah/Ubah Mock State langsung
	const [mockModalOpen, setMockModalOpen] = useState(false);
	const [formName, setFormName] = useState("");
	const [formArtisan, setFormArtisan] = useState("");
	const [formPrice, setFormPrice] = useState("");
	const [formStock, setFormStock] = useState("");
	const [formCategory, setFormCategory] = useState<ProductCategory>("kriya");
	const [formDesc, setFormDesc] = useState("");

	// 2. State Widget AI Kasir Pintar
	const [totalRevenue, setTotalRevenue] = useState(3450000);
	const [kasirInput, setKasirInput] = useState("");
	const [kasirFeedback, setKasirFeedback] = useState<string | null>(null);

	// 3. State Widget AI Storytelling
	const [storyInput, setStoryInput] = useState("Ulos Ragidup");
	const [storyResult, setStoryResult] = useState<{ id: string; en: string } | null>(
		ULOS_PHILOSOPHY_DB.ragidup,
	);
	const [isGeneratingStory, setIsGeneratingStory] = useState(false);

	// Handler Buka Form Modal (Tambah/Ubah)
	const handleOpenCreate = () => {
		setEditing(null);
		setFormName("");
		setFormArtisan("Pengrajin Samosir");
		setFormPrice("750000");
		setFormStock("5");
		setFormCategory("kriya");
		setFormDesc("Kain tenun tangan tradisional khas Danau Toba.");
		setMockModalOpen(true);
	};

	const handleOpenEdit = (p: Product) => {
		setEditing(p);
		setFormName(p.name);
		setFormArtisan(p.artisan);
		setFormPrice(String(p.price));
		setFormStock(String(p.stock));
		setFormCategory(p.category);
		setFormDesc(p.description);
		setMockModalOpen(true);
	};

	// Simpan CRUD ke React useState
	const handleSaveProduct = (e: React.FormEvent) => {
		e.preventDefault();
		const priceNum = Number(formPrice) || 0;
		const stockNum = Number(formStock) || 0;

		if (editing) {
			// Update Product
			setProducts((prev) =>
				prev.map((item) =>
					item.id === editing.id
						? {
								...item,
								name: formName.trim() || item.name,
								artisan: formArtisan.trim() || item.artisan,
								price: priceNum,
								stock: stockNum,
								category: formCategory,
								description: formDesc.trim() || item.description,
								updatedAt: new Date().toISOString(),
							}
						: item,
				),
			);
		} else {
			// Create Product Baru
			const newProduct: Product = {
				id: `ulos-${Date.now()}`,
				name: formName.trim() || "Kain Ulos Tenun Baru",
				artisan: formArtisan.trim() || "UMKM Tenun Samosir",
				price: priceNum,
				stock: stockNum,
				category: formCategory,
				description: formDesc.trim() || "Tenun tradisional Batak Toba berkualitas tinggi.",
				image:
					"https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			setProducts((prev) => [newProduct, ...prev]);
		}

		setMockModalOpen(false);
		setEditing(null);
	};

	// Konfirmasi Hapus Produk menggunakan ConfirmDialog bawaan
	const handleConfirmDelete = () => {
		if (!pendingDelete) return;
		setDeleting(true);
		setTimeout(() => {
			setProducts((prev) => prev.filter((item) => item.id !== pendingDelete.id));
			setDeleting(false);
			setPendingDelete(null);
		}, 300);
	};

	// Logika Widget AI Kasir Pintar (Parsing Kalimat Natural)
	const handleProcessKasir = (e: React.FormEvent) => {
		e.preventDefault();
		if (!kasirInput.trim()) return;

		const text = kasirInput.toLowerCase();
		let nominal = 0;

		// Regex mencari angka dengan kata kunci juta/jt/ribu/rb/k
		const jtMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(juta|jt)/);
		const rbMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(ribu|rb|k)/);
		const plainMatch = text.match(/(?:rp\.?|laku|total|harga)?\s*(\d[\d.,]*)/);

		if (jtMatch) {
			const val = Number.parseFloat(jtMatch[1].replace(",", "."));
			nominal = Math.round(val * 1000000);
		} else if (rbMatch) {
			const val = Number.parseFloat(rbMatch[1].replace(",", "."));
			nominal = Math.round(val * 1000);
		} else if (plainMatch) {
			const cleaned = plainMatch[1].replace(/[.,]/g, "");
			nominal = Number.parseInt(cleaned, 10) || 0;
		}

		if (nominal > 0) {
			setTotalRevenue((prev) => prev + nominal);
			setKasirFeedback(
				`✅ Sukses! Nominal +${IDR.format(nominal)} otomatis terdata dari: "${kasirInput}"`,
			);
			setKasirInput("");
			setTimeout(() => setKasirFeedback(null), 5000);
		} else {
			setKasirFeedback("⚠️ Format tidak terbaca. Contoh: 'Laku 1 ulos 500ribu' atau '2 kain 1.5jt'");
		}
	};

	// Logika Widget AI Storytelling Filosofi Kain Ulos
	const handleGenerateStory = () => {
		setIsGeneratingStory(true);
		const key = storyInput.toLowerCase().trim();

		setTimeout(() => {
			let found = null;
			for (const [k, v] of Object.entries(ULOS_PHILOSOPHY_DB)) {
				if (key.includes(k)) {
					found = v;
					break;
				}
			}

			if (found) {
				setStoryResult(found);
			} else {
				setStoryResult({
					id: `Filosofi ${storyInput}: Kain tenun tradisional khas Batak Toba ini memiliki makna perlindungan spiritual, kehangatan batin (mambere hos), dan status kehormatan adat dalam silsilah Dalihan Na Tolu.`,
					en: `Philosophy of ${storyInput}: This traditional Batak Toba textile embodies spiritual protection, inner warmth ('mambere hos'), and ancestral honor within the customary social fabric of Dalihan Na Tolu.`,
				});
			}
			setIsGeneratingStory(false);
		}, 400);
	};

	return (
		<div className="mx-auto max-w-6xl space-y-8 font-sans">
			{/* Top Banner Manajemen Ekraf Samosir */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border-2 border-[#B22222]/50 bg-gradient-to-r from-[#1f0a0a] via-[#120808] to-[#1a0a0a] p-6 text-white shadow-xl shadow-red-950/20">
				<div>
					<div className="inline-flex items-center gap-1.5 rounded-full bg-[#B22222] px-3 py-1 text-xs font-bold text-[#D4AF37] mb-2 border border-[#D4AF37]/40">
						<Sparkles className="size-3.5" /> Dasbor Inventaris Tenun Gorga
					</div>
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
						Manajemen Produk Ulos Samosir
					</h1>
					<p className="mt-1 text-xs sm:text-sm text-zinc-300">
						Kelola katalog produk kriya tenun (CRUD React State), perhitungan kasir pintar, dan
						filosofi budaya.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						onClick={handleOpenCreate}
						className="bg-[#B22222] hover:bg-[#8B0000] text-white border border-[#D4AF37] font-bold shadow-lg"
					>
						<Plus className="mr-1.5 size-4 text-[#D4AF37]" /> Tambah Ulos Baru
					</Button>
				</div>
			</div>

			{/* Grid 2 Widget Tambahan: AI Kasir Pintar & AI Storytelling */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* WIDGET 1: AI Kasir Pintar */}
				<section className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-[#161616] p-5 shadow-lg">
					<div>
						<div className="flex items-center justify-between border-b border-zinc-800 pb-3">
							<div className="flex items-center gap-2">
								<div className="flex size-8 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-700/50">
									<Calculator className="size-4" />
								</div>
								<div>
									<h2 className="text-sm font-bold text-white">Widget AI Kasir Pintar</h2>
									<p className="text-[11px] text-zinc-400">Deteksi kalimat penjualan otomatis</p>
								</div>
							</div>
							<div className="text-right">
								<span className="block text-[10px] text-zinc-400">Total Pendapatan</span>
								<span className="text-sm font-black text-emerald-400">
									{IDR.format(totalRevenue)}
								</span>
							</div>
						</div>

						<form onSubmit={handleProcessKasir} className="mt-4 space-y-3">
							<Label htmlFor="kasir-prompt" className="text-xs text-zinc-300">
								Input Kalimat Transaksi (contoh: "Laku 1 ulos 500ribu"):
							</Label>
							<div className="flex gap-2">
								<Input
									id="kasir-prompt"
									value={kasirInput}
									onChange={(e) => setKasirInput(e.target.value)}
									placeholder="Ketik: 'Laku 1 ulos 500ribu'..."
									className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 text-xs"
								/>
								<Button
									type="submit"
									className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0"
								>
									<Coins className="mr-1 size-3.5" /> Hitung
								</Button>
							</div>
						</form>

						{kasirFeedback && (
							<div className="mt-3 rounded-xl border border-emerald-800/60 bg-emerald-950/40 p-2.5 text-xs text-emerald-300 flex items-start gap-2">
								<CheckCircle2 className="size-4 shrink-0 text-emerald-400 mt-0.5" />
								<span>{kasirFeedback}</span>
							</div>
						)}
					</div>

					<div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400">
						<span className="text-zinc-500">Coba cepat:</span>
						<button
							type="button"
							onClick={() => setKasirInput("Laku 1 ulos 500ribu")}
							className="rounded-md bg-zinc-800 px-2 py-0.5 text-zinc-300 hover:text-white"
						>
							"Laku 1 ulos 500ribu"
						</button>
						<button
							type="button"
							onClick={() => setKasirInput("Terjual ulos ragidup 1.8jt")}
							className="rounded-md bg-zinc-800 px-2 py-0.5 text-zinc-300 hover:text-white"
						>
							"Terjual 1.8jt"
						</button>
					</div>
				</section>

				{/* WIDGET 2: AI Storytelling Filosofi Kain Ulos */}
				<section className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-[#161616] p-5 shadow-lg">
					<div>
						<div className="flex items-center justify-between border-b border-zinc-800 pb-3">
							<div className="flex items-center gap-2">
								<div className="flex size-8 items-center justify-center rounded-lg bg-[#B22222]/30 text-[#D4AF37] border border-[#B22222]">
									<Sparkles className="size-4" />
								</div>
								<div>
									<h2 className="text-sm font-bold text-white">Widget AI Storytelling Ulos</h2>
									<p className="text-[11px] text-zinc-400">Filosofi Dwibahasa (ID & EN)</p>
								</div>
							</div>
							<span className="rounded-full bg-[#B22222]/20 border border-[#D4AF37]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#D4AF37]">
								Nilai Budaya
							</span>
						</div>

						<div className="mt-4 space-y-2">
							<Label htmlFor="kain-name" className="text-xs text-zinc-300">
								Nama Kain Ulos:
							</Label>
							<div className="flex gap-2">
								<Input
									id="kain-name"
									value={storyInput}
									onChange={(e) => setStoryInput(e.target.value)}
									placeholder="Contoh: Ulos Ragidup, Ulos Sadum..."
									className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 text-xs"
								/>
								<Button
									type="button"
									onClick={handleGenerateStory}
									disabled={isGeneratingStory}
									className="bg-[#D4AF37] hover:bg-[#b89528] text-black font-bold text-xs shrink-0"
								>
									<BookOpen className="mr-1 size-3.5" />
									{isGeneratingStory ? "Meracik..." : "Filosofi AI"}
								</Button>
							</div>
						</div>

						{storyResult && (
							<div className="mt-3 space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 text-xs">
								<div>
									<span className="font-bold text-[#D4AF37] flex items-center gap-1 text-[11px]">
										🇮🇩 Bahasa Indonesia:
									</span>
									<p className="mt-0.5 text-zinc-300 leading-relaxed text-[11px]">
										{storyResult.id}
									</p>
								</div>
								<div className="border-t border-zinc-800 pt-2">
									<span className="font-bold text-sky-400 flex items-center gap-1 text-[11px]">
										<Globe className="size-3" /> English:
									</span>
									<p className="mt-0.5 text-zinc-400 leading-relaxed italic text-[11px]">
										{storyResult.en}
									</p>
								</div>
							</div>
						)}
					</div>

					<div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400">
						<span className="text-zinc-500">Pilihan cepat:</span>
						{["Ragidup", "Sadum", "Ragihotang", "Mangiring"].map((name) => (
							<button
								key={name}
								type="button"
								onClick={() => {
									setStoryInput(`Ulos ${name}`);
									const found = ULOS_PHILOSOPHY_DB[name.toLowerCase()];
									if (found) setStoryResult(found);
								}}
								className="rounded-md bg-zinc-800 px-2 py-0.5 text-zinc-300 hover:text-white"
							>
								{name}
							</button>
						))}
					</div>
				</section>
			</div>

			{/* Tabel Produk CRUD Ulos (Read & Actions) */}
			<section className="rounded-2xl border border-zinc-800 bg-[#141414] overflow-hidden shadow-xl">
				<div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/50">
					<div className="flex items-center gap-2">
						<Package className="size-4 text-[#D4AF37]" />
						<h2 className="text-base font-bold text-white">
							Katalog Produk UMKM ({products.length} Kain Terdaftar)
						</h2>
					</div>
					<Button
						size="sm"
						onClick={handleOpenCreate}
						className="bg-[#B22222] hover:bg-[#8B0000] text-white text-xs font-bold border border-[#D4AF37]/50"
					>
						<Plus className="mr-1 size-3.5" /> Tambah Ulos
					</Button>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 uppercase tracking-wider font-semibold">
							<tr>
								<th className="px-5 py-3.5">Karya & Motif</th>
								<th className="px-5 py-3.5">Pengrajin / UMKM</th>
								<th className="px-5 py-3.5">Kategori</th>
								<th className="px-5 py-3.5">Harga</th>
								<th className="px-5 py-3.5">Stok</th>
								<th className="px-5 py-3.5 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-800 text-zinc-300">
							{products.length === 0 ? (
								<tr>
									<td colSpan={6} className="px-5 py-8 text-center text-zinc-500">
										Belum ada kain tenun Ulos. Klik "Tambah Ulos Baru" di atas.
									</td>
								</tr>
							) : (
								products.map((item) => (
									<tr key={item.id} className="hover:bg-zinc-800/40 transition">
										<td className="px-5 py-3.5 font-medium text-white">
											<div className="flex items-center gap-3">
												{item.image ? (
													<img
														src={item.image}
														alt=""
														className="size-10 rounded-lg object-cover border border-zinc-700"
													/>
												) : (
													<div className="size-10 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500">
														No IMG
													</div>
												)}
												<div>
													<p className="m-0 font-bold text-white">{item.name}</p>
													<p className="m-0 text-[11px] text-zinc-400 line-clamp-1 max-w-xs">
														{item.description}
													</p>
												</div>
											</div>
										</td>
										<td className="px-5 py-3.5 text-zinc-300">{item.artisan}</td>
										<td className="px-5 py-3.5">
											<span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-[#D4AF37]">
												{CATEGORY_LABEL[item.category] || item.category}
											</span>
										</td>
										<td className="px-5 py-3.5 font-bold text-[#D4AF37]">
											{IDR.format(item.price)}
										</td>
										<td className="px-5 py-3.5">
											<span
												className={`font-semibold ${item.stock > 0 ? "text-emerald-400" : "text-red-400"}`}
											>
												{item.stock} lembar
											</span>
										</td>
										<td className="px-5 py-3.5 text-right">
											<div className="flex items-center justify-end gap-2">
												<button
													type="button"
													onClick={() => handleOpenEdit(item)}
													className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-200 hover:bg-[#B22222] hover:text-white transition"
												>
													<Pencil className="size-3" /> Edit
												</button>
												<button
													type="button"
													onClick={() => setPendingDelete(item)}
													className="inline-flex items-center gap-1 rounded-md border border-red-900/50 bg-red-950/40 px-2.5 py-1 text-[11px] font-medium text-red-400 hover:bg-red-900 hover:text-white transition"
												>
													<Trash2 className="size-3" /> Hapus
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</section>

			{/* Modal Custom Mock CRUD Tambah/Ubah State */}
			{mockModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-2xl border-2 border-[#B22222] bg-[#161616] p-6 text-white shadow-2xl">
						<div className="flex items-center justify-between border-b border-zinc-800 pb-3">
							<h3 className="text-base font-bold text-white">
								{editing ? "Ubah Data Kain Ulos" : "Tambah Karya Ulos Samosir"}
							</h3>
							<button
								type="button"
								onClick={() => setMockModalOpen(false)}
								className="text-zinc-400 hover:text-white"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleSaveProduct} className="mt-4 space-y-3.5 text-xs">
							<div>
								<Label htmlFor="m-name" className="text-zinc-300">
									Nama Kain Ulos:
								</Label>
								<Input
									id="m-name"
									value={formName}
									onChange={(e) => setFormName(e.target.value)}
									placeholder="Contoh: Ulos Ragidup Tenun Tangan"
									required
									className="bg-zinc-900 border-zinc-700 text-white mt-1"
								/>
							</div>

							<div>
								<Label htmlFor="m-artisan" className="text-zinc-300">
									Penenun / Pelaku UMKM:
								</Label>
								<Input
									id="m-artisan"
									value={formArtisan}
									onChange={(e) => setFormArtisan(e.target.value)}
									placeholder="Nama pengrajin atau sentra tenun"
									required
									className="bg-zinc-900 border-zinc-700 text-white mt-1"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<Label htmlFor="m-price" className="text-zinc-300">
										Harga (IDR):
									</Label>
									<Input
										id="m-price"
										type="number"
										value={formPrice}
										onChange={(e) => setFormPrice(e.target.value)}
										required
										className="bg-zinc-900 border-zinc-700 text-white mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="m-stock" className="text-zinc-300">
										Stok (Lembar):
									</Label>
									<Input
										id="m-stock"
										type="number"
										value={formStock}
										onChange={(e) => setFormStock(e.target.value)}
										required
										className="bg-zinc-900 border-zinc-700 text-white mt-1"
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="m-category" className="text-zinc-300">
									Subsektor Ekraf:
								</Label>
								<select
									id="m-category"
									value={formCategory}
									onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
									className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
								>
									<option value="kriya">Kriya (Tenun Sakral/Kerajinan)</option>
									<option value="fashion">Fashion (Songket/Pakaian Pesta)</option>
									<option value="seni">Seni (Koleksi Budaya)</option>
								</select>
							</div>

							<div>
								<Label htmlFor="m-desc" className="text-zinc-300">
									Makna & Deskripsi Singkat:
								</Label>
								<textarea
									id="m-desc"
									value={formDesc}
									onChange={(e) => setFormDesc(e.target.value)}
									rows={3}
									placeholder="Cerita bahan benang, pewarna alam, dan fungsinya dalam adat..."
									className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 p-2 text-white placeholder-zinc-500 focus:outline-none"
								/>
							</div>

							<div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
								<Button
									type="button"
									variant="outline"
									onClick={() => setMockModalOpen(false)}
									className="text-xs"
								>
									Batal
								</Button>
								<Button
									type="submit"
									className="bg-[#B22222] hover:bg-[#8B0000] text-white font-bold text-xs"
								>
									{editing ? "Simpan Perubahan" : "Tambahkan Ulos"}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Integrasi Komponen UI Bawaan ProductFormModal */}
			<ProductFormModal
				open={formOpen}
				onOpenChange={setFormOpen}
				product={editing}
				onSaved={() => {
					setFormOpen(false);
				}}
			/>

			{/* Integrasi Komponen UI Bawaan ConfirmDialog untuk Penghapusan Aman */}
			<ConfirmDialog
				open={!!pendingDelete}
				onOpenChange={(open) => {
					if (!open) setPendingDelete(null);
				}}
				title="Hapus Kain Ulos?"
				description={`Apakah Anda yakin ingin menghapus "${pendingDelete?.name}" dari katalog UMKM? Tindakan ini akan memperbarui data katalog lokal secara langsung.`}
				confirmLabel="Ya, Hapus Ulos"
				busy={deleting}
				onConfirm={handleConfirmDelete}
			/>
		</div>
	);
}
