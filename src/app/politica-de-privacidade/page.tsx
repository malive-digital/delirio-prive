import Link from "next/link";
import type { Metadata } from "next";
import { AuthNavLink } from "@/components/AuthNavLink";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Política de privacidade da plataforma Delírio Privê.",
  alternates: {
    canonical: "/politica-de-privacidade",
  },
};

const sections = [
  {
    title: "1. Dados que podemos coletar",
    body: "Podemos coletar dados fornecidos diretamente por você, como nome, e-mail, telefone, WhatsApp, localização informada, descrição de perfil, documentos enviados para verificação, comprovantes, fotos, vídeos e mensagens enviadas por formulários da plataforma.",
  },
  {
    title: "2. Dados de uso e tecnologia",
    body: "Também podemos coletar informações técnicas de acesso, como endereço IP, dispositivo, navegador, páginas visitadas, data e horário de acesso, cookies e identificadores semelhantes para segurança, funcionamento, análise e melhoria da plataforma.",
  },
  {
    title: "3. Finalidades do tratamento",
    body: "Usamos dados para criar e administrar contas, publicar perfis, verificar identidade e elegibilidade, processar planos, oferecer suporte, prevenir fraude, cumprir obrigações legais, melhorar a experiência e manter a segurança da comunidade.",
  },
  {
    title: "4. Bases legais",
    body: "O tratamento pode ocorrer com base no consentimento, execução de contrato, cumprimento de obrigação legal ou regulatória, exercício regular de direitos e legítimo interesse, sempre conforme a Lei Geral de Proteção de Dados (LGPD).",
  },
  {
    title: "5. Compartilhamento",
    body: "Podemos compartilhar dados com provedores de hospedagem, autenticação, pagamentos, armazenamento, análise, suporte, autoridades competentes ou parceiros estritamente necessários para operar a plataforma, cumprir a lei ou proteger direitos.",
  },
  {
    title: "6. Dados públicos do perfil",
    body: "Informações publicadas em perfis, como nome artístico, descrição, fotos, vídeos, localidade e meios de contato escolhidos pelo anunciante, podem ser vistas por visitantes da plataforma enquanto o perfil estiver ativo ou disponível.",
  },
  {
    title: "7. Segurança e retenção",
    body: "Adotamos medidas razoáveis para proteger os dados contra acesso indevido, perda, alteração ou divulgação não autorizada. Os dados são mantidos pelo tempo necessário para cumprir as finalidades descritas, obrigações legais e defesa de direitos.",
  },
  {
    title: "8. Direitos dos titulares",
    body: "Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, bloqueio, eliminação, portabilidade, informações sobre compartilhamento e revisão de decisões automatizadas, quando aplicável pela LGPD.",
  },
  {
    title: "9. Cookies",
    body: "Cookies e tecnologias semelhantes podem ser usados para manter sessões, lembrar preferências, medir desempenho, reforçar segurança e melhorar funcionalidades. Você pode configurar seu navegador para bloquear cookies, mas isso pode afetar recursos do site.",
  },
  {
    title: "10. Alterações desta política",
    body: "Esta política pode ser atualizada para refletir mudanças legais, técnicas ou operacionais. A versão vigente será a publicada nesta página, com a data de atualização correspondente.",
  },
];

export default function PoliticaDePrivacidadePage() {
  return (
    <>
      <header className="app-header">
        <Link className="brand" href="/">
          <span className="brand__mark">DP</span>
          <span>Delírio Privê</span>
        </Link>
        <nav className="app-nav" aria-label="Navegação">
          <Link href="/">Início</Link>
          <Link href="/planos">Planos</Link>
          <Link href="/parcerias-promocoes">Parcerias</Link>
          <AuthNavLink />
        </nav>
      </header>

      <main className="app-page legal-page">
        <div className="page-title">
          <div>
            <p className="eyebrow">Delírio Privê</p>
            <h1>Política de Privacidade</h1>
          </div>
          <p>Última atualização: 9 de maio de 2026.</p>
        </div>

        <section className="legal-content" aria-label="Política de privacidade">
          {sections.map((section) => (
            <article key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </section>

        <div className="legal-actions">
          <Link className="button button--ghost" href="/">
            Voltar ao início
          </Link>
          <Link className="button button--primary" href="/termos-de-uso">
            Termos de uso
          </Link>
        </div>
      </main>
    </>
  );
}
