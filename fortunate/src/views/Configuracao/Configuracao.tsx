"use client";

import clsx from "clsx";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../components/Button/Button";
import { CloudBackground } from "../../components/CloudBackground/CloudBackground";
import { GlassCard } from "../../components/GlassCard/GlassCard";
import { CapsuleRadio, Input, Select } from "../../components/Input/Input";
import { Modal } from "../../components/Modal/Modal";
import { PilarCard } from "../../components/PilarCard/PilarCard";
import { useToast } from "../../components/Toast/ToastProvider";
import {
  createApiKey,
  createCategory,
  deleteCategory,
  revokeApiKey,
  updateSettings,
} from "../../hooks/mutations";
import { useApiKeys } from "../../hooks/useApiKeys";
import { useCategories } from "../../hooks/useCategories";
import { useSettings } from "../../hooks/useSettings";
import { useUsers } from "../../hooks/useUsers";
import { formatBrlCurrency, parseBrazilianCurrencyToNumber } from "../../utils/currency";
import {
  DEFAULT_PILLAR_TARGETS,
  PILLAR_NAMES,
  PILLAR_SLUG_TO_PILAR_KEY,
  type PillarSlug,
  type PillarTargets,
} from "../../utils/pillars";
import styles from "./Configuracao.module.css";

// Ordem de exibição dos pilares na grade de metas
const PILLAR_ORDER: PillarSlug[] = [
  "essenciais",
  "liberdade",
  "conforto",
  "planejamento",
  "prazeres",
  "conhecimento",
];

const PILLARS = PILLAR_ORDER.map((slug) => ({
  slug,
  pilarKey: PILLAR_SLUG_TO_PILAR_KEY[slug],
  name: PILLAR_NAMES[slug],
  color: `var(--pilar-${PILLAR_SLUG_TO_PILAR_KEY[slug]})`,
}));

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard accent removal after normalization
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
  );
}

export function Configuracao() {
  const toast = useToast();

  const { settings } = useSettings();
  const { users } = useUsers();
  const { categories } = useCategories();
  const { apiKeys } = useApiKeys();

  /* ─── Estado local semeado das settings (uma única vez, quando carregam) ─── */
  const [emergencyFund, setEmergencyFund] = useState<number | null>(null);
  const [defaultPayerId, setDefaultPayerId] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [pillarTargets, setPillarTargets] = useState<PillarTargets>({
    ...DEFAULT_PILLAR_TARGETS,
  });

  const settingsSeeded = useRef(false);
  useEffect(() => {
    if (settings && !settingsSeeded.current) {
      settingsSeeded.current = true;
      setEmergencyFund(settings.emergencyFund != null ? settings.emergencyFund / 100 : null);
      setDefaultPayerId(settings.defaultPayerId ?? "");
      setOpenrouterKey(settings.openrouterKey ?? "");
      setPillarTargets(settings.pillarTargets);
    }
  }, [settings]);

  /* ─── Reserva de Emergência ─── */
  const handleSaveEmergencyFund = async () => {
    try {
      await updateSettings({ emergencyFund: Math.round((emergencyFund ?? 0) * 100) });
      toast({ variant: "success", title: "Reserva salva com sucesso!" });
    } catch (err) {
      console.error("Error saving emergency fund", err);
      toast({ variant: "error", title: "Erro ao salvar a reserva" });
    }
  };

  /* ─── Responsável Padrão ─── */
  const handleDefaultPayerChange = async (userId: string) => {
    setDefaultPayerId(userId);
    try {
      await updateSettings({ defaultPayerId: userId });
      toast({ variant: "success", title: "Responsável padrão atualizado" });
    } catch (err) {
      console.error("Error saving default payer", err);
      toast({ variant: "error", title: "Erro ao salvar o responsável padrão" });
    }
  };

  /* ─── Metas dos Pilares ─── */
  const totalTargetPercent = Object.values(pillarTargets).reduce((a, b) => a + b, 0);

  const handleTargetChange = (slug: PillarSlug, val: number) => {
    setPillarTargets((prev) => ({ ...prev, [slug]: val }));
  };

  const handleSavePillars = async () => {
    if (totalTargetPercent !== 100) return;
    try {
      await updateSettings({ pillarTargets });
      toast({ variant: "success", title: "Metas dos pilares salvas!" });
    } catch (err) {
      console.error("Error saving pillar targets", err);
      toast({ variant: "error", title: "Erro ao salvar as metas" });
    }
  };

  /* ─── Categorias ─── */
  const [newCatName, setNewCatName] = useState("");
  const [selectedPillarSlug, setSelectedPillarSlug] = useState<PillarSlug>("essenciais");

  const categoriesByPillar = useMemo(() => {
    const grouped: Record<PillarSlug, { id: string; name: string }[]> = {
      essenciais: [],
      conforto: [],
      prazeres: [],
      conhecimento: [],
      planejamento: [],
      liberdade: [],
    };
    for (const cat of categories) {
      const slug = cat.pillarSlug as PillarSlug;
      if (slug in grouped) grouped[slug].push({ id: cat.id, name: cat.name });
    }
    return grouped;
  }, [categories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await createCategory(newCatName.trim(), slugify(newCatName.trim()), selectedPillarSlug);
      setNewCatName("");
      toast({ variant: "success", title: "Categoria criada!" });
    } catch (err) {
      console.error("Error creating category", err);
      toast({ variant: "error", title: "Erro ao criar categoria" });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      toast({ variant: "success", title: "Categoria removida" });
    } catch (err) {
      console.error("Error deleting category", err);
      toast({ variant: "error", title: "Erro ao remover categoria" });
    }
  };

  /* ─── IA (OpenRouter) ─── */
  const handleSaveAi = async () => {
    try {
      await updateSettings({ openrouterKey: openrouterKey || null });
      toast({ variant: "success", title: "Configurações de IA salvas!" });
    } catch (err) {
      console.error("Error saving AI settings", err);
      toast({ variant: "error", title: "Erro ao salvar configurações de IA" });
    }
  };

  /* ─── Chaves de API ─── */
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{ name: string; token: string } | null>(
    null,
  );
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);

  const handleGenerateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiKeyName.trim()) return;
    try {
      const created = await createApiKey(newApiKeyName.trim());
      setNewlyCreatedKey({ name: created.name, token: created.key });
      setNewApiKeyName("");
    } catch (err) {
      console.error("Error creating API key", err);
      toast({ variant: "error", title: "Erro ao gerar chave de API" });
    }
  };

  const handleRevokeApiKey = async () => {
    if (!revokingKeyId) return;
    try {
      await revokeApiKey(revokingKeyId);
      setRevokingKeyId(null);
      setNewlyCreatedKey(null);
      toast({ variant: "success", title: "Chave revogada" });
    } catch (err) {
      console.error("Error revoking API key", err);
      toast({ variant: "error", title: "Erro ao revogar chave" });
    }
  };

  const revokingKey = apiKeys.find((k) => k.id === revokingKeyId);

  const formatKeyDate = (iso: string) => {
    const parsed = new Date(iso);
    return Number.isNaN(parsed.getTime()) ? iso : parsed.toLocaleDateString("pt-BR");
  };

  return (
    <div className={styles.container}>
      <CloudBackground />

      <div className={styles.content}>
        {/* Title */}
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>Configurações</h1>
          <p className={styles.subtitle}>Participantes, metas de orçamento, IA e chaves de API</p>
        </div>

        {/* 1. RESERVA DE EMERGÊNCIA */}
        <GlassCard variant="fino" className={styles.card25}>
          <h2 className={styles.sectionHeader}>
            <span>🛡️</span> Reserva de Emergência
          </h2>
          <p className={styles.cardDesc}>
            Informe o valor total guardado da sua família. Este valor serve de referência para as
            simulações e o termômetro de saúde financeira.
          </p>
          <div className={styles.flexColGap1}>
            <Input
              label="Valor Acumulado"
              placeholder="R$ 0,00"
              type="text"
              value={emergencyFund === null ? "" : formatBrlCurrency(emergencyFund)}
              onChange={(e) => {
                const num = parseBrazilianCurrencyToNumber(e.target.value);
                setEmergencyFund(num);
              }}
            />
          </div>
          <div className={styles.alignEndRow}>
            <Button onClick={handleSaveEmergencyFund}>Salvar Reserva</Button>
          </div>
        </GlassCard>

        {/* 2. PARTICIPANTES & RESPONSÁVEL PADRÃO */}
        <GlassCard variant="fino" className={styles.card25}>
          <h2 className={styles.sectionHeader}>
            <span>👥</span> Participantes do Household
          </h2>
          <p className={styles.cardDesc}>
            Quem faz parte do seu household. O responsável padrão será o pagador pré-selecionado
            para novos lançamentos.
          </p>

          <div className={styles.flexColGap1}>
            {users.map((person) => (
              <div key={person.id} className={styles.peopleItem}>
                <div className={styles.peopleInfo}>
                  <div className={styles.peopleAvatar}>
                    {person.avatarInitials?.[0] ?? person.name[0].toUpperCase()}
                  </div>
                  <div>
                    <span className={styles.peopleName}>{person.name}</span>
                    {person.id === defaultPayerId && (
                      <span className={styles.mainProfileBadge}>Responsável Padrão</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Default Payer (CapsuleRadio component) */}
          {users.length > 1 && (
            <div className={styles.defaultPayerWrapper}>
              <CapsuleRadio
                label="Responsável Padrão"
                options={users.map((p) => ({ value: p.id, label: p.name }))}
                value={defaultPayerId}
                onChange={handleDefaultPayerChange}
              />
            </div>
          )}
        </GlassCard>

        {/* 3. GERENCIAMENTO DE CATEGORIAS E PILARES */}
        <GlassCard variant="fino" className={styles.card25}>
          <h2 className={styles.sectionHeader}>
            <span>📊</span> Pilares & Categorias do Orçamento
          </h2>
          <p className={styles.cardDesc}>
            Configure o percentual de meta para cada um dos 6 pilares fundamentais (somando
            exatamente 100%) e gerencie suas subcategorias customizadas.
          </p>

          {/* Grid de Metas dos Pilares */}
          <div className={styles.pillarsMetasGrid}>
            {PILLARS.map((pillar) => (
              <PilarCard
                key={pillar.slug}
                mode="config"
                pilar={pillar.pilarKey}
                percentTarget={pillarTargets[pillar.slug]}
                onPercentChange={(val) => handleTargetChange(pillar.slug, val)}
              />
            ))}
          </div>

          {/* Sum Validator */}
          <div className={styles.totalTargetContainer}>
            <div className={styles.totalTargetRow}>
              <span className={styles.totalTargetTitle}>
                Total Planejado:{" "}
                <span
                  className={clsx(styles.totalTargetPercent, {
                    [styles.totalTargetValid]: totalTargetPercent === 100,
                    [styles.totalTargetInvalid]: totalTargetPercent !== 100,
                  })}
                >
                  {totalTargetPercent}%
                </span>
              </span>
              <Button
                variant="action"
                disabled={totalTargetPercent !== 100}
                onClick={handleSavePillars}
              >
                Salvar Metas
              </Button>
            </div>
            {totalTargetPercent !== 100 && (
              <span className={styles.invalidText}>
                A soma das metas precisa ser de exatamente 100% para salvar (atualmente{" "}
                {totalTargetPercent}%).
              </span>
            )}
          </div>

          <div className={styles.divider} />

          {/* Gerenciador de Categorias Customizadas */}
          <h3 className={clsx(styles.sectionHeader, styles.fs11)}>Categorias por Pilar</h3>
          <p className={clsx(styles.cardDesc, styles.fs085)}>
            Vincule categorias aos pilares correspondentes. Todos os itens são exibidos sem
            necessidade de barra de rolagem.
          </p>

          <div className={styles.categoriesContainerGrid}>
            {/* Listagem Agrupada */}
            <div className={styles.flexColGap15}>
              {PILLARS.map((pillar) => {
                const pillarCats = categoriesByPillar[pillar.slug];
                return (
                  <div key={pillar.slug}>
                    <div
                      className={styles.pillarCatHeader}
                      style={{
                        borderBottom: `1.5px solid color-mix(in srgb, ${pillar.color} 30%, transparent)`,
                      }}
                    >
                      <div className={styles.pillarCatDot} style={{ background: pillar.color }} />
                      <span className={styles.pillarCatTitle}>{pillar.name}</span>
                    </div>

                    {pillarCats.length === 0 ? (
                      <span className={styles.emptyCatText}>Nenhuma subcategoria vinculada.</span>
                    ) : (
                      <div className={styles.catsWrapper}>
                        {pillarCats.map((cat) => (
                          <div key={cat.id} className={styles.catItem}>
                            <span>{cat.name}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id)}
                              className={styles.trashBtn}
                              title="Remover categoria"
                            >
                              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                                <title>Excluir</title>
                                <path
                                  d="M2.5 4H11.5M5 4V2.5H9V4M5.5 6.5V10.5M8.5 6.5V10.5M3.5 4L4 11.5H10L10.5 4"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Criar Nova Categoria */}
            <GlassCard variant="denso" radius="card" className={styles.dashedCreateCard}>
              <h4 className={clsx(styles.sectionHeader, styles.fs095)}>Criar Nova Categoria</h4>
              <form onSubmit={handleAddCategory} className={clsx(styles.form, styles.gap1)}>
                <Input
                  label="Nome da Categoria"
                  placeholder="Ex: Supermercado"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
                <Select
                  label="Pilar Financeiro Associado"
                  value={selectedPillarSlug}
                  onChange={(e) => setSelectedPillarSlug(e.target.value as PillarSlug)}
                  options={PILLARS.map((p) => ({ value: p.slug, label: p.name }))}
                />
                <div className={clsx(styles.alignEndRow, styles.mt05)}>
                  <Button type="submit" variant="action" size="sm">
                    Criar Categoria
                  </Button>
                </div>
              </form>
            </GlassCard>
          </div>
        </GlassCard>

        {/* 4. CONFIGURAÇÕES DE IA (OPENROUTER) */}
        <GlassCard variant="fino" className={styles.card25}>
          <h2 className={styles.sectionHeader}>
            <span>🧠</span> Configurações de Inteligência Artificial
          </h2>
          <p className={styles.cardDesc}>
            Configure o motor de IA que gera seus insights financeiros automáticos mensais e sugere
            planos de otimização.
          </p>

          <div className={styles.flexColGap125}>
            <Input
              label="Chave de API do OpenRouter"
              type="password"
              placeholder="Insira sua chave sk-or-..."
              value={openrouterKey}
              onChange={(e) => setOpenrouterKey(e.target.value)}
            />
          </div>

          <div className={styles.alignEndRow}>
            <Button onClick={handleSaveAi}>Salvar Configurações de IA</Button>
          </div>
        </GlassCard>

        {/* 5. CHAVES DE API DA APLICAÇÃO */}
        <GlassCard variant="fino" className={styles.card25}>
          <h2 className={styles.sectionHeader}>
            <span>🔑</span> Chaves de API para Integrações
          </h2>
          <p className={styles.cardDesc}>
            Crie tokens seguros para integrar outras aplicações e scripts para inserção automática
            de lançamentos via nossa API REST.
          </p>

          {/* Newly created key overlay alert */}
          {newlyCreatedKey && (
            <div className={styles.apiKeysCreatedBox}>
              <div>
                <strong className={styles.apiKeysCreatedTitle}>Chave criada com sucesso!</strong>
                <span className={styles.apiKeysCreatedSubtitle}>
                  Copie o token abaixo agora. Por segurança, ele não será exibido novamente.
                </span>
              </div>
              <div className={styles.apiKeysCreatedTokenWrapper}>
                <code className={styles.apiKeysCreatedToken}>{newlyCreatedKey.token}</code>
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(newlyCreatedKey.token);
                    toast({
                      variant: "success",
                      title: "Chave copiada para a área de transferência!",
                    });
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>
          )}

          <div className={styles.grid16to1}>
            {/* Left Column: List of Keys */}
            <div className={clsx(styles.form, styles.gap1)}>
              {apiKeys.length === 0 ? (
                <span className={clsx(styles.emptyCatText, styles.pl0)}>
                  Você não possui nenhuma chave de API ativa.
                </span>
              ) : (
                apiKeys.map((key) => (
                  <div key={key.id} className={styles.keyItem}>
                    <div>
                      <strong className={styles.keyItemName}>{key.name}</strong>
                      <span className={styles.keyItemDetails}>
                        Criada em {formatKeyDate(key.createdAt)} • Token:{" "}
                        <code className={styles.keyItemToken}>{key.keyPreview}</code>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRevokingKeyId(key.id)}
                      className={styles.trashBtn}
                      title="Revogar chave de API"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <title>Excluir</title>
                        <path
                          d="M2.5 4H11.5M5 4V2.5H9V4M5.5 6.5V10.5M8.5 6.5V10.5M3.5 4L4 11.5H10L10.5 4"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Right Column: Generate Key Form */}
            <GlassCard variant="denso" radius="card" className={styles.dashedCreateCard}>
              <h4 className={clsx(styles.sectionHeader, styles.fs095)}>Gerar Nova Chave</h4>
              <form onSubmit={handleGenerateApiKey} className={styles.form}>
                <Input
                  label="Nome da Chave"
                  placeholder="Ex: Script de Backup"
                  value={newApiKeyName}
                  onChange={(e) => setNewApiKeyName(e.target.value)}
                  required
                />
                <div className={styles.alignEndRow}>
                  <Button type="submit" size="sm">
                    Gerar Chave
                  </Button>
                </div>
              </form>
            </GlassCard>
          </div>
        </GlassCard>
      </div>

      {/* Modal de confirmação de revogação */}
      <Modal
        open={!!revokingKeyId}
        onClose={() => setRevokingKeyId(null)}
        title="Revogar Chave de API"
      >
        <p className={styles.cardDesc}>
          Deseja realmente revogar a chave <strong>{revokingKey?.name}</strong>? Ela deixará de
          funcionar imediatamente.
        </p>
        <div className={styles.alignEndRow}>
          <Button variant="outline" onClick={() => setRevokingKeyId(null)}>
            Cancelar
          </Button>
          <Button variant="action" onClick={handleRevokeApiKey}>
            Revogar Chave
          </Button>
        </div>
      </Modal>
    </div>
  );
}
