/**
 * Hadith / Isnad Database — TypeScript type definitions
 * ------------------------------------------------------
 * Mirrors a normalized relational schema (Postgres-oriented).
 * IDs are numeric surrogate keys; swap to `string` if you prefer UUIDs.
 *
 * Design notes baked into these types:
 * - Grades (for both narrators and hadiths) are OPINIONS, not facts —
 *   modeled as arrays/tables of {scholar, grade}, never a single field.
 * - A single hadith (matn) may have multiple sanads (turuq) — SanadLink
 *   rows are never attached directly to Hadith.
 * - Narrator name variants are tracked separately so spelling differences
 *   across manuscripts don't fork into duplicate narrators.
 * - Dates are nullable + carry an `approximate` flag since most classical
 *   birth/death years are disputed or estimated.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Surrogate primary key. Swap to `string` project-wide if using UUIDs. */
export type Id = number;

/** ISO 639-ish tag for the script/language a name or text is written in. */
export type ScriptTag = "ar" | "en" | "transliteration";

/**
 * Reliability categories used in jarh wa ta'dil (criticism/authentication).
 * Kept broad on purpose — the exact wording a scholar used goes in
 * `NarratorGrade.gradeText`; this field is for filtering/aggregation.
 */
export type NarratorGradeCategory =
  | "thiqah" // trustworthy
  | "saduq" // truthful, minor reservations
  | "maqbul" // acceptable
  | "layyin" // weak/soft
  | "daif" // weak
  | "matruk" // abandoned/discarded
  | "kadhdhab" // accused of lying
  | "majhul" // unknown/unidentified
  | "unknown";

/** Standard hadith authenticity grades. Extend as needed per madhhab. */
export type HadithGrade =
  | "sahih"
  | "hasan"
  | "daif"
  | "mawdu"
  | "munkar"
  | "shadhdh"
  | "unknown";

/** How a narrator says they received the report — affects chain strength. */
export type TransmissionVerb =
  | "haddathana" // told us (direct)
  | "akhbarana" // informed us
  | "anbaana" // informed us
  | "sami'tu" // I heard
  | "an" // "from" — ambiguous, relevant for mudallis narrators
  | "qala" // "he said"
  | "other";

export type RelationType = "teacher" | "student";

/** A generation-based ranking of narrators relative to the Companions. */
export type Tabaqah =
  | "sahabi" // Companion
  | "kibar_tabiin" // senior Successor
  | "tabiin" // Successor
  | "tabi_tabiin" // Successor of Successors
  | "later"
  | "unknown";

// ---------------------------------------------------------------------------
// Narrators (rijal)
// ---------------------------------------------------------------------------

export interface Narrator {
  id: Id;

  fullNameAr: string;
  fullNameTranslit: string | null;

  kunya: string | null; // e.g. "Abu Hurairah"
  laqab: string | null; // honorific/nickname
  nasab: string | null; // lineage chain, e.g. "ibn X ibn Y"

  gender: "male" | "female" | "unknown";
  isCompanion: boolean; // Sahabi — special evidentiary status in Sunni tradition
  tabaqah: Tabaqah;

  birthYearHijri: number | null;
  birthYearApprox: boolean;
  deathYearHijri: number | null;
  deathYearApprox: boolean;

  birthplace: string | null;
  residences: string[]; // simple string list; normalize to a table if you need dates per city

  notes: string | null;
}

/** Alternate spellings/renderings of a narrator's name across sources. */
export interface NarratorNameVariant {
  id: Id;
  narratorId: Id; // -> Narrator.id
  variantText: string;
  script: ScriptTag;
  sourceRef: string | null; // where this variant was attested
}

/**
 * A single scholar's opinion on a narrator's reliability.
 * Multiple rows per narrator are expected and normal.
 */
export interface NarratorGrade {
  id: Id;
  narratorId: Id; // -> Narrator.id
  graderScholar: string; // e.g. "Ibn Hajar al-Asqalani"
  gradeCategory: NarratorGradeCategory;
  gradeText: string; // scholar's own wording, un-normalized
  sourceRef: string; // book/page reference
}

/**
 * Explicit teacher/student relationships from biographical (rijal)
 * literature — distinct from relationships merely implied by appearing
 * adjacent in a SanadLink, since not every teacher/student pair the
 * biographers recorded shows up in your collected hadith subset.
 */
export interface NarratorRelation {
  id: Id;
  narratorId: Id; // -> Narrator.id
  relatedNarratorId: Id; // -> Narrator.id
  relationType: RelationType; // "teacher" means relatedNarrator taught narrator
  sourceRef: string | null;
}

// ---------------------------------------------------------------------------
// Collections / Books / Hadiths
// ---------------------------------------------------------------------------

export interface Collection {
  id: Id;
  nameEn: string; // e.g. "Sahih al-Bukhari"
  nameAr: string;
  compiler: string | null; // e.g. "Muhammad al-Bukhari"
  compilerNarratorId: Id | null; // -> Narrator.id, if compiler is also modeled as a narrator
}

export interface Book {
  id: Id;
  collectionId: Id; // -> Collection.id
  bookNumber: number;
  nameEn: string;
  nameAr: string;
}

export interface Hadith {
  id: Id;
  bookId: Id; // -> Book.id
  hadithNumber: number;
  referenceCode: string; // e.g. "Bukhari 1:2:15" — human-friendly citation

  matnAr: string;
  matnEn: string | null;
}

/**
 * A single scholar's grading of a specific hadith.
 * Multiple rows per hadith are expected — grading is never singular.
 */
export interface HadithGradeOpinion {
  id: Id;
  hadithId: Id; // -> Hadith.id
  graderScholar: string;
  grade: HadithGrade;
  sourceRef: string;
}

// ---------------------------------------------------------------------------
// Sanads (chains of narration)
// ---------------------------------------------------------------------------

/**
 * One transmission chain (tariq) for a hadith. A hadith can have several —
 * this is why Sanad is its own entity rather than a field on Hadith.
 */
export interface Sanad {
  id: Id;
  hadithId: Id; // -> Hadith.id
  tarafIndex: number; // which route/chain this is, for hadiths with multiple turuq
}

/**
 * One narrator's position within a specific sanad.
 * `position` is stored in a fixed direction regardless of how the source
 * text phrases it — pick a convention (e.g. 1 = closest to compiler,
 * increasing toward the Prophet/Companion) and stay consistent.
 */
export interface SanadLink {
  id: Id;
  sanadId: Id; // -> Sanad.id
  narratorId: Id; // -> Narrator.id
  position: number; // 1-indexed order within the chain
  transmissionVerb: TransmissionVerb;
  rawNameAsWritten: string; // exact text as it appeared, for provenance/debugging matches
}

// ---------------------------------------------------------------------------
// Convenience aggregate types (not DB tables — useful for API responses)
// ---------------------------------------------------------------------------

/** A fully hydrated sanad, narrator objects inlined in chain order. */
export interface SanadWithNarrators extends Omit<Sanad, "id"> {
  id: Id;
  links: Array<{
    position: number;
    transmissionVerb: TransmissionVerb;
    narrator: Narrator;
  }>;
}

/** A hadith with all its chains and grading opinions attached. */
export interface HadithFull extends Hadith {
  sanads: SanadWithNarrators[];
  grades: HadithGradeOpinion[];
}

/** A narrator with grading opinions and name variants attached. */
export interface NarratorFull extends Narrator {
  nameVariants: NarratorNameVariant[];
  grades: NarratorGrade[];
}
