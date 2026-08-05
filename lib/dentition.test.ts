import { describe, expect, it } from "vitest";
import { getDentitionType } from "./dentition";

const asOf = new Date("2026-08-05");

describe("getDentitionType", () => {
  it("returns PRIMARY for age 5 or under", () => {
    expect(getDentitionType(new Date("2021-08-05"), undefined, asOf)).toBe("PRIMARY");
    expect(getDentitionType(new Date("2021-08-06"), undefined, asOf)).toBe("PRIMARY");
  });

  it("returns MIXED for age 6 through 11", () => {
    expect(getDentitionType(new Date("2020-08-05"), undefined, asOf)).toBe("MIXED");
    expect(getDentitionType(new Date("2015-08-06"), undefined, asOf)).toBe("MIXED");
  });

  it("returns PERMANENT for age 12 and up", () => {
    expect(getDentitionType(new Date("2014-08-05"), undefined, asOf)).toBe("PERMANENT");
    expect(getDentitionType(new Date("1990-01-01"), undefined, asOf)).toBe("PERMANENT");
  });

  it("defaults to PERMANENT when there is no birthdate on file", () => {
    expect(getDentitionType(null, undefined, asOf)).toBe("PERMANENT");
  });

  it("respects a manual override regardless of age", () => {
    expect(getDentitionType(new Date("1990-01-01"), "PRIMARY", asOf)).toBe("PRIMARY");
    expect(getDentitionType(null, "MIXED", asOf)).toBe("MIXED");
  });
});
