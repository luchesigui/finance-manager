import { DashboardPreview } from "@/views/DashboardPreview/DashboardPreview";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "2rem", color: "var(--c-content-muted)", textAlign: "center" }}>
          Carregando...
        </div>
      }
    >
      <DashboardPreview />
    </Suspense>
  );
}
