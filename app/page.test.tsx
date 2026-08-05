import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home", () => {
  it("shows the getting-started heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: "Welcome to the Bank, Man!",
      }),
    ).toBeInTheDocument();
  });
});
