import type { DentitionType } from "@/lib/dentition";

export type ToothType = "incisor" | "canine" | "premolar" | "molar";

type PositionMeta = { name: string; type: ToothType };

const PERMANENT_POSITION_META: PositionMeta[] = [
  { name: "Central Incisor", type: "incisor" },
  { name: "Lateral Incisor", type: "incisor" },
  { name: "Canine", type: "canine" },
  { name: "First Premolar", type: "premolar" },
  { name: "Second Premolar", type: "premolar" },
  { name: "First Molar", type: "molar" },
  { name: "Second Molar", type: "molar" },
  { name: "Third Molar", type: "molar" },
];

const PRIMARY_POSITION_META: PositionMeta[] = [
  { name: "Central Incisor", type: "incisor" },
  { name: "Lateral Incisor", type: "incisor" },
  { name: "Canine", type: "canine" },
  { name: "First Molar", type: "molar" },
  { name: "Second Molar", type: "molar" },
];

const QUADRANT_LABELS: Record<number, string> = {
  1: "Upper Right",
  2: "Upper Left",
  3: "Lower Left",
  4: "Lower Right",
  5: "Upper Right",
  6: "Upper Left",
  7: "Lower Left",
  8: "Lower Right",
};

export const PERMANENT_TEETH: number[] = [1, 2, 3, 4].flatMap((quadrant) =>
  PERMANENT_POSITION_META.map((_, i) => quadrant * 10 + (i + 1)),
);

export const PRIMARY_TEETH: number[] = [5, 6, 7, 8].flatMap((quadrant) =>
  PRIMARY_POSITION_META.map((_, i) => quadrant * 10 + (i + 1)),
);

export function isPrimaryTooth(toothNumber: number): boolean {
  return toothNumber >= 51 && toothNumber <= 85;
}

/** Maps a primary-dentition FDI number (51-85) to the permanent-quadrant
 * FDI number (11-48) whose chart slot it visually reuses. */
export function primaryToPermanentSlot(toothNumber: number): number {
  const quadrant = Math.floor(toothNumber / 10);
  const position = toothNumber % 10;
  return (quadrant - 4) * 10 + position;
}

function getPositionMeta(toothNumber: number): PositionMeta {
  const position = toothNumber % 10;
  const meta = isPrimaryTooth(toothNumber)
    ? PRIMARY_POSITION_META[position - 1]
    : PERMANENT_POSITION_META[position - 1];
  if (!meta) {
    throw new Error(`Unknown tooth number: ${toothNumber}`);
  }
  return meta;
}

export function getToothName(toothNumber: number): string {
  const quadrant = Math.floor(toothNumber / 10);
  const label = QUADRANT_LABELS[quadrant];
  if (!label) {
    throw new Error(`Unknown tooth number: ${toothNumber}`);
  }
  const meta = getPositionMeta(toothNumber);
  const prefix = isPrimaryTooth(toothNumber) ? "Primary " : "";
  return `${prefix}${meta.name} (${label})`;
}

export function getToothType(toothNumber: number): ToothType {
  return getPositionMeta(toothNumber).type;
}

export function getActiveTeeth(dentitionType: DentitionType): number[] {
  if (dentitionType === "PRIMARY") {
    return PRIMARY_TEETH;
  }
  return PERMANENT_TEETH;
}
