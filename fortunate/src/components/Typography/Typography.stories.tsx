import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/Typography",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const AllStyles: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "3rem", maxWidth: 720 }}>
      {/* Display */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: "1.5rem",
          alignItems: "baseline",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--c-content)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Display
          </p>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "0.7rem",
              color: "var(--c-content-muted)",
              marginTop: "0.2rem",
            }}
          >
            Cinzel, 2.2rem, 400
          </p>
        </div>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.2rem",
            letterSpacing: "0.1em",
            color: "var(--c-content)",
          }}
        >
          Fortunate
        </p>
      </div>

      {/* Heading 1 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: "1.5rem",
          alignItems: "baseline",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--c-content)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Heading 1
          </p>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "0.7rem",
              color: "var(--c-content-muted)",
              marginTop: "0.2rem",
            }}
          >
            Outfit, 4.2rem, 700
          </p>
        </div>
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "4.2rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--c-content)",
          }}
        >
          R$ 25.171,45
        </p>
      </div>

      {/* Heading 2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: "1.5rem",
          alignItems: "baseline",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--c-content)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Heading 2
          </p>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "0.7rem",
              color: "var(--c-content-muted)",
              marginTop: "0.2rem",
            }}
          >
            Outfit, 1.8rem, 600
          </p>
        </div>
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.8rem",
            fontWeight: 600,
            color: "var(--c-content)",
          }}
        >
          Distribuição por Pilares
        </p>
      </div>

      {/* Panel Title */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: "1.5rem",
          alignItems: "baseline",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--c-content)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Panel Title
          </p>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "0.7rem",
              color: "var(--c-content-muted)",
              marginTop: "0.2rem",
            }}
          >
            Outfit, 1.4rem, 600
          </p>
        </div>
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.4rem",
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: "var(--c-content)",
            borderBottom: "1.5px solid color-mix(in srgb, var(--c-content) 10%, transparent)",
            paddingBottom: "0.5rem",
          }}
        >
          Suas Carteiras
        </p>
      </div>

      {/* Body */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: "1.5rem",
          alignItems: "baseline",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--c-content)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Body
          </p>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "0.7rem",
              color: "var(--c-content-muted)",
              marginTop: "0.2rem",
            }}
          >
            DM Sans, 0.95rem, 400
          </p>
        </div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            color: "var(--c-content-muted)",
            lineHeight: 1.6,
          }}
        >
          O Fortunate transforma a relação das pessoas com o dinheiro através de clareza visual,
          física elástica e direcionamento inteligente de riqueza.
        </p>
      </div>

      {/* Label / Uppercase */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: "1.5rem",
          alignItems: "baseline",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--c-content)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Label
          </p>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "0.7rem",
              color: "var(--c-content-muted)",
              marginTop: "0.2rem",
            }}
          >
            Outfit, 0.8rem, 600, uppercase
          </p>
        </div>
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.8rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "var(--c-content-muted)",
          }}
        >
          Demonstrativo Financeiro — Maio 2026
        </p>
      </div>
    </div>
  ),
};
