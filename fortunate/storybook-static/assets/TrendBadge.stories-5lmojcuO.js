import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{T as d}from"./TrendBadge-D7JsGOGo.js";import"./Pill-Bsap-_Mk.js";import"./clsx-B-dksMZM.js";const B={title:"Design System/TrendBadge",component:d,parameters:{layout:"centered"},argTypes:{trend:{control:"radio",options:["up","down","neutral"]},children:{control:"text"}},tags:["autodocs"]},r={args:{trend:"up",children:"Investido R$ 15.000,00"}},n={args:{trend:"down",children:"Despesas R$ 10.756,80"}},a={args:{trend:"neutral",children:"Sem variação"}},s={render:()=>e.jsxs("div",{style:{display:"flex",gap:"0.75rem",flexWrap:"wrap"},children:[e.jsx(d,{trend:"up",children:"Investido +R$ 2.500"}),e.jsx(d,{trend:"down",children:"Investido -R$ 2.500"}),e.jsx(d,{trend:"neutral",children:"Investido R$ 0,00"})]})};var t,o,c;r.parameters={...r.parameters,docs:{...(t=r.parameters)==null?void 0:t.docs,source:{originalSource:`{
  args: {
    trend: "up",
    children: "Investido R$ 15.000,00"
  }
}`,...(c=(o=r.parameters)==null?void 0:o.docs)==null?void 0:c.source}}};var i,p,l;n.parameters={...n.parameters,docs:{...(i=n.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    trend: "down",
    children: "Despesas R$ 10.756,80"
  }
}`,...(l=(p=n.parameters)==null?void 0:p.docs)==null?void 0:l.source}}};var m,u,g;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    trend: "neutral",
    children: "Sem variação"
  }
}`,...(g=(u=a.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var v,x,h;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap"
  }}>
      <TrendBadge trend="up">Investido +R$ 2.500</TrendBadge>
      <TrendBadge trend="down">Investido -R$ 2.500</TrendBadge>
      <TrendBadge trend="neutral">Investido R$ 0,00</TrendBadge>
    </div>
}`,...(h=(x=s.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};const I=["Up","Down","Neutral","AllVariants"];export{s as AllVariants,n as Down,a as Neutral,r as Up,I as __namedExportsOrder,B as default};
