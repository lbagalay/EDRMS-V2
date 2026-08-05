import { describe, expect, it } from "vitest";
import { getToothPosition } from "./tooth-positions";
import { getActiveTeeth } from "./tooth-data";
import type { DentitionType } from "@/lib/dentition";

describe("getToothPosition", () => {
  it("returns a position for every permanent tooth", () => {
    for (const toothNumber of getActiveTeeth("PERMANENT")) {
      const position = getToothPosition(toothNumber);
      expect(position.x).toBeGreaterThan(0);
      expect(position.x).toBeLessThan(100);
      expect(position.y).toBeGreaterThan(0);
      expect(position.y).toBeLessThan(100);
    }
  });

  it("returns a position for every primary tooth by reusing its permanent slot", () => {
    for (const toothNumber of getActiveTeeth("PRIMARY")) {
      expect(() => getToothPosition(toothNumber)).not.toThrow();
    }
  });

  it("gives primary tooth 51 the same position as permanent tooth 11", () => {
    expect(getToothPosition(51)).toEqual(getToothPosition(11));
  });

  it("throws for an unknown tooth number", () => {
    expect(() => getToothPosition(99)).toThrow();
  });

  it("covers every active tooth across all three dentition types with no gaps", () => {
    const dentitionTypes: DentitionType[] = ["PRIMARY", "MIXED", "PERMANENT"];
    for (const dentitionType of dentitionTypes) {
      for (const toothNumber of getActiveTeeth(dentitionType)) {
        expect(() => getToothPosition(toothNumber)).not.toThrow();
      }
    }
  });
});
