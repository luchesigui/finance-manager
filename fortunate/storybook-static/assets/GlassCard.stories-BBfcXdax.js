import{j as n}from"./jsx-runtime-BjG_zV1W.js";import{G as o}from"./GlassCard-CB8RnAvV.js";import"./clsx-B-dksMZM.js";const y={title:"Design System/GlassCard",component:o,parameters:{layout:"centered"},argTypes:{variant:{control:"radio",options:["fino","denso"],description:"Glass opacity variant — Fino (12%) or Denso (70%)"},radius:{control:"radio",options:["panel","card"],description:"Border radius — panel (24px) or card (20px)"},hover:{control:"boolean",description:"Enable hover lift effect"}},tags:["autodocs"]},a=()=>n.jsxs("div",{children:[n.jsx("p",{style:{fontFamily:"var(--font-heading)",fontSize:"1.1rem",fontWeight:600,marginBottom:"0.5rem",color:"var(--c-content)"},children:"Título do Card"}),n.jsx("p",{style:{fontFamily:"var(--font-body)",fontSize:"0.9rem",color:"var(--c-content-muted)",lineHeight:1.6},children:"Conteúdo do cartão com texto de exemplo para demonstrar a aparência do glassmorphism do Fortunate."})]}),e={args:{variant:"fino",radius:"panel",hover:!0,children:n.jsx(a,{}),style:{width:360}}},t={args:{variant:"denso",radius:"card",hover:!0,children:n.jsx(a,{}),style:{width:360}}},r={render:()=>n.jsxs("div",{style:{display:"flex",gap:"2rem",flexWrap:"wrap",justifyContent:"center"},children:[n.jsxs("div",{style:{textAlign:"center"},children:[n.jsx("p",{style:{fontFamily:"var(--font-heading)",fontSize:"0.75rem",fontWeight:600,color:"var(--c-content-muted)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"1rem"},children:"Glass Fino — 12%"}),n.jsx(o,{variant:"fino",radius:"panel",style:{width:280},children:n.jsx(a,{})})]}),n.jsxs("div",{style:{textAlign:"center"},children:[n.jsx("p",{style:{fontFamily:"var(--font-heading)",fontSize:"0.75rem",fontWeight:600,color:"var(--c-content-muted)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"1rem"},children:"Glass Denso — 70%"}),n.jsx(o,{variant:"denso",radius:"card",style:{width:280},children:n.jsx(a,{})})]})]})};var s,i,d;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    variant: "fino",
    radius: "panel",
    hover: true,
    children: <SampleContent />,
    style: {
      width: 360
    }
  }
}`,...(d=(i=e.parameters)==null?void 0:i.docs)==null?void 0:d.source}}};var l,c,m;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    variant: "denso",
    radius: "card",
    hover: true,
    children: <SampleContent />,
    style: {
      width: 360
    }
  }
}`,...(m=(c=t.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var p,f,h;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: "2rem",
    flexWrap: "wrap",
    justifyContent: "center"
  }}>
      <div style={{
      textAlign: "center"
    }}>
        <p style={{
        fontFamily: "var(--font-heading)",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "var(--c-content-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: "1rem"
      }}>
          Glass Fino — 12%
        </p>
        <GlassCard variant="fino" radius="panel" style={{
        width: 280
      }}>
          <SampleContent />
        </GlassCard>
      </div>
      <div style={{
      textAlign: "center"
    }}>
        <p style={{
        fontFamily: "var(--font-heading)",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "var(--c-content-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: "1rem"
      }}>
          Glass Denso — 70%
        </p>
        <GlassCard variant="denso" radius="card" style={{
        width: 280
      }}>
          <SampleContent />
        </GlassCard>
      </div>
    </div>
}`,...(h=(f=r.parameters)==null?void 0:f.docs)==null?void 0:h.source}}};const x=["Fino","Denso","Comparison"];export{r as Comparison,t as Denso,e as Fino,x as __namedExportsOrder,y as default};
