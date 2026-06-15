import { describe, expect, it } from "vitest";

import { buildMedicareCareCompareUrl } from "./medicareUrl";

describe("buildMedicareCareCompareUrl", () => {
  it("builds a Medicare Care Compare nursing-home URL", () => {
    expect(buildMedicareCareCompareUrl("686123", "FL")).toBe(
      "https://www.medicare.gov/care-compare/details/nursing-home/686123/view-all?state=FL",
    );
  });
});
