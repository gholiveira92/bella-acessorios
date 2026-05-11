import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/providers/AuthProvider";
import { CartProvider } from "@/context/CartContext";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
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
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-white text-gray-800">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}