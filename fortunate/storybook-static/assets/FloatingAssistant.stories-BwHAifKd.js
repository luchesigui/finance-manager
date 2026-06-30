import{j as t}from"./jsx-runtime-BjG_zV1W.js";import{F as o}from"./FloatingAssistant-C1-2EIsU.js";const l={title:"Design System/FloatingAssistant",component:o,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{placeholder:{control:"text",description:"Placeholder do campo de entrada"},promptSuggestions:{control:"object",description:"Sugestões de prompts sugeridos"}}},e={args:{placeholder:"Pergunte ao Fortunate AI… (⌘K)"},render:r=>t.jsx("div",{style:{width:560},children:t.jsx(o,{...r})})},s={args:{placeholder:"Converse com o Fortunate AI…",promptSuggestions:["Resumo financeiro de junho","Meta de liberdade em dia?","Quem gastou mais este mês?"]},render:r=>t.jsx("div",{style:{width:560},children:t.jsx(o,{...r})})};var a,n,d;e.parameters={...e.parameters,docs:{...(a=e.parameters)==null?void 0:a.docs,source:{originalSource:`{
  args: {
    placeholder: "Pergunte ao Fortunate AI… (⌘K)"
  },
  render: args => <div style={{
    width: 560
  }}>
      <FloatingAssistant {...args} />
    </div>
}`,...(d=(n=e.parameters)==null?void 0:n.docs)==null?void 0:d.source}}};var i,c,m;s.parameters={...s.parameters,docs:{...(i=s.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    placeholder: "Converse com o Fortunate AI…",
    promptSuggestions: ["Resumo financeiro de junho", "Meta de liberdade em dia?", "Quem gastou mais este mês?"]
  },
  render: args => <div style={{
    width: 560
  }}>
      <FloatingAssistant {...args} />
    </div>
}`,...(m=(c=s.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};const p=["Default","CustomSuggestions"];export{s as CustomSuggestions,e as Default,p as __namedExportsOrder,l as default};
