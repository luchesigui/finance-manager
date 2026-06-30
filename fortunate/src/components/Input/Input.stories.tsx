import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Autocomplete } from "../Autocomplete/Autocomplete";
import { CapsuleRadio, Checkbox, Input, Radio, Select, Toggle } from "./Input";

const meta = {
  title: "Design System/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text", description: "Texto do label/etiqueta" },
    prefix: { control: "text", description: "Prefixo ao lado do campo (ex: R$)" },
    placeholder: { control: "text", description: "Texto provisório dentro do input" },
    error: { control: "text", description: "Mensagem de erro de validação" },
    disabled: { control: "boolean", description: "Se o input está desativado" },
    onChange: { action: "onChange", description: "Callback de alteração do valor" },
  },
  args: {
    label: "Descrição",
    placeholder: "Ex: Assinatura de Software",
    disabled: false,
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextInput: Story = {
  args: {
    label: "Descrição",
    placeholder: "Ex: Assinatura de Software",
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Input {...args} />
    </div>
  ),
};

export const WithPrefix: Story = {
  args: {
    label: "Valor",
    prefix: "R$",
    placeholder: "0,00",
    type: "text",
  },
  render: (args) => (
    <div style={{ width: 240 }}>
      <Input {...args} />
    </div>
  ),
};

export const WithError: Story = {
  args: {
    label: "Descrição",
    placeholder: "Ex: Assinatura de Software",
    error: "Campo obrigatório",
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Input {...args} />
    </div>
  ),
};

export const SelectInput: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Select
        label="Pilar"
        options={[
          { value: "essenciais", label: "Gastos Essenciais" },
          { value: "conforto", label: "Conforto" },
          { value: "prazeres", label: "Prazeres" },
          { value: "conhecimento", label: "Conhecimento" },
          { value: "metas", label: "Metas" },
          { value: "liberdade", label: "Liberdade Financeira" },
        ]}
      />
    </div>
  ),
};

export const SelectWithError: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Select
        label="Pilar"
        error="Selecione uma categoria"
        options={[
          { value: "", label: "Selecione..." },
          { value: "essenciais", label: "Gastos Essenciais" },
          { value: "conforto", label: "Conforto" },
          { value: "prazeres", label: "Prazeres" },
          { value: "conhecimento", label: "Conhecimento" },
          { value: "metas", label: "Metas" },
          { value: "liberdade", label: "Liberdade Financeira" },
        ]}
      />
    </div>
  ),
};

export const Controls: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <Checkbox label="Marcar como recorrente" />
      <Checkbox label="Despesa compartilhada" defaultChecked />
      <Radio name="tipo" label="Despesa" defaultChecked />
      <Radio name="tipo" label="Receita" />
      <Toggle label="Notificações ativas" />
      <Toggle label="Modo escuro" defaultChecked />
    </div>
  ),
};

export const FullForm: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: 400 }}>
      <Input label="Descrição" placeholder="Ex: Almoço com cliente" />
      <Input label="Valor" prefix="R$" placeholder="0,00" type="text" />
      <Select
        label="Pilar"
        options={[
          { value: "essenciais", label: "Gastos Essenciais" },
          { value: "conforto", label: "Conforto" },
          { value: "prazeres", label: "Prazeres" },
          { value: "conhecimento", label: "Conhecimento" },
          { value: "metas", label: "Metas" },
          { value: "liberdade", label: "Liberdade Financeira" },
        ]}
      />
      <Input label="Data" type="date" />
      <Checkbox label="Marcar como recorrente" />
      <Toggle label="Despesa compartilhada" />
    </div>
  ),
};

export const CapsuleRadioBasico: Story = {
  render: () => {
    const Demo = () => {
      const [val, setVal] = React.useState("despesa");
      return (
        <div style={{ width: 360 }}>
          <CapsuleRadio
            options={[
              { value: "despesa", label: "Despesa" },
              { value: "renda", label: "Renda" },
              { value: "transferencia", label: "Transferência" },
            ]}
            value={val}
            onChange={setVal}
            label="Tipo de lançamento"
          />
        </div>
      );
    };
    return <Demo />;
  },
};

export const CapsuleRadioBinario: Story = {
  render: () => {
    const Demo = () => {
      const [val, setVal] = React.useState("incremento");
      return (
        <div style={{ width: 360 }}>
          <CapsuleRadio
            options={[
              { value: "incremento", label: "Incremento" },
              { value: "decremento", label: "Decremento" },
            ]}
            value={val}
            onChange={setVal}
            label="Tipo de renda"
          />
        </div>
      );
    };
    return <Demo />;
  },
};

export const AutocompleteWithCreation: Story = {
  render: () => {
    const Demo = () => {
      const [categories, setCategories] = React.useState([
        { value: "alimentacao", label: "Alimentação", pillar: "Gastos Essenciais" },
        { value: "transporte", label: "Transporte", pillar: "Gastos Essenciais" },
        { value: "moradia", label: "Moradia", pillar: "Gastos Essenciais" },
        { value: "saude", label: "Saúde", pillar: "Gastos Essenciais" },
        { value: "educacao", label: "Educação", pillar: "Conhecimento" },
        { value: "lazer", label: "Lazer e Entretenimento", pillar: "Prazeres" },
        { value: "vestuario", label: "Vestuário", pillar: "Conforto" },
        { value: "assinaturas", label: "Assinaturas e Serviços", pillar: "Prazeres" },
        { value: "outros", label: "Outros", pillar: "Conforto" },
      ]);
      const [selected, setSelected] = React.useState("");

      const pillars = [
        "Gastos Essenciais",
        "Conforto",
        "Prazeres",
        "Conhecimento",
        "Planejamento",
        "Liberdade Financeira",
      ];

      const handleCreate = (name: string, pillar: string) => {
        const newValue = name
          .toLowerCase()
          .normalize("NFD")
          // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard accent removal after normalization
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-");
        const newCategory = { value: newValue, label: name, pillar };
        setCategories((prev) => [...prev, newCategory]);
        setSelected(newValue);
      };

      return (
        <div style={{ width: 320 }}>
          <Autocomplete
            label="Categoria"
            value={selected}
            onChange={setSelected}
            options={categories}
            pillars={pillars}
            onCreateCategory={handleCreate}
          />
        </div>
      );
    };
    return <Demo />;
  },
};
