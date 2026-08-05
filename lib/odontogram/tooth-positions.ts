import { isPrimaryTooth, primaryToPermanentSlot } from "./tooth-data";

export type ToothPosition = { x: number; y: number; width: number; height: number };

const HIT_REGION_WIDTH = 6.5;
const HIT_REGION_HEIGHT = 6.5;

/** Center points as a percentage of public/odontogram/adult-chart.svg,
 * measured directly from the artwork so hit regions land on each tooth. */
const PERMANENT_TOOTH_CENTERS: Record<number, { x: number; y: number }> = {
  11: { x: 46.87, y: 4.18 },
  12: { x: 41.22, y: 5.78 },
  13: { x: 36.46, y: 8.25 },
  14: { x: 32.51, y: 11.70 },
  15: { x: 28.87, y: 15.91 },
  16: { x: 26.23, y: 20.91 },
  17: { x: 24.03, y: 26.82 },
  18: { x: 24.91, y: 33.06 },
  21: { x: 52.60, y: 4.18 },
  22: { x: 58.25, y: 5.78 },
  23: { x: 63.02, y: 8.25 },
  24: { x: 66.96, y: 11.70 },
  25: { x: 70.60, y: 15.92 },
  26: { x: 73.23, y: 20.91 },
  27: { x: 75.65, y: 26.82 },
  28: { x: 74.84, y: 33.06 },
  31: { x: 52.68, y: 75.85 },
  32: { x: 58.32, y: 74.25 },
  33: { x: 63.08, y: 71.77 },
  34: { x: 67.02, y: 68.32 },
  35: { x: 70.65, y: 64.10 },
  36: { x: 73.28, y: 59.09 },
  37: { x: 75.69, y: 53.18 },
  38: { x: 74.89, y: 46.92 },
  41: { x: 46.97, y: 75.85 },
  42: { x: 41.33, y: 74.25 },
  43: { x: 36.57, y: 71.77 },
  44: { x: 32.64, y: 68.32 },
  45: { x: 29.00, y: 64.10 },
  46: { x: 26.37, y: 59.09 },
  47: { x: 24.18, y: 53.18 },
  48: { x: 25.05, y: 46.92 },
};

export function getToothPosition(toothNumber: number): ToothPosition {
  const permanentSlot = isPrimaryTooth(toothNumber)
    ? primaryToPermanentSlot(toothNumber)
    : toothNumber;
  const center = PERMANENT_TOOTH_CENTERS[permanentSlot];
  if (!center) {
    throw new Error(`No chart position for tooth ${toothNumber}`);
  }
  return { x: center.x, y: center.y, width: HIT_REGION_WIDTH, height: HIT_REGION_HEIGHT };
}
