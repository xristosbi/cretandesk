export interface Subcategory {
  value: string;
  label: string;
}

export interface Category {
  value: string;
  label: string;
  subcategories: Subcategory[];
}

export const CATEGORIES: Category[] = [
  {
    value: "sea",
    label: "Θάλασσα",
    subcategories: [
      { value: "daily_cruise",     label: "Daily Cruises / Ferry" },
      { value: "private_boat",     label: "Private Boat Trips" },
      { value: "scuba_diving",     label: "Scuba Diving" },
      { value: "water_sports",     label: "Water Sports" },
      { value: "fishing_tourism",  label: "Fishing Tourism" },
    ],
  },
  {
    value: "adventure",
    label: "Περιπέτεια & Φύση",
    subcategories: [
      { value: "jeep_safari",      label: "Jeep Safari" },
      { value: "quad_safari",      label: "Quad / Buggy Safari" },
      { value: "hiking",           label: "Hiking / Trekking" },
      { value: "canyoning",        label: "Canyoning" },
      { value: "mountain_biking",  label: "Mountain Biking" },
      { value: "horse_riding",     label: "Horse Riding" },
    ],
  },
  {
    value: "aerial",
    label: "Αέρας",
    subcategories: [
      { value: "helicopter_tour",  label: "Helicopter Tours" },
      { value: "paragliding",      label: "Paragliding" },
      { value: "hot_air_balloon",  label: "Hot Air Balloon" },
    ],
  },
  {
    value: "gastronomy",
    label: "Γεύση & Παράδοση",
    subcategories: [
      { value: "wine_tasting",     label: "Wine Tasting" },
      { value: "olive_oil",        label: "Olive Oil Experience" },
      { value: "cooking_class",    label: "Cooking Lessons" },
      { value: "agrotourism",      label: "Agrotourism & Farming" },
      { value: "cretan_night",     label: "Cretan Night" },
    ],
  },
  {
    value: "culture",
    label: "Πολιτισμός & Ιστορία",
    subcategories: [
      { value: "archaeological_tour",  label: "Archaeological Tours" },
      { value: "historical_sites",     label: "Historical Sites" },
      { value: "religious_tourism",    label: "Religious Tourism" },
      { value: "city_walking_tour",    label: "City Walking Tours" },
    ],
  },
  {
    value: "vip",
    label: "VIP & Services",
    subcategories: [
      { value: "private_chef",         label: "Private Chef" },
      { value: "chauffeur",            label: "Chauffeur & Luxury Transfers" },
      { value: "wellness_spa",         label: "Wellness & Spa" },
      { value: "villa_provisioning",   label: "Villa Provisioning" },
    ],
  },
  {
    value: "niche",
    label: "Εναλλακτικά",
    subcategories: [
      { value: "birdwatching",         label: "Birdwatching" },
      { value: "astrotourism",         label: "Astrotourism" },
      { value: "photography_tour",     label: "Photography Tours" },
      { value: "ski_mountaineering",   label: "Ski Mountaineering" },
      { value: "truffle_hunting",      label: "Truffle Hunting" },
    ],
  },
];

// Flat map: subcategory value → parent category value
const SUBCAT_TO_PARENT: Record<string, string> = {};
const SUBCAT_LABELS: Record<string, string> = {};
for (const cat of CATEGORIES) {
  for (const sub of cat.subcategories) {
    SUBCAT_TO_PARENT[sub.value] = cat.value;
    SUBCAT_LABELS[sub.value] = sub.label;
  }
}

export function getParentCategory(subcatValue: string | null | undefined): string {
  if (!subcatValue) return "";
  return SUBCAT_TO_PARENT[subcatValue] ?? subcatValue;
}

export function getSubcategoryLabel(subcatValue: string | null | undefined): string {
  if (!subcatValue) return "";
  return SUBCAT_LABELS[subcatValue] ?? subcatValue;
}

export function getCategoryLabel(parentValue: string): string {
  return CATEGORIES.find(c => c.value === parentValue)?.label ?? parentValue;
}
