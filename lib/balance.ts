type MoneyLike = number | string | { toString(): string };

type VisitWithTreatments = {
  additionalFees: MoneyLike;
  amountPaid: MoneyLike;
  discount: MoneyLike;
  treatmentRendered: { feeAtTime: MoneyLike | null; treatment: { treatmentFee: MoneyLike } }[];
};

export function computeVisitBalance(visit: VisitWithTreatments): number {
  const treatmentTotal = visit.treatmentRendered.reduce((sum, tr) => {
    const fee = tr.feeAtTime ?? tr.treatment.treatmentFee;
    return sum + Number(fee);
  }, 0);

  return treatmentTotal + Number(visit.additionalFees) - Number(visit.amountPaid) - Number(visit.discount);
}