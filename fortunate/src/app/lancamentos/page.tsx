import { NovoLancamento } from "@/views/NovoLancamento/NovoLancamento";
import { Suspense } from "react";

export default function LancamentosPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "2rem", color: "var(--c-content-muted)", textAlign: "center" }}>
          Carregando...
        </div>
      }
    >
      <NovoLancamento />
    </Suspense>
  );
}
