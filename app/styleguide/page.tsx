import { SectionShell } from "./SectionShell";
import { AnimationsSection } from "./sections/AnimationsSection";
import { ColorsSection } from "./sections/ColorsSection";
import { CssComponentsSection } from "./sections/CssComponentsSection";
import { RadiusSection } from "./sections/RadiusSection";
import { ShadcnComponentsSection } from "./sections/ShadcnComponentsSection";
import { ShadowsSection } from "./sections/ShadowsSection";
import { SpacingSection } from "./sections/SpacingSection";
import { TypographySection } from "./sections/TypographySection";
import { UiComponentsSection } from "./sections/UiComponentsSection";

export default function StyleguidePage() {
  return (
    <main className="flex-1 min-w-0 space-y-16 pb-24">
      <div>
        <h1 className="text-dashboard-title text-heading mb-1">Noir Design System</h1>
        <p className="text-body">
          Living reference for design tokens, CSS components (.noir-*), and shadcn/ui components.
          Theme toggle in the header updates all swatches in real time.
        </p>
      </div>

      <SectionShell id="section-01-colors" number="01" title="Colors">
        <ColorsSection />
      </SectionShell>

      <SectionShell id="section-02-typography" number="02" title="Typography">
        <TypographySection />
      </SectionShell>

      <SectionShell id="section-03-spacing" number="03" title="Spacing">
        <SpacingSection />
      </SectionShell>

      <SectionShell id="section-04-radius" number="04" title="Border Radius">
        <RadiusSection />
      </SectionShell>

      <SectionShell id="section-05-shadows" number="05" title="Shadows">
        <ShadowsSection />
      </SectionShell>

      <SectionShell id="section-06-animations" number="06" title="Animations">
        <AnimationsSection />
      </SectionShell>

      <SectionShell id="section-07-css-components" number="07" title="CSS Components (.noir-*)">
        <CssComponentsSection />
      </SectionShell>

      <SectionShell id="section-08-shadcn-components" number="08" title="shadcn Components">
        <ShadcnComponentsSection />
      </SectionShell>

      <SectionShell id="section-09-custom-components" number="09" title="Custom Components">
        <UiComponentsSection />
      </SectionShell>
    </main>
  );
}
