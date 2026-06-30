import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{R as O}from"./index-CaMInrNI.js";import{I as r,C as b,R as x,T as v,S as h,a as H}from"./Input-DykRCYd8.js";import"./clsx-B-dksMZM.js";const X={title:"Design System/Input",component:r,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{label:{control:"text",description:"Texto do label/etiqueta"},prefix:{control:"text",description:"Prefixo ao lado do campo (ex: R$)"},placeholder:{control:"text",description:"Texto provisório dentro do input"},error:{control:"text",description:"Mensagem de erro de validação"},disabled:{control:"boolean",description:"Se o input está desativado"},onChange:{action:"onChange",description:"Callback de alteração do valor"}},args:{label:"Descrição",placeholder:"Ex: Assinatura de Software",disabled:!1}},n={args:{label:"Descrição",placeholder:"Ex: Assinatura de Software"},render:a=>e.jsx("div",{style:{width:320},children:e.jsx(r,{...a})})},l={args:{label:"Valor",prefix:"R$",placeholder:"0,00",type:"text"},render:a=>e.jsx("div",{style:{width:240},children:e.jsx(r,{...a})})},o={args:{label:"Descrição",placeholder:"Ex: Assinatura de Software",error:"Campo obrigatório"},render:a=>e.jsx("div",{style:{width:320},children:e.jsx(r,{...a})})},s={render:()=>e.jsx("div",{style:{width:280},children:e.jsx(h,{label:"Pilar",options:[{value:"essenciais",label:"Gastos Essenciais"},{value:"conforto",label:"Conforto"},{value:"prazeres",label:"Prazeres"},{value:"conhecimento",label:"Conhecimento"},{value:"metas",label:"Metas"},{value:"liberdade",label:"Liberdade Financeira"}]})})},t={render:()=>e.jsx("div",{style:{width:280},children:e.jsx(h,{label:"Pilar",error:"Selecione uma categoria",options:[{value:"",label:"Selecione..."},{value:"essenciais",label:"Gastos Essenciais"},{value:"conforto",label:"Conforto"},{value:"prazeres",label:"Prazeres"},{value:"conhecimento",label:"Conhecimento"},{value:"metas",label:"Metas"},{value:"liberdade",label:"Liberdade Financeira"}]})})},i={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1.25rem"},children:[e.jsx(b,{label:"Marcar como recorrente"}),e.jsx(b,{label:"Despesa compartilhada",defaultChecked:!0}),e.jsx(x,{name:"tipo",label:"Despesa",defaultChecked:!0}),e.jsx(x,{name:"tipo",label:"Receita"}),e.jsx(v,{label:"Notificações ativas"}),e.jsx(v,{label:"Modo escuro",defaultChecked:!0})]})},c={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1.5rem",width:400},children:[e.jsx(r,{label:"Descrição",placeholder:"Ex: Almoço com cliente"}),e.jsx(r,{label:"Valor",prefix:"R$",placeholder:"0,00",type:"text"}),e.jsx(h,{label:"Pilar",options:[{value:"essenciais",label:"Gastos Essenciais"},{value:"conforto",label:"Conforto"},{value:"prazeres",label:"Prazeres"},{value:"conhecimento",label:"Conhecimento"},{value:"metas",label:"Metas"},{value:"liberdade",label:"Liberdade Financeira"}]}),e.jsx(r,{label:"Data",type:"date"}),e.jsx(b,{label:"Marcar como recorrente"}),e.jsx(v,{label:"Despesa compartilhada"})]})},d={render:()=>{const a=()=>{const[u,m]=O.useState("despesa");return e.jsx("div",{style:{width:360},children:e.jsx(H,{options:[{value:"despesa",label:"Despesa"},{value:"renda",label:"Renda"},{value:"transferencia",label:"Transferência"}],value:u,onChange:m,label:"Tipo de lançamento"})})};return e.jsx(a,{})}},p={render:()=>{const a=()=>{const[u,m]=O.useState("incremento");return e.jsx("div",{style:{width:360},children:e.jsx(H,{options:[{value:"incremento",label:"Incremento"},{value:"decremento",label:"Decremento"}],value:u,onChange:m,label:"Tipo de renda"})})};return e.jsx(a,{})}};var f,g,C;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    label: "Descrição",
    placeholder: "Ex: Assinatura de Software"
  },
  render: args => <div style={{
    width: 320
  }}>
      <Input {...args} />
    </div>
}`,...(C=(g=n.parameters)==null?void 0:g.docs)==null?void 0:C.source}}};var S,j,y;l.parameters={...l.parameters,docs:{...(S=l.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    label: "Valor",
    prefix: "R$",
    placeholder: "0,00",
    type: "text"
  },
  render: args => <div style={{
    width: 240
  }}>
      <Input {...args} />
    </div>
}`,...(y=(j=l.parameters)==null?void 0:j.docs)==null?void 0:y.source}}};var D,R,w;o.parameters={...o.parameters,docs:{...(D=o.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    label: "Descrição",
    placeholder: "Ex: Assinatura de Software",
    error: "Campo obrigatório"
  },
  render: args => <div style={{
    width: 320
  }}>
      <Input {...args} />
    </div>
}`,...(w=(R=o.parameters)==null?void 0:R.docs)==null?void 0:w.source}}};var E,T,I;s.parameters={...s.parameters,docs:{...(E=s.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 280
  }}>
      <Select label="Pilar" options={[{
      value: "essenciais",
      label: "Gastos Essenciais"
    }, {
      value: "conforto",
      label: "Conforto"
    }, {
      value: "prazeres",
      label: "Prazeres"
    }, {
      value: "conhecimento",
      label: "Conhecimento"
    }, {
      value: "metas",
      label: "Metas"
    }, {
      value: "liberdade",
      label: "Liberdade Financeira"
    }]} />
    </div>
}`,...(I=(T=s.parameters)==null?void 0:T.docs)==null?void 0:I.source}}};var P,M,z;t.parameters={...t.parameters,docs:{...(P=t.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 280
  }}>
      <Select label="Pilar" error="Selecione uma categoria" options={[{
      value: "",
      label: "Selecione..."
    }, {
      value: "essenciais",
      label: "Gastos Essenciais"
    }, {
      value: "conforto",
      label: "Conforto"
    }, {
      value: "prazeres",
      label: "Prazeres"
    }, {
      value: "conhecimento",
      label: "Conhecimento"
    }, {
      value: "metas",
      label: "Metas"
    }, {
      value: "liberdade",
      label: "Liberdade Financeira"
    }]} />
    </div>
}`,...(z=(M=t.parameters)==null?void 0:M.docs)==null?void 0:z.source}}};var k,F,V;i.parameters={...i.parameters,docs:{...(k=i.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem"
  }}>
      <Checkbox label="Marcar como recorrente" />
      <Checkbox label="Despesa compartilhada" defaultChecked />
      <Radio name="tipo" label="Despesa" defaultChecked />
      <Radio name="tipo" label="Receita" />
      <Toggle label="Notificações ativas" />
      <Toggle label="Modo escuro" defaultChecked />
    </div>
}`,...(V=(F=i.parameters)==null?void 0:F.docs)==null?void 0:V.source}}};var A,G,L;c.parameters={...c.parameters,docs:{...(A=c.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    width: 400
  }}>
      <Input label="Descrição" placeholder="Ex: Almoço com cliente" />
      <Input label="Valor" prefix="R$" placeholder="0,00" type="text" />
      <Select label="Pilar" options={[{
      value: "essenciais",
      label: "Gastos Essenciais"
    }, {
      value: "conforto",
      label: "Conforto"
    }, {
      value: "prazeres",
      label: "Prazeres"
    }, {
      value: "conhecimento",
      label: "Conhecimento"
    }, {
      value: "metas",
      label: "Metas"
    }, {
      value: "liberdade",
      label: "Liberdade Financeira"
    }]} />
      <Input label="Data" type="date" />
      <Checkbox label="Marcar como recorrente" />
      <Toggle label="Despesa compartilhada" />
    </div>
}`,...(L=(G=c.parameters)==null?void 0:G.docs)==null?void 0:L.source}}};var W,$,B;d.parameters={...d.parameters,docs:{...(W=d.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: () => {
    const Demo = () => {
      const [val, setVal] = React.useState("despesa");
      return <div style={{
        width: 360
      }}>
          <CapsuleRadio options={[{
          value: "despesa",
          label: "Despesa"
        }, {
          value: "renda",
          label: "Renda"
        }, {
          value: "transferencia",
          label: "Transferência"
        }]} value={val} onChange={setVal} label="Tipo de lançamento" />
        </div>;
    };
    return <Demo />;
  }
}`,...(B=($=d.parameters)==null?void 0:$.docs)==null?void 0:B.source}}};var N,_,q;p.parameters={...p.parameters,docs:{...(N=p.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => {
    const Demo = () => {
      const [val, setVal] = React.useState("incremento");
      return <div style={{
        width: 360
      }}>
          <CapsuleRadio options={[{
          value: "incremento",
          label: "Incremento"
        }, {
          value: "decremento",
          label: "Decremento"
        }]} value={val} onChange={setVal} label="Tipo de renda" />
        </div>;
    };
    return <Demo />;
  }
}`,...(q=(_=p.parameters)==null?void 0:_.docs)==null?void 0:q.source}}};const Y=["TextInput","WithPrefix","WithError","SelectInput","SelectWithError","Controls","FullForm","CapsuleRadioBasico","CapsuleRadioBinario"];export{d as CapsuleRadioBasico,p as CapsuleRadioBinario,i as Controls,c as FullForm,s as SelectInput,t as SelectWithError,n as TextInput,o as WithError,l as WithPrefix,Y as __namedExportsOrder,X as default};
