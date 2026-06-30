import{j as n}from"./jsx-runtime-BjG_zV1W.js";import{B as a}from"./Button-Dv9rwRD0.js";import"./clsx-B-dksMZM.js";const G={title:"Design System/Button",component:a,parameters:{layout:"centered"},argTypes:{variant:{control:"radio",options:["action","glass","outline"],description:"Visual style variant"},size:{control:"radio",options:["sm","md","lg"],description:"Button size"},children:{control:"text"}},tags:["autodocs"]},r={args:{variant:"action",size:"md",children:"Inserir Lançamento"}},e={args:{variant:"glass",size:"md",children:"Exportar Dados"}},t={args:{variant:"outline",size:"md",children:"Cancelar"}},s={render:()=>n.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1rem",alignItems:"flex-start"},children:[n.jsx(a,{variant:"action",size:"sm",children:"Pequeno"}),n.jsx(a,{variant:"action",size:"md",children:"Médio"}),n.jsx(a,{variant:"action",size:"lg",children:"Grande"})]})},i={render:()=>n.jsxs("div",{style:{display:"flex",gap:"1rem",flexWrap:"wrap"},children:[n.jsx(a,{variant:"action",children:"Ação Principal"}),n.jsx(a,{variant:"glass",children:"Glass"}),n.jsx(a,{variant:"outline",children:"Outline"})]})};var o,l,c;r.parameters={...r.parameters,docs:{...(o=r.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    variant: "action",
    size: "md",
    children: "Inserir Lançamento"
  }
}`,...(c=(l=r.parameters)==null?void 0:l.docs)==null?void 0:c.source}}};var d,m,p;e.parameters={...e.parameters,docs:{...(d=e.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    variant: "glass",
    size: "md",
    children: "Exportar Dados"
  }
}`,...(p=(m=e.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var u,g,v;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    variant: "outline",
    size: "md",
    children: "Cancelar"
  }
}`,...(v=(g=t.parameters)==null?void 0:g.docs)==null?void 0:v.source}}};var x,z,B;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    alignItems: "flex-start"
  }}>
      <Button variant="action" size="sm">
        Pequeno
      </Button>
      <Button variant="action" size="md">
        Médio
      </Button>
      <Button variant="action" size="lg">
        Grande
      </Button>
    </div>
}`,...(B=(z=s.parameters)==null?void 0:z.docs)==null?void 0:B.source}}};var h,f,y;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap"
  }}>
      <Button variant="action">Ação Principal</Button>
      <Button variant="glass">Glass</Button>
      <Button variant="outline">Outline</Button>
    </div>
}`,...(y=(f=i.parameters)==null?void 0:f.docs)==null?void 0:y.source}}};const D=["Action","Glass","Outline","AllSizes","AllVariants"];export{r as Action,s as AllSizes,i as AllVariants,e as Glass,t as Outline,D as __namedExportsOrder,G as default};
