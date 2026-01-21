import { describe, expect, it } from "vitest";
import { CATEGORY_COLORS, getCategoryColor, getCategoryColorStyle } from "../categoryColors";

describe("categoryColors", () => {
  describe("CATEGORY_COLORS", () => {
    it("has color for Liberdade Financeira", () => {
      expect(CATEGORY_COLORS["Liberdade Financeira"]).toBe("#664FDB");
    });

    it("has color for Custos Fixos", () => {
      expect(CATEGORY_COLORS["Custos Fixos"]).toBe("#007AFF");
    });

    it("has color for Conforto", () => {
      expect(CATEGORY_COLORS.Conforto).toBe("#FF3C96");
    });

    it("has color for Metas", () => {
      expect(CATEGORY_COLORS.Metas).toBe("#990099");
    });

    it("has color for Prazeres", () => {
      expect(CATEGORY_COLORS.Prazeres).toBe("#FF8000");
    });

    it("has color for Conhecimento", () => {
      expect(CATEGORY_COLORS.Conhecimento).toBe("#FFE600");
    });

    it("has 6 predefined categories", () => {
      expect(Object.keys(CATEGORY_COLORS)).toHaveLength(6);
    });
  });

  describe("getCategoryColor", () => {
    it("returns correct color for known category", () => {
      expect(getCategoryColor("Liberdade Financeira")).toBe("#664FDB");
      expect(getCategoryColor("Custos Fixos")).toBe("#007AFF");
      expect(getCategoryColor("Conforto")).toBe("#FF3C96");
    });

    it("returns default gray for unknown category", () => {
      expect(getCategoryColor("Unknown Category")).toBe("#9CA3AF");
    });

    it("returns default gray for empty string", () => {
      expect(getCategoryColor("")).toBe("#9CA3AF");
    });

    it("is case-sensitive", () => {
      expect(getCategoryColor("custos fixos")).toBe("#9CA3AF");
      expect(getCategoryColor("CUSTOS FIXOS")).toBe("#9CA3AF");
    });
  });

  describe("getCategoryColorStyle", () => {
    it("returns an object with color property for known category", () => {
      const style = getCategoryColorStyle("Liberdade Financeira");
      expect(style).toEqual({ color: "#664FDB" });
    });

    it("returns an object with default color for unknown category", () => {
      const style = getCategoryColorStyle("Unknown");
      expect(style).toEqual({ color: "#9CA3AF" });
    });

    it("returns style object usable for inline styles", () => {
      const style = getCategoryColorStyle("Metas");
      expect(style.color).toBe("#990099");
      expect(typeof style.color).toBe("string");
    });
  });
});
