import { describe, expect, it } from "vitest";
import {
  PERMANENT_TEETH,
  PRIMARY_TEETH,
  primaryToPermanentSlot,
  isPrimaryTooth,
  getToothName,
  getToothType,
  getActiveTeeth,
} from "./tooth-data";

describe("PERMANENT_TEETH / PRIMARY_TEETH", () => {
  it("has all 32 permanent FDI numbers", () => {
    expect(PERMANENT_TEETH).toHaveLength(32);
    expect(PERMANENT_TEETH).toContain(11);
    expect(PERMANENT_TEETH).toContain(48);
  });

  it("has all 20 primary FDI numbers", () => {
    expect(PRIMARY_TEETH).toHaveLength(20);
    expect(PRIMARY_TEETH).toContain(51);
    expect(PRIMARY_TEETH).toContain(85);
  });
});

describe("isPrimaryTooth", () => {
  it("identifies primary vs permanent numbers", () => {
    expect(isPrimaryTooth(51)).toBe(true);
    expect(isPrimaryTooth(85)).toBe(true);
    expect(isPrimaryTooth(11)).toBe(false);
    expect(isPrimaryTooth(48)).toBe(false);
  });
});

describe("primaryToPermanentSlot", () => {
  it("maps each primary quadrant to its permanent counterpart, same position", () => {
    expect(primaryToPermanentSlot(51)).toBe(11);
    expect(primaryToPermanentSlot(55)).toBe(15);
    expect(primaryToPermanentSlot(61)).toBe(21);
    expect(primaryToPermanentSlot(75)).toBe(35);
    expect(primaryToPermanentSlot(81)).toBe(41);
  });
});

describe("getToothName", () => {
  it("names permanent teeth by position and quadrant", () => {
    expect(getToothName(11)).toBe("Central Incisor (Upper Right)");
    expect(getToothName(28)).toBe("Third Molar (Upper Left)");
  });

  it("names primary teeth with a Primary prefix, no premolars/3rd molars", () => {
    expect(getToothName(51)).toBe("Primary Central Incisor (Upper Right)");
    expect(getToothName(85)).toBe("Primary Second Molar (Lower Right)");
  });
});

describe("getToothType", () => {
  it("classifies permanent tooth positions", () => {
    expect(getToothType(11)).toBe("incisor");
    expect(getToothType(13)).toBe("canine");
    expect(getToothType(14)).toBe("premolar");
    expect(getToothType(16)).toBe("molar");
  });

  it("classifies primary tooth positions (molars, not premolars)", () => {
    expect(getToothType(54)).toBe("molar");
    expect(getToothType(53)).toBe("canine");
  });
});

describe("getActiveTeeth", () => {
  it("returns all 32 permanent numbers for PERMANENT and MIXED", () => {
    expect(getActiveTeeth("PERMANENT")).toEqual(PERMANENT_TEETH);
    expect(getActiveTeeth("MIXED")).toEqual(PERMANENT_TEETH);
  });

  it("returns the 20 primary numbers for PRIMARY", () => {
    expect(getActiveTeeth("PRIMARY")).toEqual(PRIMARY_TEETH);
  });
});
