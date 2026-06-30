import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{r}from"./index-CaMInrNI.js";import{B as t}from"./Button-Dv9rwRD0.js";import{I as s,S as m}from"./Input-DykRCYd8.js";import{M as d}from"./Modal-Cl7_JgLF.js";import"./clsx-B-dksMZM.js";const j={title:"Design System/Modal",component:d,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{open:{control:"boolean",description:"Estado visível do modal"},title:{control:"text",description:"Título no cabeçalho do modal"},onClose:{action:"onClose",description:"Callback executado ao fechar"}},args:{open:!1,title:"Novo Lançamento"}},a={render:n=>{const[u,o]=r.useState(n.open);r.useEffect(()=>{o(n.open)},[n.open]);const l=()=>{o(!1),n.onClose()};return e.jsxs(e.Fragment,{children:[e.jsx(t,{variant:"action",onClick:()=>o(!0),children:"Abrir Modal"}),e.jsxs(d,{open:u,onClose:l,title:n.title,children:[e.jsx(s,{label:"Descrição",placeholder:"Ex: Almoço com cliente"}),e.jsx(s,{label:"Valor",prefix:"R$",placeholder:"0,00",type:"text"}),e.jsx(m,{label:"Pilar",options:[{value:"essenciais",label:"Gastos Essenciais"},{value:"conforto",label:"Conforto"},{value:"prazeres",label:"Prazeres"},{value:"conhecimento",label:"Conhecimento"},{value:"metas",label:"Metas"},{value:"liberdade",label:"Liberdade Financeira"}]}),e.jsxs("div",{style:{display:"flex",gap:"1rem",justifyContent:"flex-end",marginTop:"0.5rem"},children:[e.jsx(t,{variant:"outline",onClick:l,children:"Cancelar"}),e.jsx(t,{variant:"action",children:"Salvar Lançamento"})]})]})]})}};var i,c,p;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => {
    const [open, setOpen] = useState(args.open);
    useEffect(() => {
      setOpen(args.open);
    }, [args.open]);
    const handleClose = () => {
      setOpen(false);
      args.onClose();
    };
    return <>
        <Button variant="action" onClick={() => setOpen(true)}>
          Abrir Modal
        </Button>
        <Modal open={open} onClose={handleClose} title={args.title}>
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
          <div style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "flex-end",
          marginTop: "0.5rem"
        }}>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="action">Salvar Lançamento</Button>
          </div>
        </Modal>
      </>;
  }
}`,...(p=(c=a.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};const g=["Default"];export{a as Default,g as __namedExportsOrder,j as default};
