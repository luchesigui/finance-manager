import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{P as r}from"./PilarCard-qtP9AHNo.js";import"./clsx-B-dksMZM.js";import"./Badge-CqFdJuvc.js";import"./Pill-Bsap-_Mk.js";const D={title:"Design System/PilarCard",component:r,parameters:{layout:"centered"},argTypes:{pilar:{control:"select",options:["essenciais","conforto","prazeres","conhecimento","metas","liberdade"]},targetValue:{control:"number"},usedValue:{control:"number"}},tags:["autodocs"]},n={args:{pilar:"essenciais",targetValue:1e4,usedValue:4800},render:a=>e.jsx("div",{style:{width:320},children:e.jsx(r,{...a})})},t={args:{pilar:"metas",targetValue:8e3,usedValue:0},render:a=>e.jsx("div",{style:{width:320},children:e.jsx(r,{...a})})},l={args:{pilar:"conforto",targetValue:5e3,usedValue:6350},render:a=>e.jsx("div",{style:{width:320},children:e.jsx(r,{...a})})},o={render:()=>e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",width:840,gap:"1.25rem"},children:[e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:[e.jsx("p",{style:{fontFamily:"var(--font-body)",fontSize:"0.75rem",color:"var(--c-content-muted)",textAlign:"center",margin:0},children:"Zerado"}),e.jsx(r,{pilar:"prazeres",targetValue:3e3,usedValue:0})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:[e.jsx("p",{style:{fontFamily:"var(--font-body)",fontSize:"0.75rem",color:"var(--c-content-muted)",textAlign:"center",margin:0},children:"Padrão"}),e.jsx(r,{pilar:"prazeres",targetValue:3e3,usedValue:750})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:[e.jsx("p",{style:{fontFamily:"var(--font-body)",fontSize:"0.75rem",color:"var(--c-content-muted)",textAlign:"center",margin:0},children:"Overflow"}),e.jsx(r,{pilar:"prazeres",targetValue:3e3,usedValue:3810})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:[e.jsx("p",{style:{fontFamily:"var(--font-body)",fontSize:"0.75rem",color:"var(--c-content-muted)",textAlign:"center",margin:0},children:"Zerado"}),e.jsx(r,{pilar:"conforto",targetValue:5e3,usedValue:0})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:[e.jsx("p",{style:{fontFamily:"var(--font-body)",fontSize:"0.75rem",color:"var(--c-content-muted)",textAlign:"center",margin:0},children:"Padrão"}),e.jsx(r,{pilar:"conforto",targetValue:5e3,usedValue:3250})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:[e.jsx("p",{style:{fontFamily:"var(--font-body)",fontSize:"0.75rem",color:"var(--c-content-muted)",textAlign:"center",margin:0},children:"Overflow"}),e.jsx(r,{pilar:"conforto",targetValue:5e3,usedValue:6350})]})]})},i={render:()=>e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:"1.25rem",width:680},children:[e.jsx(r,{pilar:"essenciais",targetValue:1e4,usedValue:4800}),e.jsx(r,{pilar:"conforto",targetValue:5e3,usedValue:3250}),e.jsx(r,{pilar:"prazeres",targetValue:3e3,usedValue:750}),e.jsx(r,{pilar:"conhecimento",targetValue:2e3,usedValue:1600}),e.jsx(r,{pilar:"metas",targetValue:8e3,usedValue:1200}),e.jsx(r,{pilar:"liberdade",targetValue:15e3,usedValue:7500})]})};var s,d,c;n.parameters={...n.parameters,docs:{...(s=n.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    pilar: "essenciais",
    targetValue: 10000,
    usedValue: 4800
  },
  render: args => <div style={{
    width: 320
  }}>
      <PilarCard {...args} />
    </div>
}`,...(c=(d=n.parameters)==null?void 0:d.docs)==null?void 0:c.source}}};var u,p,m;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    pilar: "metas",
    targetValue: 8000,
    usedValue: 0
  },
  render: args => <div style={{
    width: 320
  }}>
      <PilarCard {...args} />
    </div>
}`,...(m=(p=t.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};var g,f,y;l.parameters={...l.parameters,docs:{...(g=l.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    pilar: "conforto",
    targetValue: 5000,
    usedValue: 6350
  },
  render: args => <div style={{
    width: 320
  }}>
      <PilarCard {...args} />
    </div>
}`,...(y=(f=l.parameters)==null?void 0:f.docs)==null?void 0:y.source}}};var x,V,v;o.parameters={...o.parameters,docs:{...(x=o.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    width: 840,
    gap: "1.25rem"
  }}>
      {/* Row 1 — prazeres, targetValue: 3000 */}
      <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem"
    }}>
        <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.75rem",
        color: "var(--c-content-muted)",
        textAlign: "center",
        margin: 0
      }}>
          Zerado
        </p>
        <PilarCard pilar="prazeres" targetValue={3000} usedValue={0} />
      </div>
      <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem"
    }}>
        <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.75rem",
        color: "var(--c-content-muted)",
        textAlign: "center",
        margin: 0
      }}>
          Padrão
        </p>
        <PilarCard pilar="prazeres" targetValue={3000} usedValue={750} />
      </div>
      <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem"
    }}>
        <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.75rem",
        color: "var(--c-content-muted)",
        textAlign: "center",
        margin: 0
      }}>
          Overflow
        </p>
        <PilarCard pilar="prazeres" targetValue={3000} usedValue={3810} />
      </div>
      {/* Row 2 — conforto, targetValue: 5000 */}
      <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem"
    }}>
        <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.75rem",
        color: "var(--c-content-muted)",
        textAlign: "center",
        margin: 0
      }}>
          Zerado
        </p>
        <PilarCard pilar="conforto" targetValue={5000} usedValue={0} />
      </div>
      <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem"
    }}>
        <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.75rem",
        color: "var(--c-content-muted)",
        textAlign: "center",
        margin: 0
      }}>
          Padrão
        </p>
        <PilarCard pilar="conforto" targetValue={5000} usedValue={3250} />
      </div>
      <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem"
    }}>
        <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.75rem",
        color: "var(--c-content-muted)",
        textAlign: "center",
        margin: 0
      }}>
          Overflow
        </p>
        <PilarCard pilar="conforto" targetValue={5000} usedValue={6350} />
      </div>
    </div>
}`,...(v=(V=o.parameters)==null?void 0:V.docs)==null?void 0:v.source}}};var j,h,P;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1.25rem",
    width: 680
  }}>
      <PilarCard pilar="essenciais" targetValue={10000} usedValue={4800} />
      <PilarCard pilar="conforto" targetValue={5000} usedValue={3250} />
      <PilarCard pilar="prazeres" targetValue={3000} usedValue={750} />
      <PilarCard pilar="conhecimento" targetValue={2000} usedValue={1600} />
      <PilarCard pilar="metas" targetValue={8000} usedValue={1200} />
      <PilarCard pilar="liberdade" targetValue={15000} usedValue={7500} />
    </div>
}`,...(P=(h=i.parameters)==null?void 0:h.docs)==null?void 0:P.source}}};const A=["Padrao","Zerado","Overflow","StepsComparison","TodosOsPilares"];export{l as Overflow,n as Padrao,o as StepsComparison,i as TodosOsPilares,t as Zerado,A as __namedExportsOrder,D as default};
