import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{c as x}from"./clsx-B-dksMZM.js";const y="_container_lga7x_1",f="_card_lga7x_9",h="_card1_lga7x_26",C="_card2_lga7x_33",S="_card3_lga7x_41",j="_inner_lga7x_81",b="_label_lga7x_88",N="_value_lga7x_97",k="_meta_lga7x_104",a={container:y,card:f,card1:h,card2:C,card3:S,inner:j,label:b,value:N,meta:k};function t({cards:r}){const c=r.slice(0,3);return e.jsx("div",{className:a.container,children:c.slice().reverse().map((o,d)=>{const v=c.length-1-d;return e.jsx("div",{className:x(a.card,a[`card${v+1}`]),children:e.jsxs("div",{className:a.inner,children:[e.jsx("span",{className:a.label,children:o.label}),e.jsx("span",{className:a.value,children:o.value}),e.jsx("span",{className:a.meta,children:o.meta})]})},d)})})}t.__docgenInfo={description:"",methods:[],displayName:"StackedCards",props:{cards:{required:!0,tsType:{name:"Array",elements:[{name:"WalletCard"}],raw:"WalletCard[]"},description:""}}};const g=[{label:"Conta Corrente Principal",value:"R$ 14.280,00",meta:"Banco Celestial • Conta Ativa"},{label:"Carteira de Investimentos",value:"R$ 78.430,00",meta:"Ações & Fundos Imobiliários"},{label:"Reserva de Emergência",value:"R$ 25.000,00",meta:"Banco do Sol • Liquidez Diária"}],$={title:"Design System/StackedCards",component:t,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{cards:{control:"object",description:"Array de dados das carteiras empilhadas"}},args:{cards:g}},s={render:r=>e.jsxs("div",{style:{width:420},children:[e.jsx("p",{style:{fontFamily:"var(--font-body)",fontSize:"0.85rem",color:"var(--c-content-muted)",marginBottom:"1rem"},children:"Passe o mouse para ver o efeito Tarot Spread"}),e.jsx(t,{...r})]})},n={args:{cards:[g[0]]},render:r=>e.jsx("div",{style:{width:420},children:e.jsx(t,{...r})})};var l,i,m;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: args => <div style={{
    width: 420
  }}>
      <p style={{
      fontFamily: "var(--font-body)",
      fontSize: "0.85rem",
      color: "var(--c-content-muted)",
      marginBottom: "1rem"
    }}>
        Passe o mouse para ver o efeito Tarot Spread
      </p>
      <StackedCards {...args} />
    </div>
}`,...(m=(i=s.parameters)==null?void 0:i.docs)==null?void 0:m.source}}};var p,u,_;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    cards: [defaultCards[0]]
  },
  render: args => <div style={{
    width: 420
  }}>
      <StackedCards {...args} />
    </div>
}`,...(_=(u=n.parameters)==null?void 0:u.docs)==null?void 0:_.source}}};const A=["Default","SingleCard"];export{s as Default,n as SingleCard,A as __namedExportsOrder,$ as default};
