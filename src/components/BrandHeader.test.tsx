import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { BrandHeader, BRAND_TEXT, REPORT_TITLE } from "./BrandHeader";

describe("BrandHeader", () => {
  it("renders the static brand and report title", () => {
    render(<BrandHeader />);

    expect(screen.getByText(BRAND_TEXT)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: REPORT_TITLE })).toBeInTheDocument();
  });
});
