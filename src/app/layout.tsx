export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Cormorant_Garamond, Lato } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/providers/AuthProvider";
import { CartProvider } from "@/context/CartContext";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lato = Lato({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Bella Acessórios | Acessórios Femininos Elegantes",
  description:
    "Loja online de bijuterias e acessórios femininos. Anéis, brincos, colares, pulseiras e muito mais. Qualidade e estilo para você.",
  keywords: ["acessórios", "bijuterias", "feminino", "joias", "aneis", "brincos", "colares"],
  openGraph: {
    title: "Bella Acessórios | Acessórios Femininos Elegantes",
    description: "Acessórios femininos elegantes e modernos",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${lato.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-brand-bg text-text-primary">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1 pt-[88px]">{children}</main>
            <Footer />
            <FloatingWhatsApp />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}