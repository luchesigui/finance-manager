import{j as n}from"./jsx-runtime-BjG_zV1W.js";import{T as t}from"./TransferCard-BkT7rOFy.js";import"./clsx-B-dksMZM.js";const h={title:"Design System/TransferCard",component:t,parameters:{layout:"padded"},tags:["autodocs"],argTypes:{status:{control:"inline-radio",options:["pending","done"],description:"Status da transferência"},amount:{control:"number",description:"Valor da transferência"},empty:{control:"boolean",description:"Exibe estado vazio"},from:{control:"object",description:"Pessoa remetente"},to:{control:"object",description:"Pessoa destinatária"},onMarkDone:{action:"onMarkDone",description:"Callback de marcar como concluído"}},args:{from:{name:"Guilherme",initial:"G"},to:{name:"Amanda",initial:"A"},amount:1250.75,status:"pending"}},e={args:{status:"pending"}},a={args:{status:"done"}},r={args:{empty:!0}},o={render:()=>n.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1rem",maxWidth:560},children:[n.jsx(t,{from:{name:"Guilherme",initial:"G"},to:{name:"Amanda",initial:"A"},amount:1250.75,status:"pending",onMarkDone:()=>console.log("onMarkDone")}),n.jsx(t,{from:{name:"Guilherme",initial:"G"},to:{name:"Amanda",initial:"A"},amount:1250.75,status:"done"}),n.jsx(t,{empty:!0})]})};var s,i,m;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    status: "pending"
  }
}`,...(m=(i=e.parameters)==null?void 0:i.docs)==null?void 0:m.source}}};var d,c,l;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    status: "done"
  }
}`,...(l=(c=a.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};var p,u,g;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    empty: true
  }
}`,...(g=(u=r.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var f,x,y;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxWidth: 560
  }}>
      <TransferCard from={{
      name: "Guilherme",
      initial: "G"
    }} to={{
      name: "Amanda",
      initial: "A"
    }} amount={1250.75} status="pending" onMarkDone={() => console.log("onMarkDone")} />
      <TransferCard from={{
      name: "Guilherme",
      initial: "G"
    }} to={{
      name: "Amanda",
      initial: "A"
    }} amount={1250.75} status="done" />
      <TransferCard empty />
    </div>
}`,...(y=(x=o.parameters)==null?void 0:x.docs)==null?void 0:y.source}}};const j=["Pending","Done","Empty","AllVariants"];export{o as AllVariants,a as Done,r as Empty,e as Pending,j as __namedExportsOrder,h as default};
