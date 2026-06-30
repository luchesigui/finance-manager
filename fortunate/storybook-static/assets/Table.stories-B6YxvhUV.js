import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{G as c}from"./GlassCard-CB8RnAvV.js";import{T as o}from"./Table-DLiiWvXt.js";import"./clsx-B-dksMZM.js";const g=[{date:"28/06",description:"Almoço com equipe",pilar:"Prazeres",amount:"R$ -85,00",type:"expense",isCard:!0},{date:"27/06",description:"Salário — Junho",pilar:"—",amount:"R$ +12.000,00",type:"income"},{date:"26/06",description:"Mensalidade Academia",pilar:"Conforto",amount:"R$ -89,90",type:"expense",isCard:!0},{date:"25/06",description:"Curso de Investimentos",pilar:"Conhecimento",amount:"R$ -297,00",type:"expense"},{date:"24/06",description:"Dividendos FIIs",pilar:"Liberdade Financeira",amount:"R$ +423,50",type:"income"}],h=[{key:"date",header:"Data"},{key:"description",header:"Descrição"},{key:"pilar",header:"Pilar"},{key:"amount",header:"Valor",render:(a,p)=>e.jsx("span",{className:p.type==="income"?"val-positive":"val-negative",children:String(a)})}],x={title:"Design System/Table",component:o,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{columns:{control:"object",description:"Configuração das colunas da tabela"},data:{control:"object",description:"Array de objetos contendo os dados da tabela"},maxLines:{control:"number",description:"Limite máximo de linhas visíveis antes do fade"},showCardBadge:{control:"boolean",description:"Exibe tag/emoji de cartão nos lançamentos devidos"},onReadAllClick:{action:"onReadAllClick",description:"Callback ao clicar em ver tudo"}},args:{columns:h,data:g,showCardBadge:!1}},n={render:a=>e.jsxs(c,{variant:"fino",style:{width:680,padding:"2rem"},children:[e.jsx("h2",{style:{fontFamily:"var(--font-heading)",fontSize:"1.1rem",fontWeight:600,marginBottom:"1.5rem",color:"var(--c-content)"},children:"Últimas Transações"}),e.jsx(o,{...a})]})},r={args:{maxLines:3,showCardBadge:!0},render:a=>e.jsxs(c,{variant:"fino",style:{width:680,padding:"2rem"},children:[e.jsx("h2",{style:{fontFamily:"var(--font-heading)",fontSize:"1.1rem",fontWeight:600,marginBottom:"1.5rem",color:"var(--c-content)"},children:"Últimas Transações"}),e.jsx(o,{...a})]})};var t,s,i;n.parameters={...n.parameters,docs:{...(t=n.parameters)==null?void 0:t.docs,source:{originalSource:`{
  render: args => <GlassCard variant="fino" style={{
    width: 680,
    padding: "2rem"
  }}>
      <h2 style={{
      fontFamily: "var(--font-heading)",
      fontSize: "1.1rem",
      fontWeight: 600,
      marginBottom: "1.5rem",
      color: "var(--c-content)"
    }}>
        Últimas Transações
      </h2>
      <Table {...args} />
    </GlassCard>
}`,...(i=(s=n.parameters)==null?void 0:s.docs)==null?void 0:i.source}}};var d,m,l;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    maxLines: 3,
    showCardBadge: true
  },
  render: args => <GlassCard variant="fino" style={{
    width: 680,
    padding: "2rem"
  }}>
      <h2 style={{
      fontFamily: "var(--font-heading)",
      fontSize: "1.1rem",
      fontWeight: 600,
      marginBottom: "1.5rem",
      color: "var(--c-content)"
    }}>
        Últimas Transações
      </h2>
      <Table {...args} />
    </GlassCard>
}`,...(l=(m=r.parameters)==null?void 0:m.docs)==null?void 0:l.source}}};const C=["Default","ComMaxLines"];export{r as ComMaxLines,n as Default,C as __namedExportsOrder,x as default};
