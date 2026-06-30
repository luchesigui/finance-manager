import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{G as a}from"./GlassCard-CB8RnAvV.js";import{T as i}from"./TrendBadge-D7JsGOGo.js";import{B as l}from"./Button-Dv9rwRD0.js";import{P as n}from"./PilarCard-qtP9AHNo.js";import{T as u}from"./Table-DLiiWvXt.js";import{F as g}from"./FloatingAssistant-C1-2EIsU.js";import{I as s,S as f}from"./Input-DykRCYd8.js";import{T as h}from"./TransferCard-BkT7rOFy.js";import{C as x}from"./CloudBackground-Dlk7F_if.js";import"./clsx-B-dksMZM.js";import"./Pill-Bsap-_Mk.js";import"./Badge-CqFdJuvc.js";import"./index-CaMInrNI.js";const P={title:"Fortunate / Dashboard Preview",parameters:{layout:"fullscreen"},tags:["autodocs"]},y=[{date:"28/06",description:"Almoço com equipe",pilar:"Prazeres",amount:"R$ -85,00",type:"expense",isCard:!0},{date:"27/06",description:"Salário — Junho",pilar:"—",amount:"R$ +12.000,00",type:"income"},{date:"26/06",description:"Mensalidade Academia",pilar:"Conforto",amount:"R$ -89,90",type:"expense",isCard:!0},{date:"25/06",description:"Curso de Investimentos",pilar:"Conhecimento",amount:"R$ -297,00",type:"expense"}],v=[{key:"date",header:"Data"},{key:"description",header:"Descrição"},{key:"pilar",header:"Categoria"},{key:"amount",header:"Valor",render:(p,c)=>e.jsx("span",{style:{color:c.type==="income"?"var(--status-positive)":"var(--status-negative)",fontWeight:600},children:String(p)})}],r={fontFamily:"var(--font-heading)",fontSize:"1.4rem",fontWeight:600,marginBottom:"2rem",letterSpacing:"0.02em",borderBottom:"1.5px solid color-mix(in srgb, var(--c-content) 10%, transparent)",paddingBottom:"0.75rem",color:"var(--c-content)"},t={render:()=>e.jsxs("div",{style:{minHeight:"100vh",background:"var(--c-bg)",backgroundAttachment:"fixed",padding:"6rem 2rem 10rem",fontFamily:"var(--font-body)"},children:[e.jsx(x,{}),e.jsxs("header",{style:{textAlign:"center",marginBottom:"4rem"},children:[e.jsx("p",{style:{fontFamily:"var(--font-heading)",fontSize:"0.8rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--c-content-muted)",margin:"0 0 0.5rem"},children:"Junho 2026"}),e.jsx("h1",{style:{fontFamily:"var(--font-heading)",fontSize:"4rem",fontWeight:700,letterSpacing:"-0.02em",margin:"0 0 1.2rem",color:"var(--c-content)"},children:"R$ 25.171,45"}),e.jsxs("div",{style:{display:"flex",justifyContent:"center",gap:"1rem",flexWrap:"wrap"},children:[e.jsx(i,{trend:"up",children:"Receitas R$ 35.928,25"}),e.jsx(i,{trend:"down",children:"Despesas R$ 10.756,80"}),e.jsx(i,{trend:"up",children:"Investido R$ 15.000,00"})]})]}),e.jsxs("div",{style:{maxWidth:1400,margin:"0 auto",display:"flex",flexDirection:"column",gap:"2.5rem"},children:[e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:"2.5rem",alignItems:"stretch"},children:[e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"2.5rem"},children:[e.jsxs(a,{variant:"fino",style:{padding:"2.5rem"},children:[e.jsx("h2",{style:r,children:"Novo Lançamento"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1.25rem",marginBottom:"1.5rem"},children:[e.jsx(s,{label:"Descrição",placeholder:"Ex: Assinatura de Software"}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem"},children:[e.jsx(s,{label:"Valor",prefix:"R$",placeholder:"0,00"}),e.jsx(f,{label:"Categoria",options:[{value:"essenciais",label:"Gastos Essenciais"},{value:"conforto",label:"Conforto"},{value:"prazeres",label:"Prazeres"},{value:"conhecimento",label:"Conhecimento"},{value:"metas",label:"Metas"},{value:"liberdade",label:"Liberdade Financeira"}]})]})]}),e.jsxs("div",{style:{display:"flex",gap:"1rem",justifyContent:"flex-end"},children:[e.jsx(l,{variant:"outline",children:"Cancelar"}),e.jsx(l,{variant:"action",children:"Inserir Lançamento"})]})]}),e.jsxs(a,{variant:"fino",style:{padding:"2.5rem"},children:[e.jsx("h2",{style:r,children:"Transferência do Mês"}),e.jsx(h,{from:{name:"Guilherme",initial:"G"},to:{name:"Amanda",initial:"A"},amount:1250.75,status:"pending"})]})]}),e.jsxs(a,{variant:"fino",style:{padding:"2.5rem",display:"flex",flexDirection:"column",minHeight:400},children:[e.jsx("h2",{style:r,children:"Distribuição por Pilares"}),e.jsxs("div",{style:{flex:1,display:"grid",gridTemplateColumns:"repeat(2, minmax(260px, 1fr))",gridTemplateRows:"repeat(3, 1fr)",gap:"1.25rem",alignItems:"stretch"},children:[e.jsx(n,{pilar:"essenciais",targetValue:1e4,usedValue:4800}),e.jsx(n,{pilar:"conforto",targetValue:5e3,usedValue:3250}),e.jsx(n,{pilar:"prazeres",targetValue:3e3,usedValue:750}),e.jsx(n,{pilar:"conhecimento",targetValue:2e3,usedValue:1600}),e.jsx(n,{pilar:"metas",targetValue:8e3,usedValue:1200}),e.jsx(n,{pilar:"liberdade",targetValue:15e3,usedValue:7500})]})]})]}),e.jsxs(a,{variant:"fino",style:{padding:"2.5rem"},children:[e.jsx("h2",{style:r,children:"Últimas Transações"}),e.jsx(u,{columns:v,data:y,maxLines:4,onReadAllClick:()=>{},showCardBadge:!0})]})]}),e.jsx("div",{style:{position:"fixed",bottom:30,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:580,padding:"0 1.5rem",zIndex:900},children:e.jsx(g,{promptSuggestions:["Gastei R$ 45 no almoço","Qual meu saldo este mês?","Estou dentro do limite?"]})})]})};var o,d,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: () => <div style={{
    minHeight: "100vh",
    background: "var(--c-bg)",
    backgroundAttachment: "fixed",
    padding: "6rem 2rem 10rem",
    fontFamily: "var(--font-body)"
  }}>
      <CloudBackground />

      {/* Hero */}
      <header style={{
      textAlign: "center",
      marginBottom: "4rem"
    }}>
        <p style={{
        fontFamily: "var(--font-heading)",
        fontSize: "0.8rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        color: "var(--c-content-muted)",
        margin: "0 0 0.5rem"
      }}>
          Junho 2026
        </p>
        <h1 style={{
        fontFamily: "var(--font-heading)",
        fontSize: "4rem",
        fontWeight: 700,
        letterSpacing: "-0.02em",
        margin: "0 0 1.2rem",
        color: "var(--c-content)"
      }}>
          R$ 25.171,45
        </h1>
        <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "1rem",
        flexWrap: "wrap"
      }}>
          <TrendBadge trend="up">Receitas R$ 35.928,25</TrendBadge>
          <TrendBadge trend="down">Despesas R$ 10.756,80</TrendBadge>
          <TrendBadge trend="up">Investido R$ 15.000,00</TrendBadge>
        </div>
      </header>

      {/* Main content */}
      <div style={{
      maxWidth: 1400,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "2.5rem"
    }}>
        {/* Top: 2-column grid */}
        <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr",
        gap: "2.5rem",
        alignItems: "stretch"
      }}>
          {/* Coluna esquerda */}
          <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem"
        }}>
            {/* Novo Lançamento */}
            <GlassCard variant="fino" style={{
            padding: "2.5rem"
          }}>
              <h2 style={panelTitle}>Novo Lançamento</h2>
              <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              marginBottom: "1.5rem"
            }}>
                <Input label="Descrição" placeholder="Ex: Assinatura de Software" />
                <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.25rem"
              }}>
                  <Input label="Valor" prefix="R$" placeholder="0,00" />
                  <Select label="Categoria" options={[{
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
              </div>
              <div style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "flex-end"
            }}>
                <Button variant="outline">Cancelar</Button>
                <Button variant="action">Inserir Lançamento</Button>
              </div>
            </GlassCard>

            {/* Transferência */}
            <GlassCard variant="fino" style={{
            padding: "2.5rem"
          }}>
              <h2 style={panelTitle}>Transferência do Mês</h2>
              <TransferCard from={{
              name: "Guilherme",
              initial: "G"
            }} to={{
              name: "Amanda",
              initial: "A"
            }} amount={1250.75} status="pending" />
            </GlassCard>
          </div>

          {/* Distribuição por Pilares */}
          <GlassCard variant="fino" style={{
          padding: "2.5rem",
          display: "flex",
          flexDirection: "column",
          minHeight: 400
        }}>
            <h2 style={panelTitle}>Distribuição por Pilares</h2>
            <div style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(260px, 1fr))",
            gridTemplateRows: "repeat(3, 1fr)",
            gap: "1.25rem",
            alignItems: "stretch"
          }}>
              <PilarCard pilar="essenciais" targetValue={10000} usedValue={4800} />
              <PilarCard pilar="conforto" targetValue={5000} usedValue={3250} />
              <PilarCard pilar="prazeres" targetValue={3000} usedValue={750} />
              <PilarCard pilar="conhecimento" targetValue={2000} usedValue={1600} />
              <PilarCard pilar="metas" targetValue={8000} usedValue={1200} />
              <PilarCard pilar="liberdade" targetValue={15000} usedValue={7500} />
            </div>
          </GlassCard>
        </div>

        {/* Últimas Transações — full width */}
        <GlassCard variant="fino" style={{
        padding: "2.5rem"
      }}>
          <h2 style={panelTitle}>Últimas Transações</h2>
          <Table columns={tableColumns} data={transactions} maxLines={4} onReadAllClick={() => {}} showCardBadge />
        </GlassCard>
      </div>

      {/* Floating Assistant */}
      <div style={{
      position: "fixed",
      bottom: 30,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 580,
      padding: "0 1.5rem",
      zIndex: 900
    }}>
        <FloatingAssistant promptSuggestions={["Gastei R$ 45 no almoço", "Qual meu saldo este mês?", "Estou dentro do limite?"]} />
      </div>
    </div>
}`,...(m=(d=t.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};const w=["FullDashboard"];export{t as FullDashboard,w as __namedExportsOrder,P as default};
