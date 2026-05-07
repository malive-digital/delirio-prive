"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const adminWhatsapp = "5511999999999";
const displayWhatsapp = "(11) 99999-9999";

function CadastroWhatsappContent() {
  const searchParams = useSearchParams();
  const plano = searchParams.get("plano");
  const message = encodeURIComponent(
    plano
      ? `Olá, equipe Delírio Privê! Gostaria de criar ou destacar meu perfil no plano ${plano}. Podem me orientar pelo atendimento oficial?`
      : "Olá, equipe Delírio Privê! Gostaria de criar ou destacar meu perfil na plataforma. Podem me orientar pelo atendimento oficial?",
  );
  const waLink = `https://wa.me/${adminWhatsapp}?text=${message}`;

  return (
    <div className="entry-page cadastro-page">
      <header className="app-header">
        <Link className="brand" href="/">
          <span className="brand__mark">DP</span>
          <span>Delírio Privê</span>
        </Link>
        <nav className="app-nav" aria-label="Navegação">
          <Link href="/">Início</Link>
          <Link href="/planos">Planos</Link>
          <Link href="/parcerias-promocoes">Parcerias</Link>
          <Link href="/login">Entrar</Link>
        </nav>
      </header>

      <main className="cadastro-shell">
        <section className="cadastro-hero" aria-labelledby="cadastro-title">
          <div className="cadastro-hero__copy">
            <p className="eyebrow">Atendimento oficial</p>
            <h1 id="cadastro-title">Cadastro com verificação humana</h1>
            <p>
              O Delírio Privê divulga perfis independentes. Não somos agência, boate, flat, casa de atendimento,
              intermediador ou representante das anunciantes.
            </p>
            <div className="cadastro-actions">
              <a className="button button--primary" href={waLink} target="_blank" rel="noreferrer">
                Falar pelo WhatsApp oficial
              </a>
              <Link className="button button--ghost" href="/planos">
                Ver planos
              </Link>
            </div>
            <p className="cadastro-note">Canal oficial para anúncios: {displayWhatsapp}</p>
          </div>

          <aside className="cadastro-card" aria-label="Como funciona">
            <h2>Como funciona</h2>
            <ol>
              <li>Você fala diretamente com a administração oficial do Delírio Privê.</li>
              <li>Confirmamos maioridade e avaliamos o material do perfil com sigilo.</li>
              <li>Após aprovação e pagamento confirmado, o anúncio é publicado em até 24 horas.</li>
            </ol>
          </aside>
        </section>

        <section className="safety-section" aria-labelledby="safety-title">
          <div className="section__header">
            <p className="eyebrow">Segurança</p>
            <h2 id="safety-title">Alertas importantes contra golpes</h2>
            <p>Use apenas os canais oficiais e desconfie de qualquer abordagem fora desse fluxo.</p>
          </div>

          <div className="safety-grid">
            {[
              "Não respondemos intermediários, agenciadores ou terceiros falando em nome de anunciantes.",
              "Não caia em golpes de agenciadores que usem o nome do Delírio Privê para cobrar taxas ou prometer destaque.",
              "Não solicitamos prints de conversas, vídeos de clientes, senhas, códigos ou dados privados de terceiros.",
              "Cuidado com golpes de flats, book VIP, denúncias falsas de perfil e cobranças feitas somente por boleto.",
              "Não efetue pagamentos sem confirmar diretamente com a administração oficial a disponibilidade do anúncio.",
              "Não damos informações sobre perfis, pagamentos ou cadastros para terceiros.",
            ].map((item) => (
              <article className="safety-item" key={item}>
                {item}
              </article>
            ))}
          </div>
        </section>

        <section className="policy-section" aria-labelledby="policy-title">
          <div className="section__header">
            <p className="eyebrow">Política de anúncios</p>
            <h2 id="policy-title">Diretrizes para publicação</h2>
          </div>

          <div className="policy-list">
            <article>
              <h3>Material aprovado</h3>
              <p>
                Para anunciar, é necessário ter mais de 18 anos e enviar material fotográfico próprio, nítido e autorizado.
                Ensaios com baixa resolução, aparência excessivamente caseira ou já publicados em portais muito populares
                podem ser recusados.
              </p>
            </article>
            <article>
              <h3>Conteúdo não aceito</h3>
              <p>
                Não publicamos imagens com terceiros identificáveis, símbolos oficiais, temas religiosos, ambientes
                políticos, militares ou sagrados, nem fotos que prejudiquem a segurança, privacidade ou reputação da
                plataforma.
              </p>
            </article>
            <article>
              <h3>Quantidade de mídia</h3>
              <p>
                Os limites seguem o plano contratado: Básico com 5 fotos, Premium com 10 fotos e 1 vídeo, Top Privê com
                15 fotos e 2 vídeos.
              </p>
            </article>
            <article>
              <h3>Pagamento e renovação</h3>
              <p>
                O pagamento é feito pelos meios informados pela administração oficial. Após a publicação do anúncio, os
                valores não são reembolsáveis. O Delírio Privê pode não publicar ou não renovar anúncios que prejudiquem a
                integridade do site.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function CadastroWhatsapp() {
  return (
    <Suspense fallback={null}>
      <CadastroWhatsappContent />
    </Suspense>
  );
}
