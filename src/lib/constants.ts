export const APP_NAME = "KaryaLokal";
export const APP_TAGLINE = "Katalog karya UMKM ekonomi kreatif daerah";

export const PRODUCT_CATEGORIES = ["kriya", "fashion", "kuliner", "seni", "musik", "film"] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
	kriya: "Kriya",
	fashion: "Fashion",
	kuliner: "Kuliner",
	seni: "Seni",
	musik: "Musik",
	film: "Film & Media",
};

export const IDR = new Intl.NumberFormat("id-ID", {
	style: "currency",
	currency: "IDR",
	maximumFractionDigits: 0,
});
