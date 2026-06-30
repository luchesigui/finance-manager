export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1
        style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--c-content)" }}
      >
        Fortunate
      </h1>
      <p
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--c-content-muted)",
          marginTop: "0.5rem",
        }}
      >
        Design System — run <code>npm run storybook</code> to explore components.
      </p>
    </main>
  );
}
