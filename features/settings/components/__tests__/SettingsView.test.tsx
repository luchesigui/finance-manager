import { describe, it } from "vitest";

/**
 * SettingsView integration tests.
 * NOTE: Full implementation blocked by ThemeProvider/matchMedia in jsdom.
 * The test cases below document expected behavior per the integration test plan.
 */
const selectors = {
  // Add getters when tests are implemented, e.g. getTitle: () => screen.getByRole("heading", { name: /Configurações/i }),
};

describe.skip("SettingsView", () => {
  it.todo(
    "renders without crashing when APIs return minimal data",
  );
  it.todo(
    "renders title Configurações and sections: Participantes, Reserva de Emergência, Categorias, Aparência",
  );
  it.todo(
    "renders PersonEditRow for each person with name and income",
  );
  it.todo(
    "Adicionar Novo Participante opens form; submitting calls POST /api/people",
  );
  it.todo(
    "saving participant changes calls PATCH /api/people",
  );
  it.todo(
    "ao falhar PATCH people ou POST people: exibir alert/mensagem de erro",
  );
  it.todo(
    "radio group for default payer; selecting calls PATCH /api/default-payer",
  );
  it.todo(
    "Reserva de Emergência: CurrencyInput, Salvar when changed, calls PATCH /api/emergency-fund",
  );
  it.todo(
    "ao falhar PATCH emergency-fund: exibir feedback de erro",
  );
  it.todo(
    "Categorias: each category with targetPercent, Total Planejado, save calls PATCH /api/categories",
  );
  it.todo(
    "ao falhar PATCH categories: exibir feedback de erro",
  );
  it.todo(
    "delete person: confirm dialog, on confirm calls DELETE /api/people",
  );
  it.todo(
    "ao falhar DELETE people: exibir feedback de erro",
  );
  it.todo(
    "Aparência: theme options Sistema, Escuro, Claro; selecting calls setTheme",
  );
});
