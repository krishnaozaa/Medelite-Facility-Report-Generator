import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { BrandHeader, BRAND_LOGO_SRC, REPORT_BRAND_PLATFORM, REPORT_TITLE } from "./BrandHeader";

describe("BrandHeader", () => {
  it("renders the static brand and report title", () => {
    render(<BrandHeader />);

    expect(screen.getByRole("img", { name: REPORT_BRAND_PLATFORM }).getAttribute("src")).toContain(
      BRAND_LOGO_SRC.replace("/", ""),
    );
    expect(screen.getByText(REPORT_BRAND_PLATFORM)).toHaveClass("sr-only");
    expect(screen.getByRole("heading", { level: 1, name: REPORT_TITLE })).toBeInTheDocument();
  });
});
