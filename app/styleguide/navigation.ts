export interface NavSection {
  id: string;
  label: string;
  number: string;
}

export const NAV_SECTIONS: NavSection[] = [
  { id: "section-01-colors", label: "Colors", number: "01" },
  { id: "section-02-typography", label: "Typography", number: "02" },
  { id: "section-03-spacing", label: "Spacing", number: "03" },
  { id: "section-04-radius", label: "Border Radius", number: "04" },
  { id: "section-05-shadows", label: "Shadows", number: "05" },
  { id: "section-06-animations", label: "Animations", number: "06" },
  { id: "section-07-css-components", label: "CSS Components", number: "07" },
  { id: "section-08-shadcn-components", label: "shadcn Components", number: "08" },
  { id: "section-09-custom-components", label: "Custom Components", number: "09" },
];
