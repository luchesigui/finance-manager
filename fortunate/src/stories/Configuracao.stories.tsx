import type { Meta, StoryObj } from "@storybook/react";
import type React from "react";
import { useState } from "react";
import { Button } from "../components/Button/Button";
import { CloudBackground } from "../components/CloudBackground/CloudBackground";
import { GlassCard } from "../components/GlassCard/GlassCard";
import { CapsuleRadio, Input, Select } from "../components/Input/Input";
import { PilarCard, type PilarKey } from "../components/PilarCard/PilarCard";

const meta = {
  title: "Fortunate / Configuração",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

/* ─── Mock initial states ─── */

interface Person {
  id: string;
  name: string;
}

interface CustomCategory {
  id: string;
  name: string;
  pillarId: string;
}

interface ApiKey {
  id: string;
  name: string;
  token: string;
  createdAt: string;
}

const INITIAL_PEOPLE: Person[] = [
  { id: "1", name: "Guilherme" },
  { id: "2", name: "Amanda" },
];

const PILLARS: { id: PilarKey; name: string; color: string }[] = [
  { id: "essenciais", name: "Gastos Essenciais", color: "var(--pilar-essenciais)" },
  { id: "liberdade", name: "Liberdade Financeira", color: "var(--pilar-liberdade)" },
  { id: "conforto", name: "Conforto", color: "var(--pilar-conforto)" },
  { id: "metas", name: "Metas", color: "var(--pilar-metas)" },
  { id: "prazeres", name: "Prazeres", color: "var(--pilar-prazeres)" },
  { id: "conhecimento", name: "Conhecimento", color: "var(--pilar-conhecimento)" },
];

const INITIAL_CATEGORIES: CustomCategory[] = [
  { id: "c1", name: "Aluguel", pillarId: "essenciais" },
  { id: "c2", name: "Supermercado", pillarId: "essenciais" },
  { id: "c3", name: "Luz & Água", pillarId: "essenciais" },
  { id: "c4", name: "Investimentos Renda Fixa", pillarId: "liberdade" },
  { id: "c5", name: "Ações & Fundos", pillarId: "liberdade" },
  { id: "c6", name: "Academia", pillarId: "conforto" },
  { id: "c7", name: "Assinaturas de Streaming", pillarId: "conforto" },
  { id: "c8", name: "Reserva de Oportunidade", pillarId: "metas" },
  { id: "c9", name: "Restaurantes & Delivery", pillarId: "prazeres" },
  { id: "c10", name: "Viagens curtas", pillarId: "prazeres" },
  { id: "c11", name: "Livros & Cursos", pillarId: "conhecimento" },
];

const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: "k1",
    name: "Script Python Automação",
    token: "fortunate_jwt_k1••••••••••••••••••••",
    createdAt: "15/06/2026",
  },
  {
    id: "k2",
    name: "Telegram Bot Notifier",
    token: "fortunate_jwt_k2••••••••••••••••••••",
    createdAt: "20/06/2026",
  },
];

/* ─── Helper: Currency Parser & Formatter ─── */
function parseBrazilianCurrencyToNumber(inputValue: string): number | null {
  const digitsOnly = inputValue.replace(/\D/g, "");
  if (digitsOnly.length === 0) return null;

  const centsValue = Number.parseInt(digitsOnly, 10);
  if (!Number.isFinite(centsValue)) return null;

  return centsValue / 100;
}

function formatBrlCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/* ─── Styles ─── */
const sectionHeaderStyle: React.CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: "1.25rem",
  fontWeight: 600,
  letterSpacing: "0.01em",
  color: "var(--c-content)",
  marginBottom: "1rem",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const dividerStyle: React.CSSProperties = {
  borderBottom: "1.5px solid color-mix(in srgb, var(--c-content) 8%, transparent)",
  margin: "1.5rem 0",
};

function ConfiguracaoForm() {
  /* ─── Profile State ─── */
  const [profileName, setProfileName] = useState("Guilherme");
  const [profileEmail, setProfileEmail] = useState("guilherme@exemplo.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: "success" | "error" } | null>(
    null,
  );

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setProfileMsg({ text: "A nova senha e a confirmação não conferem.", type: "error" });
      return;
    }
    setProfileMsg({ text: "Configurações de perfil salvas com sucesso!", type: "success" });
    setTimeout(() => setProfileMsg(null), 3000);
  };

  /* ─── Household State ─── */
  const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE);
  const [defaultPayerId, setDefaultPayerId] = useState("1");
  const [newPersonName, setNewPersonName] = useState("");
  const [isAddingPerson, setIsAddingPerson] = useState(false);

  const handleAddPerson = () => {
    if (!newPersonName.trim()) return;
    const newPerson: Person = {
      id: String(Date.now()),
      name: newPersonName.trim(),
    };
    setPeople([...people, newPerson]);
    setNewPersonName("");
    setIsAddingPerson(false);
  };

  const handleDeletePerson = (id: string) => {
    if (id === "1") return; // O perfil principal não pode se excluir
    if (people.length <= 1) {
      alert("É necessário ter pelo menos 1 participante no household.");
      return;
    }
    const filtered = people.filter((p) => p.id !== id);
    setPeople(filtered);
    if (defaultPayerId === id) {
      setDefaultPayerId(filtered[0].id);
    }
  };

  /* ─── Emergency Fund State ─── */
  const [emergencyFund, setEmergencyFund] = useState<number>(35000);
  const [emergencyFundMsg, setEmergencyFundMsg] = useState(false);

  const handleSaveEmergencyFund = () => {
    setEmergencyFundMsg(true);
    setTimeout(() => setEmergencyFundMsg(false), 2000);
  };

  /* ─── Pillars and Categories State ─── */
  const [pillarTargets, setPillarTargets] = useState<Record<PilarKey, number>>({
    essenciais: 25,
    liberdade: 30,
    conforto: 15,
    metas: 15,
    prazeres: 10,
    conhecimento: 5,
  });
  const [categories, setCategories] = useState<CustomCategory[]>(INITIAL_CATEGORIES);
  const [newCatName, setNewCatName] = useState("");
  const [selectedPillarId, setSelectedPillarId] = useState("essenciais");
  const [pillarMsg, setPillarMsg] = useState(false);

  const handleTargetChange = (pillarId: string, val: number) => {
    setPillarTargets({
      ...pillarTargets,
      [pillarId]: val,
    });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat: CustomCategory = {
      id: String(Date.now()),
      name: newCatName.trim(),
      pillarId: selectedPillarId,
    };
    setCategories([...categories, newCat]);
    setNewCatName("");
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const totalTargetPercent = Object.values(pillarTargets).reduce((a, b) => a + b, 0);

  const handleSavePillars = () => {
    if (totalTargetPercent !== 100) {
      alert("O total planejado das metas deve somar exatamente 100%.");
      return;
    }
    setPillarMsg(true);
    setTimeout(() => setPillarMsg(false), 2000);
  };

  /* ─── AI OpenRouter State ─── */
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [aiAnalysisMonths, setAiAnalysisMonths] = useState("3");
  const [aiCustomContext, setAiCustomContext] = useState(
    "Quero reduzir delivery, somos um casal com 1 filho, objetivo de fazer reserva de emergência de R$ 30k...",
  );
  const [aiMsg, setAiMsg] = useState(false);

  const handleSaveAi = () => {
    setAiMsg(true);
    setTimeout(() => setAiMsg(false), 2000);
  };

  /* ─── Application API Keys State ─── */
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_API_KEYS);
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{ name: string; token: string } | null>(
    null,
  );

  const handleGenerateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiKeyName.trim()) return;

    const randomHex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
    const generatedToken = `fortunate_jwt_key_${randomHex.slice(0, 16)}••••••••••••••••••••`;

    const newKey: ApiKey = {
      id: String(Date.now()),
      name: newApiKeyName.trim(),
      token: generatedToken,
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };

    setApiKeys([...apiKeys, newKey]);
    setNewlyCreatedKey({
      name: newKey.name,
      token: `fortunate_jwt_key_${randomHex}`,
    });
    setNewApiKeyName("");
  };

  const handleRevokeApiKey = (id: string) => {
    if (
      confirm("Deseja realmente revogar esta chave de API? Ela deixará de funcionar imediatamente.")
    ) {
      setApiKeys(apiKeys.filter((k) => k.id !== id));
      if (newlyCreatedKey) setNewlyCreatedKey(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--c-bg)",
        padding: "6rem 2rem 10rem",
        position: "relative",
        fontFamily: "var(--font-body)",
        color: "var(--c-content)",
      }}
    >
      <CloudBackground />

      {/* Local styles for standardized hover behavior on delete button */}
      <style>{`
        .trash-btn {
          background: transparent;
          border: none;
          color: var(--c-content-muted);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-base);
        }
        .trash-btn:hover {
          color: var(--status-negative) !important;
          background: color-mix(in srgb, var(--status-negative) 12%, transparent) !important;
          transform: scale(1.08);
        }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2.8rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: "0 0 0.5rem",
            }}
          >
            Configurações
          </h1>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--c-content-muted)",
            }}
          >
            Perfil, participações, metas de orçamento e chaves de API
          </p>
        </div>

        {/* 1 & 3. PERFIL & RESERVA DE EMERGÊNCIA (Lado a Lado) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2.5rem",
            alignItems: "stretch",
          }}
        >
          {/* Perfil */}
          <GlassCard variant="fino" style={{ padding: "2rem" }}>
            <h2 style={sectionHeaderStyle}>
              <span>👤</span> Perfil
            </h2>
            <form
              onSubmit={handleProfileSave}
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
            >
              <Input
                label="Nome"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
              />
              <Input
                label="E-mail"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                required
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Input
                  label="Senha Atual"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  label="Nova Senha"
                  type="password"
                  placeholder="Min. 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              {profileMsg && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    fontSize: "0.88rem",
                    fontWeight: 500,
                    backgroundColor:
                      profileMsg.type === "success"
                        ? "color-mix(in srgb, var(--status-positive) 15%, transparent)"
                        : "color-mix(in srgb, var(--status-negative) 15%, transparent)",
                    color:
                      profileMsg.type === "success"
                        ? "var(--status-positive)"
                        : "var(--status-negative)",
                    border: `1px solid ${
                      profileMsg.type === "success"
                        ? "color-mix(in srgb, var(--status-positive) 30%, transparent)"
                        : "color-mix(in srgb, var(--status-negative) 30%, transparent)"
                    }`,
                  }}
                >
                  {profileMsg.text}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" variant="action">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </GlassCard>

          {/* Reserva de Emergência */}
          <GlassCard
            variant="fino"
            style={{
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2 style={sectionHeaderStyle}>
                <span>🛡️</span> Reserva de Emergência
              </h2>
              <p
                style={{
                  fontSize: "0.88rem",
                  color: "var(--c-content-muted)",
                  marginBottom: "1.5rem",
                  lineHeight: "1.5",
                }}
              >
                Informe o valor total guardado da sua família. Este valor serve de referência para
                as simulações e o termômetro de saúde financeira.
              </p>
              <div style={{ marginBottom: "1.5rem" }}>
                <Input
                  label="Valor Acumulado"
                  placeholder="R$ 0,00"
                  type="text"
                  value={emergencyFund === null ? "" : formatBrlCurrency(emergencyFund)}
                  onChange={(e) => {
                    const num = parseBrazilianCurrencyToNumber(e.target.value);
                    setEmergencyFund(num ?? 0);
                  }}
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              {emergencyFundMsg && (
                <span
                  style={{ fontSize: "0.85rem", color: "var(--status-positive)", fontWeight: 600 }}
                >
                  Salvo com sucesso! ✓
                </span>
              )}
              <Button onClick={handleSaveEmergencyFund}>Salvar Reserva</Button>
            </div>
          </GlassCard>
        </div>

        {/* 2. PARTICIPANTES & RESPONSÁVEL PADRÃO */}
        <GlassCard variant="fino" style={{ padding: "2.5rem" }}>
          <h2 style={sectionHeaderStyle}>
            <span>👥</span> Participantes do Household
          </h2>
          <p
            style={{ fontSize: "0.9rem", color: "var(--c-content-muted)", marginBottom: "1.5rem" }}
          >
            Gerencie quem faz parte do seu household. O responsável padrão será o pagador
            pré-selecionado para novos lançamentos.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {people.map((person) => (
              <div
                key={person.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem 1.25rem",
                  borderRadius: "var(--radius-card)",
                  background: "color-mix(in srgb, var(--c-glass) 15%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--c-content) 6%, transparent)",
                  boxShadow: "var(--shadow-glass-3d)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "var(--c-action)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontFamily: "var(--font-heading)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {person.name[0].toUpperCase()}
                  </div>
                  <div>
                    <span
                      style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--c-content)" }}
                    >
                      {person.name}
                    </span>
                    {person.id === "1" && (
                      <span
                        style={{
                          marginLeft: "0.5rem",
                          fontSize: "0.7rem",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "4px",
                          background: "color-mix(in srgb, var(--c-content) 10%, transparent)",
                          color: "var(--c-content-muted)",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        Você (Perfil Principal)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {person.id !== "1" && (
                    <button
                      type="button"
                      onClick={() => handleDeletePerson(person.id)}
                      className="trash-btn"
                      title="Remover participante"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <title>Excluir</title>
                        <path
                          d="M2.5 4H11.5M5 4V2.5H9V4M5.5 6.5V10.5M8.5 6.5V10.5M3.5 4L4 11.5H10L10.5 4"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add member form */}
          {isAddingPerson ? (
            <div
              style={{
                display: "flex",
                gap: "1.25rem",
                alignItems: "end",
                padding: "1.5rem",
                borderRadius: "var(--radius-card)",
                background: "color-mix(in srgb, var(--c-glass) 8%, transparent)",
                border: "1.5px dashed color-mix(in srgb, var(--c-content) 20%, transparent)",
                marginBottom: "2rem",
              }}
            >
              <div style={{ flex: 1 }}>
                <Input
                  label="Nome do Novo Participante"
                  placeholder="Ex: Amanda"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Button variant="outline" onClick={() => setIsAddingPerson(false)}>
                  Cancelar
                </Button>
                <Button variant="action" onClick={handleAddPerson}>
                  Adicionar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsAddingPerson(true)}
              style={{ width: "100%", borderStyle: "dashed", marginBottom: "2rem" }}
            >
              + Adicionar Novo Participante
            </Button>
          )}

          {/* Default Payer (CapsuleRadio component) */}
          {people.length > 1 && (
            <div
              style={{
                paddingTop: "1.5rem",
                borderTop: "1.5px solid color-mix(in srgb, var(--c-content) 8%, transparent)",
              }}
            >
              <CapsuleRadio
                label="Responsável Padrão"
                options={people.map((p) => ({ value: p.id, label: p.name }))}
                value={defaultPayerId}
                onChange={(val) => setDefaultPayerId(val)}
              />
            </div>
          )}
        </GlassCard>

        {/* 4. GERENCIAMENTO DE CATEGORIAS E PILARES */}
        <GlassCard variant="fino" style={{ padding: "2.5rem" }}>
          <h2 style={sectionHeaderStyle}>
            <span>📊</span> Pilares & Categorias do Orçamento
          </h2>
          <p
            style={{ fontSize: "0.9rem", color: "var(--c-content-muted)", marginBottom: "1.5rem" }}
          >
            Configure o percentual de meta para cada um dos 6 pilares fundamentais (somando
            exatamente 100%) e gerencie suas subcategorias customizadas.
          </p>

          {/* Grid de Metas dos Pilares */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.25rem",
              marginBottom: "2rem",
            }}
          >
            {PILLARS.map((pillar) => (
              <PilarCard
                key={pillar.id}
                mode="config"
                pilar={pillar.id}
                percentTarget={pillarTargets[pillar.id]}
                onPercentChange={(val) => handleTargetChange(pillar.id, val)}
              />
            ))}
          </div>

          {/* Sum Validator (SEM WRAPPER VERDE/VERMELHO) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.3rem",
              marginBottom: "2rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600, fontSize: "1rem", color: "var(--c-content)" }}>
                Total Planejado:{" "}
                <span
                  style={{
                    color:
                      totalTargetPercent === 100
                        ? "var(--status-positive)"
                        : "var(--status-negative)",
                    fontWeight: 700,
                  }}
                >
                  {totalTargetPercent}%
                </span>
              </span>
              <Button
                variant="action"
                disabled={totalTargetPercent !== 100}
                onClick={handleSavePillars}
              >
                {pillarMsg ? "Metas Salvas! ✓" : "Salvar Metas"}
              </Button>
            </div>
            {totalTargetPercent !== 100 && (
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--status-negative)",
                  fontWeight: 500,
                }}
              >
                A soma das metas precisa ser de exatamente 100% para salvar (atualmente{" "}
                {totalTargetPercent}%).
              </span>
            )}
          </div>

          <div style={dividerStyle} />

          {/* Gerenciador de Categorias Customizadas (LAYOUT MEIO A MEIO, SEM OVERFLOW SCROLL) */}
          <h3 style={{ ...sectionHeaderStyle, fontSize: "1.1rem" }}>Categorias por Pilar</h3>
          <p
            style={{ fontSize: "0.85rem", color: "var(--c-content-muted)", marginBottom: "1.5rem" }}
          >
            Vincule categorias aos pilares correspondentes. Todos os itens são exibidos sem
            necessidade de barra de rolagem.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2.5rem",
              alignItems: "start",
            }}
          >
            {/* Listagem Agrupada (meio a meio, sem overflow scroll) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {PILLARS.map((pillar) => {
                const pillarCats = categories.filter((c) => c.pillarId === pillar.id);
                return (
                  <div key={pillar.id}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        paddingBottom: "0.25rem",
                        borderBottom: `1.5px solid color-mix(in srgb, ${pillar.color} 30%, transparent)`,
                        marginBottom: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: pillar.color,
                        }}
                      />
                      <span
                        style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase" }}
                      >
                        {pillar.name}
                      </span>
                    </div>

                    {pillarCats.length === 0 ? (
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--c-content-muted)",
                          fontStyle: "italic",
                          paddingLeft: "1rem",
                        }}
                      >
                        Nenhuma subcategoria vinculada.
                      </span>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                          paddingLeft: "0.5rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        {pillarCats.map((cat) => (
                          <div
                            key={cat.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              padding: "0.35rem 0.75rem",
                              borderRadius: "var(--radius-pill)",
                              background: "color-mix(in srgb, var(--c-glass) 12%, transparent)",
                              border:
                                "1px solid color-mix(in srgb, var(--c-content) 10%, transparent)",
                              fontSize: "0.82rem",
                              fontWeight: 500,
                            }}
                          >
                            <span>{cat.name}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="trash-btn"
                              style={{ padding: "0.15rem", borderRadius: "50%" }}
                              title="Remover categoria"
                            >
                              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                                <title>Excluir</title>
                                <path
                                  d="M2.5 4H11.5M5 4V2.5H9V4M5.5 6.5V10.5M8.5 6.5V10.5M3.5 4L4 11.5H10L10.5 4"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Criar Nova Categoria (1/3 de largura) */}
            <GlassCard
              variant="denso"
              radius="card"
              style={{
                padding: "1.5rem",
                background: "color-mix(in srgb, var(--c-glass) 6%, transparent)",
                border: "1px dashed color-mix(in srgb, var(--c-content) 18%, transparent)",
              }}
            >
              <h4 style={{ ...sectionHeaderStyle, fontSize: "0.95rem", marginBottom: "1rem" }}>
                Criar Nova Categoria
              </h4>
              <form
                onSubmit={handleAddCategory}
                style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
              >
                <Input
                  label="Nome da Categoria"
                  placeholder="Ex: Supermercado"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
                <Select
                  label="Pilar Financeiro Associado"
                  value={selectedPillarId}
                  onChange={(e) => setSelectedPillarId(e.target.value)}
                  options={PILLARS.map((p) => ({ value: p.id, label: p.name }))}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                  <Button type="submit" variant="action" size="sm">
                    Criar Categoria
                  </Button>
                </div>
              </form>
            </GlassCard>
          </div>
        </GlassCard>

        {/* 5. CONFIGURAÇÕES DE IA (OPENROUTER) */}
        <GlassCard variant="fino" style={{ padding: "2.5rem" }}>
          <h2 style={sectionHeaderStyle}>
            <span>🧠</span> Configurações de Inteligência Artificial
          </h2>
          <p
            style={{ fontSize: "0.9rem", color: "var(--c-content-muted)", marginBottom: "1.5rem" }}
          >
            Configure o motor de IA que gera seus insights financeiros automáticos mensais e sugere
            planos de otimização.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <Input
              label="Chave de API do OpenRouter"
              type="password"
              placeholder="Insira sua chave sk-or-..."
              value={openrouterKey}
              onChange={(e) => setOpenrouterKey(e.target.value)}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.25rem" }}>
              <Select
                label="Período de Análise"
                value={aiAnalysisMonths}
                onChange={(e) => setAiAnalysisMonths(e.target.value)}
                options={[
                  { value: "3", label: "Últimos 3 meses" },
                  { value: "6", label: "Últimos 6 meses" },
                  { value: "12", label: "Últimos 12 meses" },
                ]}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--c-content-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                    display: "block",
                    marginBottom: "0.4rem",
                  }}
                >
                  Contexto Familiar Customizado
                </span>
                <textarea
                  value={aiCustomContext}
                  onChange={(e) => setAiCustomContext(e.target.value)}
                  placeholder="Instruções e metas que a IA deve priorizar nas análises..."
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    borderRadius: "var(--radius-input)",
                    padding: "0.6rem 0.8rem",
                    background: "color-mix(in srgb, var(--c-light) 6%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--c-content) 18%, transparent)",
                    color: "var(--c-content)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleSaveAi}>
              {aiMsg ? "Configurações de IA Salvas! ✓" : "Salvar Configurações de IA"}
            </Button>
          </div>
        </GlassCard>

        {/* 6. CHAVES DE API DA APLICAÇÃO (LAYOUT EM DUAS COLUNAS: LISTA 1.6/2.6 E GERADOR 1/2.6) */}
        <GlassCard variant="fino" style={{ padding: "2.5rem" }}>
          <h2 style={sectionHeaderStyle}>
            <span>🔑</span> Chaves de API para Integrações
          </h2>
          <p
            style={{ fontSize: "0.9rem", color: "var(--c-content-muted)", marginBottom: "1.5rem" }}
          >
            Crie tokens seguros para integrar outras aplicações e scripts para inserção automática
            de lançamentos via nossa API REST.
          </p>

          {/* Newly created key overlay alert */}
          {newlyCreatedKey && (
            <div
              style={{
                padding: "1.5rem",
                borderRadius: "var(--radius-card)",
                background: "color-mix(in srgb, var(--status-positive) 12%, transparent)",
                border: "1.5px solid var(--status-positive)",
                marginBottom: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div>
                <strong
                  style={{ display: "block", fontSize: "0.95rem", color: "var(--status-positive)" }}
                >
                  Chave criada com sucesso!
                </strong>
                <span style={{ fontSize: "0.85rem", color: "var(--c-content-muted)" }}>
                  Copie o token abaixo agora. Por segurança, ele não será exibido novamente.
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  background: "color-mix(in srgb, var(--c-dark) 40%, transparent)",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid color-mix(in srgb, var(--c-content) 12%, transparent)",
                  alignItems: "center",
                }}
              >
                <code
                  style={{
                    flex: 1,
                    fontSize: "0.85rem",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {newlyCreatedKey.token}
                </code>
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(newlyCreatedKey.token);
                    alert("Chave copiada para a área de transferência!");
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr",
              gap: "2.5rem",
              alignItems: "start",
            }}
          >
            {/* Left Column: List of Keys */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {apiKeys.length === 0 ? (
                <span
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--c-content-muted)",
                    fontStyle: "italic",
                  }}
                >
                  Você não possui nenhuma chave de API ativa.
                </span>
              ) : (
                apiKeys.map((key) => (
                  <div
                    key={key.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1rem 1.25rem",
                      borderRadius: "var(--radius-card)",
                      background: "color-mix(in srgb, var(--c-glass) 12%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--c-content) 8%, transparent)",
                      boxShadow: "var(--shadow-glass-3d)",
                    }}
                  >
                    <div>
                      <strong
                        style={{ display: "block", fontSize: "0.95rem", color: "var(--c-content)" }}
                      >
                        {key.name}
                      </strong>
                      <span style={{ fontSize: "0.78rem", color: "var(--c-content-muted)" }}>
                        Criada em {key.createdAt} • Token:{" "}
                        <code style={{ fontSize: "0.78rem" }}>{key.token}</code>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevokeApiKey(key.id)}
                      className="trash-btn"
                      title="Revogar chave de API"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <title>Excluir</title>
                        <path
                          d="M2.5 4H11.5M5 4V2.5H9V4M5.5 6.5V10.5M8.5 6.5V10.5M3.5 4L4 11.5H10L10.5 4"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Right Column: Generate Key Form */}
            <GlassCard
              variant="denso"
              radius="card"
              style={{
                padding: "1.5rem",
                background: "color-mix(in srgb, var(--c-glass) 6%, transparent)",
                border: "1px dashed color-mix(in srgb, var(--c-content) 18%, transparent)",
              }}
            >
              <h4 style={{ ...sectionHeaderStyle, fontSize: "0.95rem", marginBottom: "1rem" }}>
                Gerar Nova Chave
              </h4>
              <form
                onSubmit={handleGenerateApiKey}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <Input
                  label="Nome da Chave"
                  placeholder="Ex: Script de Backup"
                  value={newApiKeyName}
                  onChange={(e) => setNewApiKeyName(e.target.value)}
                  required
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button type="submit" size="sm">
                    Gerar Chave
                  </Button>
                </div>
              </form>
            </GlassCard>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ─── Stories ─── */

export const PaginaConfiguracao: Story = {
  render: () => <ConfiguracaoForm />,
};
