import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{c as b}from"./clsx-B-dksMZM.js";const q="_toast_1v5ku_5",P="_icon_1v5ku_26",E="_success_1v5ku_37",N="_error_1v5ku_41",R="_warning_1v5ku_45",$="_info_1v5ku_49",B="_body_1v5ku_55",F="_title_1v5ku_61",A="_message_1v5ku_70",I="_close_1v5ku_79",H="_progress_1v5ku_103",M="_toastProgress_1v5ku_1",s={toast:q,icon:P,success:E,error:N,warning:R,info:$,body:B,title:F,message:A,close:I,progress:H,toastProgress:M},O={success:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none","aria-hidden":!0,children:[e.jsx("circle",{cx:"8",cy:"8",r:"7.5",stroke:"currentColor",strokeWidth:"1.2"}),e.jsx("polyline",{points:"4.5,8.5 7,11 11.5,5.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",fill:"none"})]}),error:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none","aria-hidden":!0,children:[e.jsx("circle",{cx:"8",cy:"8",r:"7.5",stroke:"currentColor",strokeWidth:"1.2"}),e.jsx("line",{x1:"5",y1:"5",x2:"11",y2:"11",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("line",{x1:"11",y1:"5",x2:"5",y2:"11",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),warning:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none","aria-hidden":!0,children:[e.jsx("path",{d:"M8 1.5L14.5 13.5H1.5L8 1.5Z",stroke:"currentColor",strokeWidth:"1.2",strokeLinejoin:"round",fill:"none"}),e.jsx("line",{x1:"8",y1:"6",x2:"8",y2:"9.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("circle",{cx:"8",cy:"11.5",r:"0.75",fill:"currentColor"})]}),info:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none","aria-hidden":!0,children:[e.jsx("circle",{cx:"8",cy:"8",r:"7.5",stroke:"currentColor",strokeWidth:"1.2"}),e.jsx("line",{x1:"8",y1:"7",x2:"8",y2:"11.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("circle",{cx:"8",cy:"4.75",r:"0.85",fill:"currentColor"})]})};function r({variant:l="info",title:W,message:d,onDismiss:m,autoDismiss:S=!1}){return e.jsxs("div",{className:b(s.toast,s[l]),role:"alert","aria-live":"assertive",children:[e.jsx("div",{className:s.icon,"aria-hidden":!0,children:O[l]}),e.jsxs("div",{className:s.body,children:[e.jsx("p",{className:s.title,children:W}),d&&e.jsx("p",{className:s.message,children:d})]}),m&&e.jsx("button",{className:s.close,onClick:m,"aria-label":"Fechar notificação",children:e.jsxs("svg",{width:"10",height:"10",viewBox:"0 0 10 10",fill:"none","aria-hidden":!0,children:[e.jsx("line",{x1:"1.5",y1:"1.5",x2:"8.5",y2:"8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),e.jsx("line",{x1:"8.5",y1:"1.5",x2:"1.5",y2:"8.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})}),S&&e.jsx("div",{className:s.progress,"aria-hidden":!0})]})}r.__docgenInfo={description:"",methods:[],displayName:"Toast",props:{variant:{required:!1,tsType:{name:"union",raw:'"success" | "error" | "warning" | "info"',elements:[{name:"literal",value:'"success"'},{name:"literal",value:'"error"'},{name:"literal",value:'"warning"'},{name:"literal",value:'"info"'}]},description:"",defaultValue:{value:'"info"',computed:!1}},title:{required:!0,tsType:{name:"string"},description:""},message:{required:!1,tsType:{name:"string"},description:""},onDismiss:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},autoDismiss:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};const J={title:"Design System/Toast",component:r,parameters:{layout:"centered"},argTypes:{variant:{control:"radio",options:["success","error","warning","info"],description:"Visual variant — controls accent color and icon"},title:{control:"text"},message:{control:"text"},autoDismiss:{control:"boolean",description:"Show animated progress bar at bottom (4s CSS animation)"}},tags:["autodocs"]},o={args:{variant:"success",title:"Lançamento registrado",message:"R$ 85,00 adicionado aos Prazeres."}},a={args:{variant:"error",title:"Erro ao salvar",message:"Verifique os campos e tente novamente."}},t={args:{variant:"warning",title:"Limite próximo",message:"Você atingiu 85% do limite de Conforto."}},n={args:{variant:"info",title:"Dica Fortuna",message:"Você pode categorizar lançamentos por voz."}},i={args:{variant:"success",title:"Lançamento registrado",message:"R$ 85,00 adicionado aos Prazeres.",autoDismiss:!0}},c={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1rem"},children:[e.jsx(r,{variant:"success",title:"Lançamento registrado",message:"R$ 85,00 adicionado aos Prazeres.",onDismiss:()=>{}}),e.jsx(r,{variant:"error",title:"Erro ao salvar",message:"Verifique os campos e tente novamente.",onDismiss:()=>{}}),e.jsx(r,{variant:"warning",title:"Limite próximo",message:"Você atingiu 85% do limite de Conforto.",onDismiss:()=>{}}),e.jsx(r,{variant:"info",title:"Dica Fortuna",message:"Você pode categorizar lançamentos por voz.",onDismiss:()=>{}})]})};var u,g,p;o.parameters={...o.parameters,docs:{...(u=o.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    variant: "success",
    title: "Lançamento registrado",
    message: "R$ 85,00 adicionado aos Prazeres."
  }
}`,...(p=(g=o.parameters)==null?void 0:g.docs)==null?void 0:p.source}}};var v,x,f;a.parameters={...a.parameters,docs:{...(v=a.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    variant: "error",
    title: "Erro ao salvar",
    message: "Verifique os campos e tente novamente."
  }
}`,...(f=(x=a.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};var h,k,_;t.parameters={...t.parameters,docs:{...(h=t.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    variant: "warning",
    title: "Limite próximo",
    message: "Você atingiu 85% do limite de Conforto."
  }
}`,...(_=(k=t.parameters)==null?void 0:k.docs)==null?void 0:_.source}}};var y,j,w;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    variant: "info",
    title: "Dica Fortuna",
    message: "Você pode categorizar lançamentos por voz."
  }
}`,...(w=(j=n.parameters)==null?void 0:j.docs)==null?void 0:w.source}}};var C,D,L;i.parameters={...i.parameters,docs:{...(C=i.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    variant: "success",
    title: "Lançamento registrado",
    message: "R$ 85,00 adicionado aos Prazeres.",
    autoDismiss: true
  }
}`,...(L=(D=i.parameters)==null?void 0:D.docs)==null?void 0:L.source}}};var V,z,T;c.parameters={...c.parameters,docs:{...(V=c.parameters)==null?void 0:V.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  }}>
      <Toast variant="success" title="Lançamento registrado" message="R$ 85,00 adicionado aos Prazeres." onDismiss={() => {}} />
      <Toast variant="error" title="Erro ao salvar" message="Verifique os campos e tente novamente." onDismiss={() => {}} />
      <Toast variant="warning" title="Limite próximo" message="Você atingiu 85% do limite de Conforto." onDismiss={() => {}} />
      <Toast variant="info" title="Dica Fortuna" message="Você pode categorizar lançamentos por voz." onDismiss={() => {}} />
    </div>
}`,...(T=(z=c.parameters)==null?void 0:z.docs)==null?void 0:T.source}}};const K=["Success","Error","Warning","Info","ComAutoDismiss","AllVariants"];export{c as AllVariants,i as ComAutoDismiss,a as Error,n as Info,o as Success,t as Warning,K as __namedExportsOrder,J as default};
