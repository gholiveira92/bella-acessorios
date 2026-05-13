"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { FiMenu, FiX, FiShoppingBag, FiUser, FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { data: session } = useSession();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { name: "Novidades", slug: "newest" },
    { name: "Anéis", slug: "aneis" },
    { name: "Colares", slug: "colares" },
    { name: "Brincos", slug: "brincos" },
    { name: "Pulseiras", slug: "pulseiras" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Bar - Minimal */}
      <div className="bg-brand-gold-dark text-white text-[10px] py-1.5">
        <div className="max-w-7xl mx-auto px-4 md:px-10 flex justify-center items-center gap-4 md:gap-8">
          <span className="hidden sm:inline">Frete grátis acima de R$ 299</span>
          <span className="hidden sm:inline">·</span>
          <span>3x sem juros</span>
        </div>
      </div>

      {/* Main Header */}
      <div 
        className={`bg-white/95 backdrop-blur-md transition-all duration-300 ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <div className="flex items-center justify-between h-16 md:h-[70px]">
            
            {/* Left - Mobile Menu */}
            <div className="flex items-center">
              <button
                className="md:hidden p-2 -ml-2 text-text-secondary hover:text-brand-gold transition-colors"
                onClick={() => setMenuOpen(true)}
                aria-label="Menu"
              >
                <FiMenu size={22} />
              </button>

              {/* Desktop Menu */}
              <nav className="hidden md:flex items-center gap-6 lg:gap-8 ml-0">
                {menuItems.map((item) => (
                  <Link
                    key={item.slug}
                    href={item.slug === "newest" ? "/catalog?sort=newest" : `/catalog?category=${item.slug}`}
                    className="text-[14px] text-text-secondary hover:text-brand-gold transition-colors relative group font-sans"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center - Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <h1 className="text-lg md:text-xl font-serif text-brand-gold-dark tracking-[0.15em] uppercase">
                Bella Acessórios
              </h1>
            </Link>

            {/* Right - Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              <button 
                className="hidden md:block p-2 text-text-secondary hover:text-brand-gold transition-colors" 
                aria-label="Buscar"
              >
                <FiSearch size={19} />
              </button>
              
              <Link 
                href="/cart" 
                className="p-2 text-text-secondary hover:text-brand-gold transition-colors relative"
              >
                <FiShoppingBag size={19} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-gold text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </Link>

              {session?.user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="p-2 text-text-secondary hover:text-brand-gold transition-colors"
                  >
                    <FiUser size={19} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-48 bg-white border border-brand-bg-dark rounded-lg shadow-lg py-2 z-50"
                      >
                        <Link
                          href="/my-orders"
                          className="block px-4 py-2.5 text-sm text-text-secondary hover:text-brand-gold hover:bg-brand-bg-light"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Meus Pedidos
                        </Link>
                        {session.user.role === "ADMIN" && (
                          <Link
                            href="/admin/dashboard"
                            className="block px-4 py-2.5 text-sm text-text-secondary hover:text-brand-gold hover:bg-brand-bg-light"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Painel Admin
                          </Link>
                        )}
                        <hr className="my-1.5 border-brand-bg-dark" />
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut({ redirect: false });
                          }}
                          className="block w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-brand-gold hover:bg-brand-bg-light"
                        >
                          Sair
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden md:block p-2 text-text-secondary hover:text-brand-gold transition-colors"
                >
                  <FiUser size={19} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Drawer Lateral */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 md:hidden shadow-xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-brand-bg-dark">
                <span className="text-lg font-serif text-brand-gold-dark">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 text-text-secondary hover:text-brand-gold"
                >
                  <FiX size={22} />
                </button>
              </div>
              
              <nav className="p-5 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.slug}
                    href={item.slug === "newest" ? "/catalog?sort=newest" : `/catalog?category=${item.slug}`}
                    className="block py-3.5 text-sm text-text-secondary hover:text-brand-gold border-b border-brand-bg-light font-sans"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <hr className="my-4 border-brand-bg-dark" />
                
                {session?.user ? (
                  <>
                    <Link
                      href="/my-orders"
                      className="block py-3 text-sm text-text-secondary hover:text-brand-gold"
                      onClick={() => setMenuOpen(false)}
                    >
                      Meus Pedidos
                    </Link>
                    {session.user.role === "ADMIN" && (
                      <Link
                        href="/admin/dashboard"
                        className="block py-3 text-sm text-text-secondary hover:text-brand-gold"
                        onClick={() => setMenuOpen(false)}
                      >
                        Painel Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ redirect: false });
                      }}
                      className="block py-3 text-sm text-text-secondary hover:text-brand-gold w-full text-left"
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="block py-3 text-sm text-text-secondary hover:text-brand-gold"
                    onClick={() => setMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}