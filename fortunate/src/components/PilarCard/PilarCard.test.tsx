import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PilarCard } from "./PilarCard";
import styles from "./PilarCard.module.css";

describe("PilarCard - Metas Rolling", () => {
  it("shows R$0-10k range and 80% progress for 8k value", () => {
    render(
      <PilarCard 
        pilar="metas" 
        variant="rolling" 
        usedValue={8000} 
        rangeStart={0} 
        rangeEnd={10000} 
      />
    );
    expect(screen.getByText("80%")).toBeInTheDocument();
    // Use regex to match BRL formatting which might have non-breaking spaces or different symbols
    expect(screen.getByText(/0.*–.*10\.000/)).toBeInTheDocument();
  });

  it("shows R$10k-20k range and 20% progress for 12k value", () => {
    render(
      <PilarCard 
        pilar="metas" 
        variant="rolling" 
        usedValue={12000} 
        rangeStart={10000} 
        rangeEnd={20000} 
      />
    );
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(screen.getByText(/10\.000.*–.*20\.000/)).toBeInTheDocument();
  });
});

describe("PilarCard - Liberdade Financeira Positiva", () => {
  it("shows green/success when progress is >= 100%", () => {
    const { container } = render(
      <PilarCard 
        pilar="liberdade" 
        variant="positive" 
        usedValue={1500} 
        targetValue={1000} 
      />
    );
    expect(screen.getByText("150%")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(styles.cardSuccess);
  });

  it("is neutral (not red) when progress is < 100%", () => {
    const { container } = render(
      <PilarCard 
        pilar="liberdade" 
        variant="positive" 
        usedValue={500} 
        targetValue={1000} 
      />
    );
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(container.firstChild).not.toHaveClass(styles.cardOverflow);
    expect(container.firstChild).not.toHaveClass(styles.cardSuccess);
  });
});
