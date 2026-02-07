import { render, screen } from "@/test/test-utils";
import { describe, expect, it } from "vitest";
import { LandingPage } from "../LandingPage";

describe("LandingPage", () => {
  describe("Page structure", () => {
    it("renders without crashing", () => {
      render(<LandingPage />);
      expect(screen.getByText(/Domine seu futuro/i)).toBeInTheDocument();
    });

    it("renders navigation with logo and links to /entrar", () => {
      render(<LandingPage />);
      expect(screen.getAllByText(/Finanças/i).length).toBeGreaterThan(0);
      const entrarLinks = screen.getAllByRole("link", { name: /Entrar/i });
      expect(entrarLinks.length).toBeGreaterThan(0);
      expect(entrarLinks[0]).toHaveAttribute("href", "/entrar");
    });

    it("renders Começar Agora CTA linking to /entrar", () => {
      render(<LandingPage />);
      const ctaLinks = screen.getAllByRole("link", { name: /Começar Agora/i });
      expect(ctaLinks.length).toBeGreaterThan(0);
      expect(ctaLinks[0]).toHaveAttribute("href", "/entrar");
    });
  });

  describe("Hero section", () => {
    it("renders main heading and CTA", () => {
      render(<LandingPage />);
      expect(screen.getByText(/Domine seu futuro/i)).toBeInTheDocument();
      expect(screen.getByText(/Não seu extrato bancário/i)).toBeInTheDocument();
    });
  });

  describe("Philosophy section", () => {
    it("renders philosophy section with id", () => {
      render(<LandingPage />);
      const section = document.getElementById("philosophy");
      expect(section).toBeInTheDocument();
    });

    it("renders philosophy cards", () => {
      render(<LandingPage />);
      expect(screen.getByText(/Arredondamento Estratégico/i)).toBeInTheDocument();
      expect(screen.getByText(/Foco em Recorrências/i)).toBeInTheDocument();
    });
  });

  describe("Footer", () => {
    it("renders footer with logo and copyright", () => {
      render(<LandingPage />);
      expect(screen.getAllByText(/FinançasPro/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Todos os direitos reservados/i)).toBeInTheDocument();
    });
  });
});
