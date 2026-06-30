"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { Button } from "../Button/Button";
import { Input, Select } from "../Input/Input";
import { Modal } from "./Modal";

const meta = {
  title: "Design System/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean", description: "Estado visível do modal" },
    title: { control: "text", description: "Título no cabeçalho do modal" },
    onClose: { action: "onClose", description: "Callback executado ao fechar" },
  },
  args: {
    open: false,
    title: "Novo Lançamento",
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(args.open);

    useEffect(() => {
      setOpen(args.open);
    }, [args.open]);

    const handleClose = () => {
      setOpen(false);
      args.onClose();
    };

    return (
      <>
        <Button variant="action" onClick={() => setOpen(true)}>
          Abrir Modal
        </Button>
        <Modal open={open} onClose={handleClose} title={args.title}>
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
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "flex-end",
              marginTop: "0.5rem",
            }}
          >
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="action">Salvar Lançamento</Button>
          </div>
        </Modal>
      </>
    );
  },
};
