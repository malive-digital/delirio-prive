import Link from "next/link";
import type { Metadata } from "next";
import { AuthNavLink } from "@/components/AuthNavLink";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de uso da plataforma Delírio Privê.",
  alternates: {
    canonical: "/termos-de-uso",
  },
};

const sections = [
  {
    title: "1. Aceitação dos termos",
    body: "Ao acessar ou utilizar o Delírio Privê, você declara que leu, compreendeu e concorda com estes Termos de Uso. Caso não concorde com alguma condição, interrompa o uso da plataforma.",
  },
  {
    title: "2. Natureza da plataforma",
    body: "O Delírio Privê é uma plataforma independente de divulgação de perfis e conteúdos informativos. Não somos agência, casa noturna, intermediadores de encontros, representantes, empregadores ou responsáveis pela negociação entre usuários e anunciantes.",
  },
  {
    title: "3. Uso permitido",
    body: "A plataforma é destinada exclusivamente a pessoas maiores de 18 anos. É proibido usar o site para práticas ilegais, exploração, fraude, discriminação, assédio, divulgação de dados de terceiros sem autorização ou qualquer atividade que viole a legislação aplicável.",
  },
  {
    title: "4. Cadastro e veracidade das informações",
    body: "Usuários e anunciantes são responsáveis por fornecer informações verdadeiras, manter seus dados atualizados e preservar a confidencialidade de suas credenciais de acesso. Podemos solicitar verificações adicionais para proteger a comunidade e a integridade da plataforma.",
  },
  {
    title: "5. Conteúdo publicado",
    body: "Cada anunciante é responsável pelas informações, imagens, vídeos, textos e links publicados em seu perfil. Podemos remover, moderar ou bloquear conteúdos que violem estes termos, direitos de terceiros, regras internas ou exigências legais.",
  },
  {
    title: "6. Planos, pagamentos e exibição",
    body: "Planos pagos podem oferecer recursos de destaque, tempo de exibição ou funcionalidades adicionais. Valores, benefícios e prazos podem ser alterados mediante atualização das informações na plataforma. A ativação de recursos pode depender da confirmação de pagamento e verificações cadastrais.",
  },
  {
    title: "7. Parcerias e promoções",
    body: "Parcerias e promoções exibidas no site podem conter links para terceiros. O Delírio Privê não se responsabiliza por produtos, serviços, atendimento, disponibilidade, preços, políticas ou conteúdos de sites externos.",
  },
  {
    title: "8. Limitação de responsabilidade",
    body: "A plataforma é fornecida no estado em que se encontra. Não garantimos disponibilidade ininterrupta, ausência de erros, resultados específicos, contatos, contratações ou acordos entre usuários. Cada pessoa é responsável por suas decisões, comunicações e encontros fora da plataforma.",
  },
  {
    title: "9. Suspensão e encerramento",
    body: "Podemos suspender, limitar ou encerrar acessos e perfis em caso de suspeita de fraude, violação destes termos, risco a terceiros, ordem legal ou uso inadequado da plataforma.",
  },
  {
    title: "10. Alterações dos termos",
    body: "Estes termos podem ser atualizados periodicamente. A versão publicada nesta página será considerada a versão vigente a partir da data de atualização informada.",
  },
];

export default function TermosDeUsoPage() {
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
            <h1>Termos de Uso</h1>
          </div>
          <p>Última atualização: 9 de maio de 2026.</p>
        </div>

        <section className="legal-content" aria-label="Termos de uso">
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
          <Link className="button button--primary" href="/politica-de-privacidade">
            Política de privacidade
          </Link>
        </div>
      </main>
    </>
  );
}
