export function buildMedicareCareCompareUrl(ccn: string, state: string) {
  const encodedCcn = encodeURIComponent(ccn);
  const encodedState = encodeURIComponent(state);

  return `https://www.medicare.gov/care-compare/details/nursing-home/${encodedCcn}/view-all?state=${encodedState}`;
}
