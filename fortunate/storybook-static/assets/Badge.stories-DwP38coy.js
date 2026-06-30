import{j as a}from"./jsx-runtime-BjG_zV1W.js";import{B as e}from"./Badge-CqFdJuvc.js";import"./clsx-B-dksMZM.js";import"./Pill-Bsap-_Mk.js";const x={title:"Design System/Badge",component:e,parameters:{layout:"centered"},argTypes:{variant:{control:"select",options:["pilar-essenciais","pilar-conforto","pilar-prazeres","pilar-conhecimento","pilar-metas","pilar-liberdade"],description:"Variante do pilar para a cor da badge"},children:{control:"text",description:"Conteúdo textual da badge"}},tags:["autodocs"]},r={args:{children:"Badge Default (Metas)"}},i={render:()=>a.jsxs("div",{style:{display:"flex",gap:"0.75rem",flexWrap:"wrap"},children:[a.jsx(e,{variant:"pilar-essenciais",children:"Gastos Essenciais"}),a.jsx(e,{variant:"pilar-conforto",children:"Conforto"}),a.jsx(e,{variant:"pilar-prazeres",children:"Prazeres"}),a.jsx(e,{variant:"pilar-conhecimento",children:"Conhecimento"}),a.jsx(e,{variant:"pilar-metas",children:"Metas"}),a.jsx(e,{variant:"pilar-liberdade",children:"Liberdade Financeira"})]})};var n,s,t;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    children: "Badge Default (Metas)"
  }
}`,...(t=(s=r.parameters)==null?void 0:s.docs)==null?void 0:t.source}}};var o,d,l;i.parameters={...i.parameters,docs:{...(o=i.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap"
  }}>
      <Badge variant="pilar-essenciais">Gastos Essenciais</Badge>
      <Badge variant="pilar-conforto">Conforto</Badge>
      <Badge variant="pilar-prazeres">Prazeres</Badge>
      <Badge variant="pilar-conhecimento">Conhecimento</Badge>
      <Badge variant="pilar-metas">Metas</Badge>
      <Badge variant="pilar-liberdade">Liberdade Financeira</Badge>
    </div>
}`,...(l=(d=i.parameters)==null?void 0:d.docs)==null?void 0:l.source}}};const B=["Default","AllPilares"];export{i as AllPilares,r as Default,B as __namedExportsOrder,x as default};
