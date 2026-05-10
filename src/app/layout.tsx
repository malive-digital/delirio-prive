import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import Script from "next/script";
import { AgeGate } from "@/components/AgeGate";

export const metadata: Metadata = {
  metadataBase: new URL("https://delirioprive.com.br"),
  title: {
    default: "Delírio Privê | Acompanhantes de Luxo",
    template: "%s | Delírio Privê",
  },
  description: "Conheça o Delírio Privê, uma plataforma exclusiva para encontrar acompanhantes de luxo com perfis verificados, fotos, informações completas e atendimento discreto.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Delírio Privê",
    description: "Plataforma exclusiva de acompanhantes de luxo com perfis completos e atendimento discreto.",
    url: "/",
    siteName: "Delírio Privê",
    images: [
      {
        url: "/capa.jpg",
        width: 1200,
        height: 630,
        alt: "Delírio Privê",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Delírio Privê",
    description: "Plataforma exclusiva de acompanhantes de luxo com perfis completos e atendimento discreto.",
    images: ["/capa.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
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
        <AgeGate />
        {children}
        <footer className="site-footer">
          <span>© 2026 Delírio Privê. Todos os direitos reservados.</span>
          <span>Plataforma independente de divulgação de perfis. Não somos agência, boate ou intermediadores.</span>
          <nav className="site-footer__links" aria-label="Links legais">
            <Link href="/termos-de-uso">Termos de uso</Link>
            <Link href="/politica-de-privacidade">Política de privacidade</Link>
          </nav>
        </footer>
        <Script src="/script.js?v=20260506-3" strategy="afterInteractive" />
      </body>
    </html>
  );
}
