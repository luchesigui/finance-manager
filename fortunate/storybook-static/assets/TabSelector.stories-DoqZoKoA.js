import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{r as i}from"./index-CaMInrNI.js";import{G as j}from"./GlassCard-CB8RnAvV.js";import{c as T}from"./clsx-B-dksMZM.js";const A="_container_5be4u_1",D="_tab_5be4u_7",_="_active_5be4u_27",m={container:A,tab:D,active:_};function l({tabs:n,value:c,onChange:t}){return e.jsx("div",{className:m.container,children:n.map((a,s)=>{const o=s===c,r=a.color??"var(--c-action)";return e.jsx("button",{onClick:()=>t(s),className:T(m.tab,{[m.active]:o}),style:o?{"--tab-accent":r}:void 0,children:a.label},s)})})}l.__docgenInfo={description:"",methods:[],displayName:"TabSelector",props:{tabs:{required:!0,tsType:{name:"Array",elements:[{name:"TabItem"}],raw:"TabItem[]"},description:""},value:{required:!0,tsType:{name:"number"},description:""},onChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(index: number) => void",signature:{arguments:[{type:{name:"number"},name:"index"}],return:{name:"void"}}},description:""}}};const P={title:"Design System/TabSelector",component:l,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{tabs:{control:"object",description:"Array contendo os itens da aba e suas cores customizadas"},value:{control:"number",description:"Índice da aba ativa atualmente"},onChange:{action:"onChange",description:"Callback executado ao mudar de aba"}},args:{value:0,tabs:[{label:"Visão Geral"},{label:"Detalhes"},{label:"Histórico"}]}},d={render:n=>{const c=()=>{const[t,a]=i.useState(n.value);i.useEffect(()=>{a(n.value)},[n.value]);const s=r=>{a(r),n.onChange(r)},o=["Resumo geral do período.","Detalhes da seleção.","Histórico de atividades."];return e.jsxs("div",{style:{width:480},children:[e.jsx(l,{tabs:n.tabs,value:t,onChange:s}),e.jsx("div",{style:{padding:"1.5rem 0"},children:e.jsx("p",{style:{margin:0,color:"var(--c-content-muted)",fontSize:"0.9rem"},children:o[t]})})]})};return e.jsx(c,{})}},u={args:{tabs:[{label:"Despesa",color:"var(--status-negative)"},{label:"Renda",color:"var(--status-positive)"},{label:"Transferência",color:"var(--c-action)"}]},render:n=>{const c=()=>{const[t,a]=i.useState(n.value);i.useEffect(()=>{a(n.value)},[n.value]);const s=r=>{a(r),n.onChange(r)},o=[e.jsx("p",{style:{margin:0,color:"var(--c-content-muted)",fontSize:"0.9rem"},children:"Registrar uma saída de caixa."},"despesa"),e.jsx("p",{style:{margin:0,color:"var(--c-content)",fontSize:"0.9rem"},children:"Registrar uma entrada de recursos."},"renda"),e.jsx("p",{style:{margin:0,color:"var(--c-content)",fontSize:"0.9rem"},children:"Mover valor entre contas."},"transferencia")];return e.jsxs("div",{style:{width:480},children:[e.jsx(l,{tabs:n.tabs,value:t,onChange:s}),e.jsx("div",{style:{padding:"1.5rem 0"},children:o[t]})]})};return e.jsx(c,{})}},v={args:{tabs:[{label:"Pilares"},{label:"Transações"},{label:"Metas"}]},render:n=>{const c=()=>{const[t,a]=i.useState(n.value);i.useEffect(()=>{a(n.value)},[n.value]);const s=r=>{a(r),n.onChange(r)},o=["Pilares","Transações","Metas"];return e.jsx("div",{style:{width:560},children:e.jsxs(j,{variant:"fino",style:{padding:"2rem"},children:[e.jsx(l,{tabs:n.tabs,value:t,onChange:s}),e.jsx("div",{style:{padding:"1.5rem 0"},children:e.jsxs("p",{style:{margin:0,color:"var(--c-content-muted)",fontSize:"0.9rem"},children:["Aba ativa: ",o[t]]})})]})})};return e.jsx(c,{})}};var g,p,b;d.parameters={...d.parameters,docs:{...(g=d.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: args => {
    const Demo = () => {
      const [active, setActive] = useState(args.value);
      useEffect(() => {
        setActive(args.value);
      }, [args.value]);
      const handleChange = (index: number) => {
        setActive(index);
        args.onChange(index);
      };
      const content = ["Resumo geral do período.", "Detalhes da seleção.", "Histórico de atividades."];
      return <div style={{
        width: 480
      }}>
          <TabSelector tabs={args.tabs} value={active} onChange={handleChange} />
          <div style={{
          padding: "1.5rem 0"
        }}>
            <p style={{
            margin: 0,
            color: "var(--c-content-muted)",
            fontSize: "0.9rem"
          }}>
              {content[active]}
            </p>
          </div>
        </div>;
    };
    return <Demo />;
  }
}`,...(b=(p=d.parameters)==null?void 0:p.docs)==null?void 0:b.source}}};var h,y,x;u.parameters={...u.parameters,docs:{...(h=u.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    tabs: [{
      label: "Despesa",
      color: "var(--status-negative)"
    }, {
      label: "Renda",
      color: "var(--status-positive)"
    }, {
      label: "Transferência",
      color: "var(--c-action)"
    }]
  },
  render: args => {
    const Demo = () => {
      const [active, setActive] = useState(args.value);
      useEffect(() => {
        setActive(args.value);
      }, [args.value]);
      const handleChange = (index: number) => {
        setActive(index);
        args.onChange(index);
      };
      const content = [<p key="despesa" style={{
        margin: 0,
        color: "var(--c-content-muted)",
        fontSize: "0.9rem"
      }}>
          Registrar uma saída de caixa.
        </p>, <p key="renda" style={{
        margin: 0,
        color: "var(--c-content)",
        fontSize: "0.9rem"
      }}>
          Registrar uma entrada de recursos.
        </p>, <p key="transferencia" style={{
        margin: 0,
        color: "var(--c-content)",
        fontSize: "0.9rem"
      }}>
          Mover valor entre contas.
        </p>];
      return <div style={{
        width: 480
      }}>
          <TabSelector tabs={args.tabs} value={active} onChange={handleChange} />
          <div style={{
          padding: "1.5rem 0"
        }}>{content[active]}</div>
        </div>;
    };
    return <Demo />;
  }
}`,...(x=(y=u.parameters)==null?void 0:y.docs)==null?void 0:x.source}}};var f,C,S;v.parameters={...v.parameters,docs:{...(f=v.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    tabs: [{
      label: "Pilares"
    }, {
      label: "Transações"
    }, {
      label: "Metas"
    }]
  },
  render: args => {
    const Demo = () => {
      const [active, setActive] = useState(args.value);
      useEffect(() => {
        setActive(args.value);
      }, [args.value]);
      const handleChange = (index: number) => {
        setActive(index);
        args.onChange(index);
      };
      const labels = ["Pilares", "Transações", "Metas"];
      return <div style={{
        width: 560
      }}>
          <GlassCard variant="fino" style={{
          padding: "2rem"
        }}>
            <TabSelector tabs={args.tabs} value={active} onChange={handleChange} />
            <div style={{
            padding: "1.5rem 0"
          }}>
              <p style={{
              margin: 0,
              color: "var(--c-content-muted)",
              fontSize: "0.9rem"
            }}>
                Aba ativa: {labels[active]}
              </p>
            </div>
          </GlassCard>
        </div>;
    };
    return <Demo />;
  }
}`,...(S=(C=v.parameters)==null?void 0:C.docs)==null?void 0:S.source}}};const M=["Padrao","ComCores","EmPanel"];export{u as ComCores,v as EmPanel,d as Padrao,M as __namedExportsOrder,P as default};
