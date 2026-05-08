"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const isHomeIntroPending = (pathname: string) =>
  pathname === "/" && !sessionStorage.getItem("introPlayed");

export function AgeGate() {
  const pathname = usePathname();
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [isHidingAgeGate, setIsHidingAgeGate] = useState(false);

  useEffect(() => {
    const syncAgeGate = () => {
      if (sessionStorage.getItem("ageConfirmed")) {
        setShowAgeGate(false);
        return;
      }

      setShowAgeGate(!isHomeIntroPending(pathname));
    };

    syncAgeGate();
    window.addEventListener("delirio:intro-finished", syncAgeGate);

    return () => {
      window.removeEventListener("delirio:intro-finished", syncAgeGate);
    };
  }, [pathname]);

  const handleAgeConfirm = () => {
    sessionStorage.setItem("ageConfirmed", "true");
    setIsHidingAgeGate(true);

    setTimeout(() => {
      setShowAgeGate(false);
      setIsHidingAgeGate(false);
      window.dispatchEvent(new Event("delirio:age-confirmed"));
    }, 400);
  };

  if (!showAgeGate) {
    return null;
  }

  return (
    <div className={`age-gate ${isHidingAgeGate ? "is-hiding" : ""}`} role="dialog" aria-modal="true" aria-labelledby="age-title">
      <div className="age-gate__panel">
        <p className="eyebrow">Conteúdo adulto</p>
        <h2 id="age-title">Acesso restrito a maiores de 18 anos</h2>
        <p>Ao continuar, você confirma ser maior de idade e concorda com os termos de uso e política de privacidade.</p>
        <div className="age-gate__notice-list">
          <div className="age-gate__notice age-gate__notice--institutional">
            <strong>Aviso institucional</strong>
            <p>
              O Delírio Privê atua exclusivamente como plataforma de divulgação de perfis independentes. Não somos agência,
              boate, casa de atendimento, intermediadores ou representantes das anunciantes. Toda negociação acontece
              diretamente entre visitante e anunciante.
            </p>
          </div>

          <div className="age-gate__notice age-gate__notice--warning">
            <strong>Alerta contra golpes</strong>
            <p>
              O Delírio Privê não solicita prints de conversas, vídeos de clientes, códigos, senhas ou pagamentos para
              terceiros. Desconfie de perfis, agenciadores ou supostos representantes usando o nome do site. Antes de
              qualquer pagamento, confirme diretamente com a administração oficial. Não respondemos intermediários,
              agenciadores ou terceiros.
            </p>
            <Link href="/cadastro-whatsapp" className="age-gate__policy-link">
              Ver alertas e política de anúncios
            </Link>
          </div>
        </div>
        <div className="age-gate__actions">
          <button className="button button--primary" type="button" onClick={handleAgeConfirm}>
            Tenho 18 anos ou mais
          </button>
          <a className="button button--ghost" href="https://www.google.com.br">Sair</a>
        </div>
      </div>
    </div>
  );
}
