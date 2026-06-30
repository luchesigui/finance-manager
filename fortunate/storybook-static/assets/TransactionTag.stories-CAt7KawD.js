import{j as a}from"./jsx-runtime-BjG_zV1W.js";import{T as r}from"./TransactionTag-D8wKO5f7.js";import"./clsx-B-dksMZM.js";import"./Pill-Bsap-_Mk.js";const T={title:"Design System/TransactionTag",component:r,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:"select",options:["previsao","fora-do-padrao","cartao","proxima-fatura","recorrente","parcelado"],description:"Variante visual da tag"},label:{control:"text",description:"Texto customizado da tag (opcional)"}}},t={args:{variant:"cartao"}},o={render:()=>a.jsxs("div",{style:{display:"flex",gap:"0.5rem",flexWrap:"wrap"},children:[a.jsx(r,{variant:"previsao"}),a.jsx(r,{variant:"fora-do-padrao"}),a.jsx(r,{variant:"cartao"}),a.jsx(r,{variant:"proxima-fatura"}),a.jsx(r,{variant:"recorrente"}),a.jsx(r,{variant:"parcelado"})]})};var e,n,s;t.parameters={...t.parameters,docs:{...(e=t.parameters)==null?void 0:e.docs,source:{originalSource:`{
  args: {
    variant: "cartao"
  }
}`,...(s=(n=t.parameters)==null?void 0:n.docs)==null?void 0:s.source}}};var i,c,p;o.parameters={...o.parameters,docs:{...(i=o.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap"
  }}>
      <TransactionTag variant="previsao" />
      <TransactionTag variant="fora-do-padrao" />
      <TransactionTag variant="cartao" />
      <TransactionTag variant="proxima-fatura" />
      <TransactionTag variant="recorrente" />
      <TransactionTag variant="parcelado" />
    </div>
}`,...(p=(c=o.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};const x=["Default","TodasAsVariantes"];export{t as Default,o as TodasAsVariantes,x as __namedExportsOrder,T as default};
