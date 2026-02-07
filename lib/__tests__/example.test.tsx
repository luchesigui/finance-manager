import { FieldError } from "@/components/ui/FieldError";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const selectors = {
  getErrorText: (text: string) => screen.getByText(text),
};

describe("test setup", () => {
  it("runs with vitest", () => {
    expect(1 + 1).toBe(2);
  });

  it("uses Testing Library and jest-dom", () => {
    render(<FieldError errors={[{ message: "Required" }]} />);
    expect(selectors.getErrorText("Required")).toBeInTheDocument();
  });
});
