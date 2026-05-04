export default function Page() {
  return (
    <>
<header className="app-header">
      <a className="brand" href="/index"><span className="brand__mark">DP</span><span>Delírio Privê</span></a>
      <nav className="app-nav" aria-label="Navegação">
        <a href="/index">Início</a><a href="/dashboard">Dashboard</a><a href="/planos">Planos</a><a className="login-link" href="/login">Entrar</a>
      </nav>
    </header>
    <main className="app-page">
      <div className="page-title">
        <div>
          <p className="eyebrow">Financeiro</p>
          <h1>Histórico de pagamentos</h1>
        </div>
        <a className="button button--ghost" href="/dashboard">Voltar ao dashboard</a>
      </div>
      <section className="dashboard-panel payment-history-panel" aria-label="Histórico de pagamentos">
        <div className="payment-history-row payment-history-row--head"><span>Data</span><span>Plano</span><span>Método</span><span>Status</span><span>Valor</span></div>
        <div className="payment-history-row"><span>30/04/2026</span><span>Top Privê</span><span>Pix</span><strong className="payment-status payment-status--paid">Pago</strong><span>R$ 299,00</span></div>
        <div className="payment-history-row"><span>30/03/2026</span><span>Premium</span><span>Cartão</span><strong className="payment-status payment-status--paid">Pago</strong><span>R$ 179,00</span></div>
        <div className="payment-history-row"><span>28/02/2026</span><span>Básico</span><span>Gratuito</span><strong className="payment-status payment-status--free">Sem cobrança</strong><span>R$ 0,00</span></div>
      </section>
    </main>
  
    </>
  );
}