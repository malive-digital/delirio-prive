"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("aprovacoes");
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<string | null>(null);

  return (
    <div className="entry-page" style={{ overflowX: "hidden" }}>
      {/* Header Admin */}
      <header className="app-header" style={{ borderBottom: "1px solid rgba(212,175,55,0.2)" }}>
        <Link className="brand" href="/">
          <span className="brand__mark" style={{ background: "var(--gold-primary)", color: "#111" }}>ADM</span>
          <span>Painel Administrativo</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <span style={{ color: "var(--gold-primary)", fontWeight: "bold" }}>Equipe DP</span>
          <Link href="/" style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Sair do Painel</Link>
        </div>
      </header>

      <main className="app-page dashboard" style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
        
        {/* Título */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Gestão Geral da Plataforma</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Aprovações, controle de perfis e saúde financeira do negócio.</p>
        </div>

        {/* Menu de Navegação Admin */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid rgba(245, 230, 200, 0.1)", paddingBottom: "1rem", overflowX: "auto" }}>
          {[
            { id: "aprovacoes", label: "Aprovação de Mídia" },
            { id: "perfis", label: "Gerenciar Perfis" },
            { id: "financeiro", label: "Visão Financeira" }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? "rgba(212, 175, 55, 0.1)" : "transparent",
                border: "none",
                color: activeTab === tab.id ? "var(--gold-primary)" : "var(--text-secondary)",
                padding: "0.8rem 1.5rem",
                borderRadius: "0.5rem",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo Dinâmico */}
        <div style={{ background: "rgba(10, 10, 10, 0.4)", border: "1px solid rgba(245, 230, 200, 0.08)", borderRadius: "1.25rem", padding: "2.5rem", backdropFilter: "blur(12px)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
          
          {/* TAB: APROVAÇÃO DE MÍDIA */}
          {activeTab === "aprovacoes" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.5rem" }}>Fila de Análise</h2>
                <span style={{ padding: "0.4rem 1rem", background: "rgba(234,179,8,0.1)", color: "#eab308", borderRadius: "999px", fontWeight: "bold", fontSize: "0.9rem" }}>3 Pendentes</span>
              </div>
              
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(212,175,55,0.3)", color: "var(--gold-primary)" }}>
                    <th style={{ padding: "1rem" }}>Modelo</th>
                    <th style={{ padding: "1rem" }}>Tipo</th>
                    <th style={{ padding: "1rem" }}>Arquivo</th>
                    <th style={{ padding: "1rem", textAlign: "right" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid rgba(245,230,200,0.05)", color: "white" }}>
                    <td style={{ padding: "1rem" }}><strong>Isadora Monteiro</strong></td>
                    <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>Foto (Capa)</td>
                    <td style={{ padding: "1rem" }}>
                      <button onClick={() => setPreviewMedia("foto_capa_isadora.jpg")} style={{ background: "transparent", border: "none", color: "#3b82f6", textDecoration: "underline", cursor: "pointer" }}>Visualizar Arquivo</button>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", background: "#4ade80", color: "#111", border: "none", borderRadius: "0.3rem", cursor: "pointer", fontWeight: "bold" }}>Aprovar</button>
                      <button style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", background: "transparent", borderRadius: "0.3rem", cursor: "pointer" }}>Recusar</button>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(245,230,200,0.05)", color: "white" }}>
                    <td style={{ padding: "1rem" }}><strong>Rafael Prado</strong></td>
                    <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>Vídeo</td>
                    <td style={{ padding: "1rem" }}>
                      <button onClick={() => setPreviewMedia("video_intro_rafael.mp4")} style={{ background: "transparent", border: "none", color: "#3b82f6", textDecoration: "underline", cursor: "pointer" }}>Visualizar Arquivo</button>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", background: "#4ade80", color: "#111", border: "none", borderRadius: "0.3rem", cursor: "pointer", fontWeight: "bold" }}>Aprovar</button>
                      <button style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", background: "transparent", borderRadius: "0.3rem", cursor: "pointer" }}>Recusar</button>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Modal de Preview */}
              {previewMedia && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                  <div style={{ background: "#111", padding: "2rem", borderRadius: "1rem", border: "1px solid var(--gold-primary)", textAlign: "center", maxWidth: "600px", width: "100%" }}>
                    <h3 style={{ color: "white", marginBottom: "1rem" }}>Visualizando: {previewMedia}</h3>
                    <div style={{ width: "100%", height: "300px", background: "#222", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem", borderRadius: "0.5rem", color: "var(--text-secondary)" }}>
                      [Área do Mídia (Foto ou Vídeo)]
                    </div>
                    <button onClick={() => setPreviewMedia(null)} className="button button--primary" style={{ padding: "0.8rem 2rem" }}>Fechar</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: GERENCIAR PERFIS */}
          {activeTab === "perfis" && !editingProfile && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.5rem" }}>Catálogo de Modelos</h2>
                <input 
                  type="text" 
                  placeholder="Buscar modelo..." 
                  style={{ padding: "0.8rem 1.5rem", borderRadius: "999px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(245,230,200,0.1)", color: "white", width: "300px" }}
                />
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(212,175,55,0.3)", color: "var(--gold-primary)" }}>
                    <th style={{ padding: "1rem" }}>Modelo</th>
                    <th style={{ padding: "1rem" }}>Categoria</th>
                    <th style={{ padding: "1rem" }}>Plano</th>
                    <th style={{ padding: "1rem" }}>Status</th>
                    <th style={{ padding: "1rem", textAlign: "right" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid rgba(245,230,200,0.05)", color: "white" }}>
                    <td style={{ padding: "1rem" }}><strong>Isadora Monteiro</strong></td>
                    <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>Mulher</td>
                    <td style={{ padding: "1rem" }}>Top Privê</td>
                    <td style={{ padding: "1rem" }}><span style={{ color: "#4ade80" }}>Ativo</span></td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <button onClick={() => setEditingProfile("Isadora Monteiro")} style={{ background: "transparent", border: "1px solid var(--gold-primary)", color: "var(--gold-primary)", padding: "0.4rem 1rem", borderRadius: "0.3rem", cursor: "pointer", fontSize: "0.8rem" }}>Editar</button>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(245,230,200,0.05)", color: "white" }}>
                    <td style={{ padding: "1rem" }}><strong>Rafael Prado</strong></td>
                    <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>Homem</td>
                    <td style={{ padding: "1rem" }}>Básico</td>
                    <td style={{ padding: "1rem" }}><span style={{ color: "#f87171" }}>Inativo (Vencido)</span></td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <button onClick={() => setEditingProfile("Rafael Prado")} style={{ background: "transparent", border: "1px solid var(--gold-primary)", color: "var(--gold-primary)", padding: "0.4rem 1rem", borderRadius: "0.3rem", cursor: "pointer", fontSize: "0.8rem" }}>Editar</button>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(245,230,200,0.05)", color: "white" }}>
                    <td style={{ padding: "1rem" }}><strong>Luna Valença</strong></td>
                    <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>Trans</td>
                    <td style={{ padding: "1rem" }}>Premium</td>
                    <td style={{ padding: "1rem" }}><span style={{ color: "#4ade80" }}>Ativo</span></td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <button onClick={() => setEditingProfile("Luna Valença")} style={{ background: "transparent", border: "1px solid var(--gold-primary)", color: "var(--gold-primary)", padding: "0.4rem 1rem", borderRadius: "0.3rem", cursor: "pointer", fontSize: "0.8rem" }}>Editar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* EDITAR PERFIL DO ADMINISTRADOR */}
          {activeTab === "perfis" && editingProfile && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                <button onClick={() => setEditingProfile(null)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Voltar
                </button>
                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Editando: <span style={{ color: "var(--gold-primary)" }}>{editingProfile}</span></h2>
              </div>
              
              <form className="model-profile-form">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                  <label className="input-group">
                    <span>Nome Artístico</span>
                    <input type="text" defaultValue={editingProfile} style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>WhatsApp</span>
                    <input type="text" defaultValue="(11) 99999-9999" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Localização</span>
                    <input type="text" defaultValue="São Paulo, SP" style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(245,230,200,0.1)", color: "white" }} />
                  </label>
                  <label className="input-group">
                    <span>Ação de Moderação</span>
                    <select style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.5)", color: "#f87171", fontWeight: "bold" }}>
                      <option>Perfil Ativo</option>
                      <option>Suspender Temporariamente</option>
                      <option>Banir Usuário</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button className="button button--primary" type="submit" onClick={e => { e.preventDefault(); setEditingProfile(null); alert("Perfil atualizado pelo admin."); }}>Salvar Alterações</button>
                  <button className="button button--muted" type="button" onClick={() => setEditingProfile(null)}>Cancelar</button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: VISÃO FINANCEIRA */}
          {activeTab === "financeiro" && (
            <div>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Receita e Assinaturas</h2>
              
              {/* KPIs Financeiros */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                <div style={{ background: "rgba(18,18,18,0.6)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(245,230,200,0.1)" }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textTransform: "uppercase", fontWeight: "bold" }}>Receita Mensal (Estimada)</p>
                  <strong style={{ display: "block", fontSize: "2.5rem", color: "#4ade80", margin: "0.5rem 0" }}>R$ 14.250,00</strong>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Baseado em planos ativos</span>
                </div>
                
                <div style={{ background: "rgba(18,18,18,0.6)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(245,230,200,0.1)" }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textTransform: "uppercase", fontWeight: "bold" }}>Total de Assinaturas</p>
                  <strong style={{ display: "block", fontSize: "2.5rem", color: "white", margin: "0.5rem 0" }}>142</strong>
                  <span style={{ color: "var(--gold-primary)", fontSize: "0.85rem" }}>85 Básico | 40 Premium | 17 Top</span>
                </div>
              </div>

              <h3 style={{ fontSize: "1.2rem", color: "var(--gold-primary)", marginBottom: "1rem" }}>Últimos Pagamentos Processados</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(212,175,55,0.3)", color: "var(--gold-primary)" }}>
                    <th style={{ padding: "1rem" }}>Data</th>
                    <th style={{ padding: "1rem" }}>Modelo</th>
                    <th style={{ padding: "1rem" }}>Plano</th>
                    <th style={{ padding: "1rem" }}>Valor</th>
                    <th style={{ padding: "1rem" }}>Status Gateway</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid rgba(245,230,200,0.05)", color: "white" }}>
                    <td style={{ padding: "1rem" }}>Hoje, 10:42</td>
                    <td style={{ padding: "1rem" }}>Isadora Monteiro</td>
                    <td style={{ padding: "1rem" }}>Top Privê</td>
                    <td style={{ padding: "1rem" }}>R$ 149,90</td>
                    <td style={{ padding: "1rem" }}><span style={{ color: "#4ade80", fontWeight: "bold" }}>Aprovado</span></td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(245,230,200,0.05)", color: "white" }}>
                    <td style={{ padding: "1rem" }}>Ontem, 16:30</td>
                    <td style={{ padding: "1rem" }}>Luna Valença</td>
                    <td style={{ padding: "1rem" }}>Premium</td>
                    <td style={{ padding: "1rem" }}>R$ 89,90</td>
                    <td style={{ padding: "1rem" }}><span style={{ color: "#4ade80", fontWeight: "bold" }}>Aprovado</span></td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(245,230,200,0.05)", color: "white" }}>
                    <td style={{ padding: "1rem" }}>Ontem, 09:15</td>
                    <td style={{ padding: "1rem" }}>Rafael Prado</td>
                    <td style={{ padding: "1rem" }}>Básico</td>
                    <td style={{ padding: "1rem" }}>R$ 49,90</td>
                    <td style={{ padding: "1rem" }}><span style={{ color: "#f87171", fontWeight: "bold" }}>Recusado (Cartão)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
