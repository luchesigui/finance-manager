import { describe, expect, it } from "vitest";
import {
  AUTO_EXCLUDE_FROM_SPLIT_CATEGORIES,
  MONTH_NAMES_PT_BR,
  normalizeCategoryName,
  shouldCategoryAutoExcludeFromSplit,
} from "../constants";

describe("constants", () => {
  describe("MONTH_NAMES_PT_BR", () => {
    it("has 12 months", () => {
      expect(MONTH_NAMES_PT_BR).toHaveLength(12);
    });

    it("starts with Janeiro", () => {
      expect(MONTH_NAMES_PT_BR[0]).toBe("Janeiro");
    });

    it("ends with Dezembro", () => {
      expect(MONTH_NAMES_PT_BR[11]).toBe("Dezembro");
    });

    it("contains all expected months in order", () => {
      const expectedMonths = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];
      expect(MONTH_NAMES_PT_BR).toEqual(expectedMonths);
    });
  });

  describe("normalizeCategoryName", () => {
    it("converts to lowercase", () => {
      expect(normalizeCategoryName("GROCERIES")).toBe("groceries");
    });

    it("removes leading and trailing whitespace", () => {
      expect(normalizeCategoryName("  food  ")).toBe("food");
    });

    it("removes accents from characters", () => {
      expect(normalizeCategoryName("Liberdade Financeira")).toBe("liberdade financeira");
      expect(normalizeCategoryName("Março")).toBe("marco");
      expect(normalizeCategoryName("Café")).toBe("cafe");
    });

    it("handles complex accented strings", () => {
      expect(normalizeCategoryName("São Paulo")).toBe("sao paulo");
      expect(normalizeCategoryName("Mães e Crianças")).toBe("maes e criancas");
    });

    it("handles already normalized strings", () => {
      expect(normalizeCategoryName("groceries")).toBe("groceries");
    });

    it("handles empty string", () => {
      expect(normalizeCategoryName("")).toBe("");
    });

    it("handles string with only whitespace", () => {
      expect(normalizeCategoryName("   ")).toBe("");
    });
  });

  describe("AUTO_EXCLUDE_FROM_SPLIT_CATEGORIES", () => {
    it("is a Set", () => {
      expect(AUTO_EXCLUDE_FROM_SPLIT_CATEGORIES).toBeInstanceOf(Set);
    });

    it("contains normalized category names", () => {
      expect(AUTO_EXCLUDE_FROM_SPLIT_CATEGORIES.has("liberdade financeira")).toBe(true);
      expect(AUTO_EXCLUDE_FROM_SPLIT_CATEGORIES.has("metas")).toBe(true);
    });

    it("has exactly 2 categories", () => {
      expect(AUTO_EXCLUDE_FROM_SPLIT_CATEGORIES.size).toBe(2);
    });
  });

  describe("shouldCategoryAutoExcludeFromSplit", () => {
    it("returns true for 'Liberdade Financeira'", () => {
      expect(shouldCategoryAutoExcludeFromSplit("Liberdade Financeira")).toBe(true);
    });

    it("returns true for 'Metas'", () => {
      expect(shouldCategoryAutoExcludeFromSplit("Metas")).toBe(true);
    });

    it("returns true regardless of case", () => {
      expect(shouldCategoryAutoExcludeFromSplit("LIBERDADE FINANCEIRA")).toBe(true);
      expect(shouldCategoryAutoExcludeFromSplit("metas")).toBe(true);
      expect(shouldCategoryAutoExcludeFromSplit("MeTaS")).toBe(true);
    });

    it("returns true with extra whitespace", () => {
      expect(shouldCategoryAutoExcludeFromSplit("  Liberdade Financeira  ")).toBe(true);
      expect(shouldCategoryAutoExcludeFromSplit("  Metas  ")).toBe(true);
    });

    it("returns false for other categories", () => {
      expect(shouldCategoryAutoExcludeFromSplit("Groceries")).toBe(false);
      expect(shouldCategoryAutoExcludeFromSplit("Custos Fixos")).toBe(false);
      expect(shouldCategoryAutoExcludeFromSplit("Conforto")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(shouldCategoryAutoExcludeFromSplit("")).toBe(false);
    });

    it("returns false for partial matches", () => {
      expect(shouldCategoryAutoExcludeFromSplit("Liberdade")).toBe(false);
      expect(shouldCategoryAutoExcludeFromSplit("Meta")).toBe(false);
    });
  });
});
