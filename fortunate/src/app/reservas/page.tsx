import { ReservasView } from "@/views/Reservas/Reservas";
import { Suspense } from "react";

export default function ReservasPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "2rem", color: "var(--c-content-muted)", textAlign: "center" }}>
          Carregando Reservas...
        </div>
      }
    >
      <ReservasView />
    </Suspense>
  );
}
