export type PrefectureKey = "heraklion" | "chania" | "rethymno" | "lasithi";

export interface Town {
  value: string;
  label: string;
}

export interface Prefecture {
  value: PrefectureKey;
  label: string;
  towns: Town[];
}

export const PREFECTURES: Prefecture[] = [
  {
    value: "heraklion",
    label: "Νομός Ηρακλείου",
    towns: [
      { value: "heraklion_city",   label: "Ηράκλειο" },
      { value: "malia",            label: "Μάλια" },
      { value: "hersonissos",      label: "Χερσόνησος" },
      { value: "gouves",           label: "Γούβες" },
      { value: "anissaras",        label: "Ανίσσαρας" },
      { value: "anogia",           label: "Ανόγεια" },
      { value: "arkadi",           label: "Αρκάδι" },
      { value: "zaros",            label: "Ζαρός" },
    ],
  },
  {
    value: "chania",
    label: "Νομός Χανίων",
    towns: [
      { value: "chania_city",      label: "Χανιά" },
      { value: "kolympari",        label: "Κολυμπάρι" },
      { value: "paleochora",       label: "Παλαιόχωρα" },
      { value: "sfakia",           label: "Σφακιά" },
      { value: "sougia",           label: "Σούγια" },
      { value: "georgioupoli",     label: "Γεωργιούπολη" },
      { value: "vamos",            label: "Βάμος" },
    ],
  },
  {
    value: "rethymno",
    label: "Νομός Ρεθύμνου",
    towns: [
      { value: "rethymno_city",    label: "Ρέθυμνο" },
      { value: "plakias",          label: "Πλακιάς" },
      { value: "agia_galini",      label: "Αγία Γαλήνη" },
      { value: "spili",            label: "Σπήλι" },
    ],
  },
  {
    value: "lasithi",
    label: "Νομός Λασιθίου",
    towns: [
      { value: "agios_nikolaos",   label: "Άγιος Νικόλαος" },
      { value: "elounda",          label: "Ελούντα" },
      { value: "siteia",           label: "Σητεία" },
      { value: "ierapetra",        label: "Ιεράπετρα" },
      { value: "lasithi_plateau",  label: "Οροπέδιο Λασιθίου" },
    ],
  },
];

export const ALL_TOWNS: Town[] = PREFECTURES.flatMap((p) => p.towns);

/** Returns the prefecture key for a given town value */
export function getPrefectureForTown(townValue: string): PrefectureKey | null {
  for (const pref of PREFECTURES) {
    if (pref.towns.some((t) => t.value === townValue)) return pref.value;
  }
  return null;
}

/** Returns the Greek display label for a town or prefecture value */
export function getAreaLabel(value: string): string {
  const town = ALL_TOWNS.find((t) => t.value === value);
  if (town) return town.label;
  const pref = PREFECTURES.find((p) => p.value === value);
  return pref?.label ?? value;
}
