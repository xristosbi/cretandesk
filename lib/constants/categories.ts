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
    label: "Θαλάσσια & Υδάτινα",
    subcategories: [
      { value: "boat_trip",      label: "Ημερήσια Βαρκάδα" },
      { value: "sailing",        label: "Ιστιοπλοΐα" },
      { value: "snorkeling",     label: "Snorkeling" },
      { value: "diving",         label: "Καταδύσεις" },
      { value: "kayak_sup",      label: "Kayak & SUP" },
      { value: "water_sports",   label: "Θαλάσσια Σπορ" },
      { value: "fishing",        label: "Ψάρεμα" },
      { value: "sea_caves",      label: "Θαλάσσιες Σπηλιές" },
    ],
  },
  {
    value: "adventure",
    label: "Χερσαία & Περιπέτεια",
    subcategories: [
      { value: "hiking",         label: "Πεζοπορία" },
      { value: "gorge",          label: "Φαράγγια" },
      { value: "cycling",        label: "Ποδηλασία / MTB" },
      { value: "jeep_safari",    label: "Jeep Safari" },
      { value: "climbing",       label: "Αναρρίχηση" },
      { value: "horse_riding",   label: "Ιππασία" },
      { value: "caving",         label: "Σπηλαιολογία" },
    ],
  },
  {
    value: "aerial",
    label: "Εναέρια",
    subcategories: [
      { value: "paragliding",    label: "Αλεξίπτωτο Πλαγιάς" },
      { value: "helicopter",     label: "Ελικόπτερο" },
      { value: "skydiving",      label: "Αλεξίπτωτο Ελεύθερης Πτώσης" },
      { value: "hang_gliding",   label: "Ανεμόπτερο" },
      { value: "ultralight",     label: "Μικρό Αεροσκάφος" },
    ],
  },
  {
    value: "gastronomy",
    label: "Γαστρονομία & Παράδοση",
    subcategories: [
      { value: "cooking_class",  label: "Μαθήματα Μαγειρικής" },
      { value: "wine_tasting",   label: "Γευσιγνωσία Κρασιού" },
      { value: "olive_oil",      label: "Ελαιόλαδο & Ελιές" },
      { value: "cheese_making",  label: "Τυροκομία" },
      { value: "farm_visit",     label: "Επίσκεψη Αγροκτήματος" },
      { value: "local_market",   label: "Παραδοσιακή Αγορά" },
      { value: "raki_distill",   label: "Κάζανο Τσικουδιάς" },
    ],
  },
  {
    value: "culture",
    label: "Πολιτισμός & Κληρονομιά",
    subcategories: [
      { value: "knossos",              label: "Κνωσός & Μινωικοί Χώροι" },
      { value: "museum",               label: "Μουσεία" },
      { value: "monastery",            label: "Μοναστήρια" },
      { value: "venetian",             label: "Ενετικά Μνημεία" },
      { value: "traditional_village",  label: "Παραδοσιακά Χωριά" },
      { value: "byzantine",            label: "Βυζαντινοί Ναοί" },
      { value: "archaeological",       label: "Αρχαιολογικοί Χώροι" },
    ],
  },
  {
    value: "vip",
    label: "VIP & Concierge",
    subcategories: [
      { value: "private_yacht",        label: "Private Yacht" },
      { value: "helicopter_transfer",  label: "Μεταφορά με Ελικόπτερο" },
      { value: "private_chef",         label: "Private Chef Experience" },
      { value: "luxury_tour",          label: "Luxury Guided Tour" },
      { value: "sunset_cruise",        label: "Sunset Cruise" },
      { value: "villa_experience",     label: "Villa Experience" },
    ],
  },
  {
    value: "niche",
    label: "Ειδικά Ενδιαφέροντα",
    subcategories: [
      { value: "photography",          label: "Φωτογραφία" },
      { value: "wellness_yoga",        label: "Wellness & Yoga" },
      { value: "birdwatching",         label: "Παρατήρηση Πουλιών" },
      { value: "astronomy",            label: "Αστρονομία" },
      { value: "painting",             label: "Ζωγραφική" },
      { value: "greek_language",       label: "Ελληνική Γλώσσα & Πολιτισμός" },
      { value: "volunteering",         label: "Εθελοντισμός & Περιβάλλον" },
    ],
  },
];

export function getCategoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function getSubcategoryLabel(catValue: string, subValue: string): string {
  const cat = CATEGORIES.find((c) => c.value === catValue);
  return cat?.subcategories.find((s) => s.value === subValue)?.label ?? subValue;
}
