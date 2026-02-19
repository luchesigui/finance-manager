import { notFound } from "next/navigation";
import { StyleguideSidebar } from "./StyleguideSidebar";

export const metadata = {
  title: "Styleguide — Noir Design System",
};

export default function StyleguideLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex gap-12">
        <StyleguideSidebar />
        {children}
      </div>
    </div>
  );
}
