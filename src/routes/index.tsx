import { Link, createFileRoute } from "@tanstack/react-router";
import {
	BadgeCheck,
	Bot,
	Filter,
	Handshake,
	MessageCircle,
	Package,
	Send,
	ShieldAlert,
	ShoppingBag,
	Sparkles,
	UserCheck,
	X,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({ component: HomeUlosSamosir });

type Role = "WISATAWAN" | "PELAKU UMKM" | "ADMIN PLATFORM";

interface UlosItem {
	id: string;
	name: string;
	category: "Upacara Adat" | "Pesta & Fashion" | "Hantaran Kasih";
	price: number;
	origin: string;
	meaning: string;
	image: string;
	stock: number;
}

const STATIC_ULOS: UlosItem[] = [
	{
		id: "ulos-sadum",
		name: "Ulos Sadum Samosir",
		category: "Pesta & Fashion",
		price: 650000,
		origin: "Desa Lumban Suhi-Suhi",
		meaning:
			"Bermotif cerah penuh bunga, melambangkan sukacita, keriangan, dan semangat hidup masyarakat Batak.",
		image:
			"https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
		stock: 14,
	},
	{
		id: "ulos-ragidup",
		name: "Ulos Ragidup Klasik",
		category: "Upacara Adat",
		price: 1850000,
		origin: "Sigarantung, Samosir",
		meaning:
			"Kasta tertinggi tenun Batak Toba melambangkan kehidupan sejati, restu sakral orang tua kepada pengantin.",
		image:
			"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
		stock: 6,
	},
	{
		id: "ulos-ragihotang",
		name: "Ulos Ragihotang Tenun Tangan",
		category: "Hantaran Kasih",
		price: 950000,
		origin: "Pangururan, Samosir",
		meaning:
			"Ulos rotan bermakna ikatan kasih yang teguh, biasa disematkan oleh mertua kepada menantu laki-laki.",
		image:
			"https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80",
		stock: 9,
	},
];

const IDR = new Intl.NumberFormat("id-ID", {
	style: "currency",
	currency: "IDR",
	maximumFractionDigits: 0,
});

function HomeUlosSamosir() {
	// Sesi Login / Register Tiruan dengan 3 Role
	const [activeRole, setActiveRole] = useState<Role>("WISATAWAN");
	const [userSession, setUserSession] = useState<{
		name: string;
		email: string;
		role: Role;
	} | null>({
		name: "Wisatawan Danau Toba",
		email: "wisatawan@toba.id",
		role: "WISATAWAN",
	});

	// Filter Kategori Wisatawan
	const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

	// Floating Chatbot Nego Harga
	const [chatOpen, setChatOpen] = useState(false);
	const [chatInput, setChatInput] = useState("");
	const [chatMessages, setChatMessages] = useState<
		Array<{ sender: "user" | "bot"; text: string; time: string }>
	>([
		{
			sender: "bot",
			text: "Horas! 👋 Saya asisten virtual UMKM Ulos Samosir. Mau menawar harga kain Ulos idaman Anda atau tanya filosofi tenun?",
			time: "10:00",
		},
	]);

	const categories = ["Semua", "Upacara Adat", "Pesta & Fashion", "Hantaran Kasih"];

	const filteredUlos =
		selectedCategory === "Semua"
			? STATIC_ULOS
			: STATIC_ULOS.filter((item) => item.category === selectedCategory);

	const handleSwitchRole = (newRole: Role) => {
		setActiveRole(newRole);
		const emailMap: Record<Role, string> = {
			WISATAWAN: "wisatawan@toba.id",
			"PELAKU UMKM": "umkm.ulos.samosir@gmail.com",
			"ADMIN PLATFORM": "admin.ekraf@samosir.go.id",
		};
		const nameMap: Record<Role, string> = {
			WISATAWAN: "Wisatawan Danau Toba",
			"PELAKU UMKM": "Inang Nainggolan (Pengrajin)",
			"ADMIN PLATFORM": "Administrator Dinas Kebudayaan",
		};
		setUserSession({
			name: nameMap[newRole],
			email: emailMap[newRole],
			role: newRole,
		});
	};

	const handleSendChat = (e: React.FormEvent) => {
		e.preventDefault();
		if (!chatInput.trim()) return;

		const userMsg = chatInput.trim();
		const now = new Date().toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
		});

		const nextMessages = [...chatMessages, { sender: "user" as const, text: userMsg, time: now }];
		setChatMessages(nextMessages);
		setChatInput("");

		setTimeout(() => {
			let reply =
				"Horas! Penawaran Anda kami catat. Pengrajin tenun tangan kami dapat memberikan diskon 5% untuk pembelian tunai di Samosir!";
			const lower = userMsg.toLowerCase();
			if (
				lower.includes("nego") ||
				lower.includes("tawar") ||
				lower.includes("harga") ||
				lower.includes("diskon")
			) {
				reply =
					"Bisa ditenunkan khusus! Untuk Ulos Ragidup atau Sadum, jika ambil 2 lembar kami beri potongan Rp 100.000 + sertifikat keaslian motif Batak.";
			} else if (
				lower.includes("ragidup") ||
				lower.includes("sadum") ||
				lower.includes("ragihotang")
			) {
				reply =
					"Pilihan istimewa! Kain ini ditenun menggunakan alat gedogan tradisional selama 2-4 minggu di Pulau Samosir.";
			} else if (lower.includes("wa") || lower.includes("whatsapp")) {
				reply =
					"Silakan klik tombol hijau 'Hubungi via WhatsApp' pada kartu produk di atas untuk langsung terhubung dengan inang penenun.";
			}

			setChatMessages((prev) => [
				...prev,
				{
					sender: "bot",
					text: reply,
					time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
				},
			]);
		}, 700);
	};

	return (
		<div className="min-h-screen bg-[#111111] text-zinc-100 selection:bg-[#B22222] selection:text-white font-sans">
			{/* Gorga Batak Decorative Top Border */}
			<div className="h-2 w-full bg-gradient-to-r from-[#B22222] via-[#D4AF37] to-[#B22222]" />

			{/* Top Navbar */}
			<header className="sticky top-0 z-40 border-b border-[#331111] bg-[#111111]/90 backdrop-blur-md px-4 py-3 sm:px-8">
				<div className="mx-auto flex max-w-7xl items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-xl bg-[#B22222] text-[#D4AF37] shadow-lg shadow-[#B22222]/30 border border-[#D4AF37]/50 font-black text-xl">
							ᯅ
						</div>
						<div>
							<span className="block text-lg font-bold tracking-tight text-white">
								ULOS <span className="text-[#D4AF37]">SAMOSIR</span>
							</span>
							<span className="block text-[10px] tracking-widest uppercase text-red-300">
								Warisan Budaya Batak Toba
							</span>
						</div>
					</div>

					<div className="flex items-center gap-3">
						{userSession?.role !== "WISATAWAN" ? (
							<Link
								to="/products"
								className="flex items-center gap-2 rounded-xl bg-[#B22222] hover:bg-[#8B0000] px-4 py-2 text-xs font-semibold text-white shadow-md border border-[#D4AF37]/40 transition"
							>
								<Package className="size-4 text-[#D4AF37]" />
								Dasbor Manajemen Produk
							</Link>
						) : (
							<a
								href="#katalog"
								className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/50 bg-[#1e1313] px-4 py-2 text-xs font-semibold text-[#D4AF37] hover:bg-[#B22222] hover:text-white transition"
							>
								<ShoppingBag className="size-4" />
								Katalog Tenun
							</a>
						)}
					</div>
				</div>
			</header>

			{/* Hero Section with Batak Gorga Colors */}
			<section className="relative overflow-hidden border-b border-[#331111] bg-gradient-to-b from-[#1a0808] via-[#111111] to-[#111111] px-4 py-12 sm:px-8 sm:py-16">
				<div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />
				<div className="mx-auto max-w-5xl text-center relative z-10">
					<div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#B22222]/20 px-4 py-1.5 text-xs font-medium text-[#D4AF37] mb-6">
						<Sparkles className="size-3.5 text-[#D4AF37]" />
						Pemberdayaan Tenun Tradisional UMKM Pulau Samosir
					</div>
					<h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
						Keanggunan Tenun <span className="text-[#B22222]">Ulos Batak</span>,
						<br />
						<span className="text-[#D4AF37]">Nafas Budaya Danau Toba</span>
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-zinc-300 leading-relaxed">
						Jelajahi keindahan filosofis kain tenun sakral masyarakat Batak Toba. Menghubungkan
						langsung wisatawan nusantara dan mancanegara dengan inang pengrajin tenun tangan asli
						Samosir.
					</p>

					{/* Role Selector Card */}
					<div className="mx-auto mt-8 max-w-2xl rounded-2xl border-2 border-[#B22222]/60 bg-[#1a0d0d] p-5 shadow-2xl shadow-red-950/40">
						<p className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold mb-3 flex items-center justify-center gap-1.5">
							<UserCheck className="size-4" /> Pilih Mode Akses Simulasi (Tiruan 3 Role)
						</p>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
							{(["WISATAWAN", "PELAKU UMKM", "ADMIN PLATFORM"] as Role[]).map((r) => {
								const active = activeRole === r;
								return (
									<button
										key={r}
										type="button"
										onClick={() => handleSwitchRole(r)}
										className={`flex flex-col items-center justify-center rounded-xl p-3 text-xs font-bold transition border ${
											active
												? "bg-[#B22222] border-[#D4AF37] text-white shadow-lg shadow-[#B22222]/50 scale-[1.02]"
												: "bg-[#111111] border-zinc-800 text-zinc-300 hover:border-[#B22222] hover:text-white"
										}`}
									>
										<span>{r}</span>
										<span className="text-[10px] font-normal opacity-80 mt-0.5">
											{r === "WISATAWAN"
												? "Katalog & Nego"
												: r === "PELAKU UMKM"
													? "CRUD Produk Tenun"
													: "Full Admin Panel"}
										</span>
									</button>
								);
							})}
						</div>

						{/* Role Status Bar */}
						<div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-3 text-xs">
							<div className="text-left text-zinc-300">
								Login Aktif: <strong className="text-white">{userSession?.name}</strong>{" "}
								<span className="text-[#D4AF37]">({userSession?.role})</span>
							</div>
							{userSession?.role !== "WISATAWAN" ? (
								<Link
									to="/products"
									className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#b89528] px-3 py-1.5 font-bold text-black text-xs transition"
								>
									Kelola Produk Sekarang →
								</Link>
							) : (
								<span className="text-xs text-green-400 flex items-center gap-1">
									<BadgeCheck className="size-3.5" /> Siap Menjelajahi Katalog
								</span>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Main Content: Katalog Ulos untuk Wisatawan */}
			<main id="katalog" className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
				{activeRole !== "WISATAWAN" ? (
					/* Banner Pengingat untuk Role UMKM / Admin */
					<div className="mb-10 rounded-2xl border border-[#D4AF37]/50 bg-gradient-to-r from-[#220d0d] via-[#1a0a0a] to-[#220d0d] p-6 text-center">
						<ShieldAlert className="mx-auto size-8 text-[#D4AF37] mb-2" />
						<h2 className="text-xl font-bold text-white">
							Anda Masuk Sebagai <span className="text-[#D4AF37]">{activeRole}</span>
						</h2>
						<p className="mt-1 text-sm text-zinc-300 max-w-xl mx-auto">
							Anda memiliki izin untuk mengelola inventaris katalog Ulos, mengubah harga, stok, dan
							menjalankan Widget AI Kasir Pintar serta AI Storytelling.
						</p>
						<div className="mt-4 flex justify-center gap-3">
							<Link
								to="/products"
								className="rounded-xl bg-[#B22222] hover:bg-[#8B0000] px-5 py-2.5 text-xs font-bold text-white shadow-lg border border-[#D4AF37]/40 transition"
							>
								Buka Halaman CRUD Produk →
							</Link>
							<button
								type="button"
								onClick={() => handleSwitchRole("WISATAWAN")}
								className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white"
							>
								Lihat Tampilan Wisatawan
							</button>
						</div>
					</div>
				) : null}

				{/* Header Section Katalog */}
				<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
					<div>
						<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
							<ShoppingBag className="size-4" /> Koleksi Tenun Autentik
						</div>
						<h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
							Katalog Kain Ulos Samosir
						</h2>
						<p className="mt-1 text-sm text-zinc-400">
							Ditenun manual helai demi helai menggunakan pewarna alam khas Tanah Batak.
						</p>
					</div>

					{/* Kategori Filter */}
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-xs text-zinc-400 flex items-center gap-1 mr-1">
							<Filter className="size-3.5" /> Filter:
						</span>
						{categories.map((cat) => (
							<button
								key={cat}
								type="button"
								onClick={() => setSelectedCategory(cat)}
								className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
									selectedCategory === cat
										? "bg-[#B22222] text-white border border-[#D4AF37]"
										: "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800"
								}`}
							>
								{cat}
							</button>
						))}
					</div>
				</div>

				{/* Product Grid */}
				<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{filteredUlos.map((ulos) => {
						const waMessage = encodeURIComponent(
							`Horas Inang Penenun Samosir! Saya tertarik memesan kain "${ulos.name}" seharga ${IDR.format(
								ulos.price,
							)}. Apakah stok tenun tangan masih tersedia?`,
						);
						const waLink = `https://wa.me/6281234567890?text=${waMessage}`;

						return (
							<div
								key={ulos.id}
								className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#161616] hover:border-[#B22222] transition-all duration-300 hover:shadow-xl hover:shadow-[#B22222]/20"
							>
								<div className="relative h-60 w-full overflow-hidden bg-zinc-950">
									<img
										src={ulos.image}
										alt={ulos.name}
										className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									/>
									<span className="absolute top-3 right-3 rounded-full bg-[#111111]/85 border border-[#D4AF37]/50 px-2.5 py-1 text-[11px] font-bold text-[#D4AF37] backdrop-blur-sm">
										{ulos.category}
									</span>
									<span className="absolute bottom-3 left-3 rounded-md bg-[#B22222]/90 px-2 py-0.5 text-[10px] font-semibold text-white">
										{ulos.origin}
									</span>
								</div>

								<div className="flex flex-1 flex-col p-5">
									<h3 className="text-lg font-bold text-white group-hover:text-[#D4AF37] transition">
										{ulos.name}
									</h3>
									<p className="mt-2 text-xs leading-relaxed text-zinc-400 flex-1">
										{ulos.meaning}
									</p>

									<div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
										<div>
											<span className="block text-[11px] text-zinc-400">Harga Pengrajin</span>
											<span className="text-lg font-black text-[#D4AF37]">
												{IDR.format(ulos.price)}
											</span>
										</div>
										<span className="text-[11px] text-zinc-400">
											Sisa Stok: <strong className="text-zinc-200">{ulos.stock}</strong>
										</span>
									</div>

									{/* Action Buttons */}
									<div className="mt-4 grid grid-cols-2 gap-2">
										<a
											href={waLink}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white shadow transition"
										>
											<MessageCircle className="size-4" />
											WhatsApp
										</a>
										<button
											type="button"
											onClick={() => {
												setChatOpen(true);
												setChatMessages((prev) => [
													...prev,
													{
														sender: "bot",
														text: `Horas! Tertarik dengan ${ulos.name}? Berapa harga tawaran yang ingin Anda ajukan ke inang penenun?`,
														time: new Date().toLocaleTimeString("id-ID", {
															hour: "2-digit",
															minute: "2-digit",
														}),
													},
												]);
											}}
											className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#D4AF37]/50 bg-[#241313] hover:bg-[#B22222] px-3 py-2 text-xs font-bold text-[#D4AF37] hover:text-white transition"
										>
											<Handshake className="size-4" />
											Nego Harga
										</button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</main>

			{/* Floating Chatbot Tiruan Simulasi Nego Harga */}
			<div className="fixed bottom-5 right-5 z-50">
				{chatOpen ? (
					<div className="flex h-[420px] w-[340px] sm:w-[380px] flex-col overflow-hidden rounded-2xl border-2 border-[#B22222] bg-[#161616] shadow-2xl shadow-black">
						{/* Chatbot Header */}
						<div className="flex items-center justify-between border-b border-[#331111] bg-gradient-to-r from-[#B22222] to-[#800000] px-4 py-3 text-white">
							<div className="flex items-center gap-2.5">
								<div className="flex size-8 items-center justify-center rounded-full bg-[#D4AF37] text-black font-black text-xs">
									<Bot className="size-4" />
								</div>
								<div>
									<h4 className="text-xs font-bold">Asisten Nego Ulos Samosir</h4>
									<p className="text-[10px] text-red-200">Online • Simulasi Respon Penjual</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setChatOpen(false)}
								className="rounded-lg p-1 hover:bg-black/30 text-zinc-300 hover:text-white"
								aria-label="Tutup Chat"
							>
								<X className="size-4" />
							</button>
						</div>

						{/* Chatbot Body */}
						<div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
							{chatMessages.map((msg, idx) => (
								<div
									key={`${msg.sender}-${msg.time}-${idx}-${msg.text.slice(0, 8)}`}
									className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
								>
									<div
										className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
											msg.sender === "user"
												? "bg-[#B22222] text-white rounded-br-none"
												: "bg-[#252525] border border-zinc-700 text-zinc-200 rounded-bl-none"
										}`}
									>
										{msg.text}
									</div>
									<span className="text-[9px] text-zinc-400 mt-1 px-1">{msg.time}</span>
								</div>
							))}
						</div>

						{/* Chatbot Input */}
						<form
							onSubmit={handleSendChat}
							className="border-t border-zinc-800 p-2.5 bg-[#121212] flex gap-2"
						>
							<input
								type="text"
								value={chatInput}
								onChange={(e) => setChatInput(e.target.value)}
								placeholder="Ketik tawaran Anda (cth: 'Bisa 600rb inang?')..."
								className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
							/>
							<button
								type="submit"
								className="flex size-9 items-center justify-center rounded-xl bg-[#D4AF37] hover:bg-[#b89528] text-black font-bold transition shrink-0"
							>
								<Send className="size-4" />
							</button>
						</form>
					</div>
				) : (
					<button
						type="button"
						onClick={() => setChatOpen(true)}
						className="flex items-center gap-2.5 rounded-full bg-[#B22222] hover:bg-[#8B0000] px-4 py-3 font-bold text-white shadow-xl shadow-[#B22222]/40 border-2 border-[#D4AF37] transition hover:scale-105"
					>
						<Bot className="size-5 text-[#D4AF37]" />
						<span className="text-xs">Nego Harga Tenun</span>
					</button>
				)}
			</div>

			{/* Footer */}
			<footer className="mt-16 border-t border-zinc-800 bg-[#0c0c0c] px-4 py-8 text-center text-xs text-zinc-400">
				<div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
					<p className="m-0">
						© {new Date().getFullYear()} UMKM Tenun Kain Ulos Samosir • PABWE Praktikum Ekraf
					</p>
					<p className="m-0 text-[#D4AF37]">
						Identitas Batak Toba: Gorga Merah (#B22222), Hitam (#111111), dan Emas (#D4AF37)
					</p>
				</div>
			</footer>
		</div>
	);
}
