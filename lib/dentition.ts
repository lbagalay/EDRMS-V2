export type DentitionType = "PRIMARY" | "MIXED" | "PERMANENT";

function getAgeInYears(birthdate: Date, asOf: Date): number {
  let age = asOf.getFullYear() - birthdate.getFullYear();
  const hasHadBirthdayThisYear =
    asOf.getMonth() > birthdate.getMonth() ||
    (asOf.getMonth() === birthdate.getMonth() && asOf.getDate() >= birthdate.getDate());
  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }
  return age;
}

export function getDentitionType(
  birthdate: Date | null,
  override?: DentitionType,
  asOf: Date = new Date(),
): DentitionType {
  if (override) {
    return override;
  }
  if (!birthdate) {
    return "PERMANENT";
  }
  const age = getAgeInYears(birthdate, asOf);
  if (age <= 5) return "PRIMARY";
  if (age <= 11) return "MIXED";
  return "PERMANENT";
}
