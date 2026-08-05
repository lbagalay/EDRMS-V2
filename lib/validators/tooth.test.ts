import { describe, expect, it } from "vitest";
import { toothConditionFormSchema, toothTreatmentFormSchema } from "./tooth";

describe("toothConditionFormSchema", () => {
  it("accepts a valid submission", () => {
    const result = toothConditionFormSchema.safeParse({
      toothNumber: "11",
      condition: "CARIES",
      conditionNote: "Small cavity, mesial surface",
      dentistNotes: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown condition value", () => {
    const result = toothConditionFormSchema.safeParse({
      toothNumber: "11",
      condition: "NOT_A_REAL_CONDITION",
    });
    expect(result.success).toBe(false);
  });
});

describe("toothTreatmentFormSchema", () => {
  it("accepts a valid submission", () => {
    const result = toothTreatmentFormSchema.safeParse({
      toothNumber: "16",
      treatmentId: "3",
      status: "PLANNED",
    });
    expect(result.success).toBe(true);
  });

  it("requires a treatmentId", () => {
    const result = toothTreatmentFormSchema.safeParse({
      toothNumber: "16",
      treatmentId: "",
      status: "PLANNED",
    });
    expect(result.success).toBe(false);
  });
});
