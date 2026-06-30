import{j as e}from"./jsx-runtime-BjG_zV1W.js";const u={title:"Design System/Color Palette",parameters:{layout:"padded"},tags:["autodocs"]};function n({title:o,swatches:i}){return e.jsxs("div",{style:{marginBottom:"3rem"},children:[e.jsx("h2",{style:{fontFamily:"var(--font-heading)",fontSize:"1rem",fontWeight:600,color:"var(--c-content)",marginBottom:"1.5rem",paddingBottom:"0.5rem",borderBottom:"1.5px solid color-mix(in srgb, var(--c-content) 10%, transparent)"},children:o}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:"2rem"},children:i.map(a=>e.jsxs("div",{style:{textAlign:"center",minWidth:100},children:[e.jsx("div",{style:{width:68,height:68,borderRadius:"50%",background:a.cssVar?`var(${a.cssVar})`:a.value,margin:"0 auto 0.75rem",border:"1px solid rgba(255, 255, 255, 0.4)",boxShadow:"0 4px 15px rgba(26, 50, 71, 0.08)"}}),e.jsx("p",{style:{fontFamily:"var(--font-heading)",fontWeight:600,fontSize:"0.8rem",color:"var(--c-content)",marginBottom:"0.2rem"},children:a.name}),e.jsx("p",{style:{fontFamily:"monospace",fontSize:"0.7rem",color:"var(--c-content-muted)"},children:a.value})]},a.name))})]})}const t={render:()=>e.jsxs("div",{style:{maxWidth:760},children:[e.jsx(n,{title:"Paleta Base — O Céu",swatches:[{name:"Céu Topo",value:"#5B8BAF"},{name:"Céu Médio",value:"#8BBAD6"},{name:"Céu Claro",value:"#C3D5E4"},{name:"Nuvem Clara",value:"#F3E8DB"},{name:"Nuvem Escura",value:"#E9DFCE"}]}),e.jsx(n,{title:"Ouro Fortuna — O Brilho",swatches:[{name:"Ouro Fortuna",value:"#E98024"},{name:"Brilho Solar",value:"#F3A83B"}]}),e.jsx(n,{title:"Slate — O Azul Profundo",swatches:[{name:"Azul Profundo",value:"#1A3247"},{name:"Slate Muted",value:"#4A607A"},{name:"Eclipse",value:"#0A131C"}]}),e.jsx(n,{title:"6 Pilares Financeiros",swatches:[{name:"Essenciais",value:"#3B82F6",cssVar:"--pilar-essenciais"},{name:"Conforto",value:"#EC4899",cssVar:"--pilar-conforto"},{name:"Prazeres",value:"#F97316",cssVar:"--pilar-prazeres"},{name:"Conhecimento",value:"#EAB308",cssVar:"--pilar-conhecimento"},{name:"Metas",value:"#6B7280",cssVar:"--pilar-metas"},{name:"Liberdade",value:"#8B5CF6",cssVar:"--pilar-liberdade"}]}),e.jsx(n,{title:"Status Semânticos",swatches:[{name:"Positivo",value:"#10b981"},{name:"Negativo",value:"#e11d48"}]})]})};var r,s,l;t.parameters={...t.parameters,docs:{...(r=t.parameters)==null?void 0:r.docs,source:{originalSource:`{
  render: () => <div style={{
    maxWidth: 760
  }}>
      <SwatchGrid title="Paleta Base — O Céu" swatches={[{
      name: "Céu Topo",
      value: "#5B8BAF"
    }, {
      name: "Céu Médio",
      value: "#8BBAD6"
    }, {
      name: "Céu Claro",
      value: "#C3D5E4"
    }, {
      name: "Nuvem Clara",
      value: "#F3E8DB"
    }, {
      name: "Nuvem Escura",
      value: "#E9DFCE"
    }]} />
      <SwatchGrid title="Ouro Fortuna — O Brilho" swatches={[{
      name: "Ouro Fortuna",
      value: "#E98024"
    }, {
      name: "Brilho Solar",
      value: "#F3A83B"
    }]} />
      <SwatchGrid title="Slate — O Azul Profundo" swatches={[{
      name: "Azul Profundo",
      value: "#1A3247"
    }, {
      name: "Slate Muted",
      value: "#4A607A"
    }, {
      name: "Eclipse",
      value: "#0A131C"
    }]} />
      <SwatchGrid title="6 Pilares Financeiros" swatches={[{
      name: "Essenciais",
      value: "#3B82F6",
      cssVar: "--pilar-essenciais"
    }, {
      name: "Conforto",
      value: "#EC4899",
      cssVar: "--pilar-conforto"
    }, {
      name: "Prazeres",
      value: "#F97316",
      cssVar: "--pilar-prazeres"
    }, {
      name: "Conhecimento",
      value: "#EAB308",
      cssVar: "--pilar-conhecimento"
    }, {
      name: "Metas",
      value: "#6B7280",
      cssVar: "--pilar-metas"
    }, {
      name: "Liberdade",
      value: "#8B5CF6",
      cssVar: "--pilar-liberdade"
    }]} />
      <SwatchGrid title="Status Semânticos" swatches={[{
      name: "Positivo",
      value: "#10b981"
    }, {
      name: "Negativo",
      value: "#e11d48"
    }]} />
    </div>
}`,...(l=(s=t.parameters)==null?void 0:s.docs)==null?void 0:l.source}}};const c=["CelestialPalette"];export{t as CelestialPalette,c as __namedExportsOrder,u as default};
