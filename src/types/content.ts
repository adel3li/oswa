export type AxisId =
  | "spouses_family"
  | "companions"
  | "children"
  | "servants"
  | "neighbors_guests"
  | "those_who_erred"
  | "afflicted_weak"
  | "elders_public"
  | "adversaries";

export interface HadithSource {
  collection: "bukhari" | "muslim" | "tirmidhi" | "abudawud" | "nasai" | "ibnmajah";
  reference: string;
  sourceUrl: string;
  narrator: string;
  grading: string;
  gradingSource: string;
  matn: "";
  matnVerified: false;
  referenceVerified: false;
}

export interface Mawqif {
  id: string;
  axis: AxisId;
  axisAr: string;
  title: string;
  openingLine: string;
  situation: {
    text: string;
    attributionType: "paraphrase";
    verifiedVerbatim: false;
  };
  primarySources: HadithSource[];
  bridgeRefs?: HadithSource[];
  bookRef: { title: "كيف عاملهم؟"; author: "محمد صالح المنجد"; section: string };
  sharhNote?: {
    text: string;
    source: string;
    attributionType: "paraphrase";
    verifiedVerbatim: false;
  };
  lesson: string;
  muhasabah: string;
  contrast: string;
  applications: string[];
  reflectionQuestion: string;
  closingReflection: string;
  dua?: string;
  reviewStatus: "pending_review";
  addedInVersion: string;
}
