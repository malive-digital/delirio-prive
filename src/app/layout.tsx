import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Delírio Privê",
  description: "Escolha seu interesse e acesse o catálogo premium do Delírio Privê.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:wght@600;700&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <footer className="site-footer">
          <span>© 2026 Delírio Privê. Todos os direitos reservados.</span>
          <span>Plataforma independente de divulgação de perfis. Não somos agência, boate ou intermediadores.</span>
        </footer>
        <Script src="/script.js?v=20260506-3" strategy="afterInteractive" />
      </body>
    </html>
  );
}
