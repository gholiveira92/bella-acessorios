"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { FiMenu, FiX, FiShoppingBag, FiUser, FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { name: "Novidades", slug: "newest" },
  { name: "Anéis", slug: "aneis" },
  { name: "Colares", slug: "colares" },
  { name: "Brincos", slug: "brincos" },
  { name: "Pulseiras", slug: "pulseiras" },
];

export default function Header() {
  const { data: session } = useSession();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalog?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Top Bar */}
        <div className="bg-brand-gold-dark text-white text-[9px] sm:text-[10px] py-1.5">
          <div className="max-w-7xl mx-auto px-4 md:px-10 flex justify-center items-center gap-3 sm:gap-8">
            <span>Frete grátis acima de R$ 299</span>
            <span className="hidden sm:inline">·</span>
            <span>3x sem juros</span>
          </div>
        </div>

        {/* Main Header */}
        <div
          className={`bg-white transition-all duration-300 ${
            scrolled
              ? "shadow-sm backdrop-blur-md"
              : "border-b border-brand-bg-light"
          }`}
        >
          <div className="max-w-7xl mx-auto px-5 md:px-12 lg:px-16">
            {/* Flex Container: Nav Left | Logo | Actions Right */}
            <div className="relative flex items-center h-[68px] md:h-[76px]">

              {/* Nav Left - Desktop Only */}
              <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-none">
                {menuItems.map((item) => (
                  <Link
                    key={item.slug}
                    href={item.slug === "newest" ? "/catalog?sort=newest" : `/catalog?category=${item.slug}`}
                    className="text-[13px] text-text-secondary hover:text-brand-gold transition-colors relative group font-sans tracking-wide py-2"
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-brand-gold transition-all duration-300 group-hover:w-full" />
                  </Link>
                ))}
              </nav>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden absolute left-0 p-2 text-text-secondary hover:text-brand-gold transition-colors"
                onClick={() => setMenuOpen(true)}
                aria-label="Menu"
              >
                <FiMenu size={22} />
              </button>

              {/* Logo - Always Centered */}
              <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:left-1/2 md:-translate-x-1/2">
                <h1 className="text-lg md:text-xl font-serif text-brand-gold-dark tracking-[0.18em] uppercase whitespace-nowrap">
                  Bella Acessórios
                </h1>
              </Link>

              {/* Actions Right */}
              <div className="absolute right-0 flex items-center gap-1 md:gap-2">
                {/* Search Button */}
                <button
                  className="hidden md:block p-2 text-text-secondary hover:text-brand-gold transition-colors"
                  onClick={() => setSearchOpen(!searchOpen)}
                  aria-label="Buscar"
                >
                  <FiSearch size={19} />
                </button>

                {/* Mobile Search Icon */}
                <button
                  className="md:hidden p-2 text-text-secondary hover:text-brand-gold transition-colors"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Buscar"
                >
                  <FiSearch size={20} />
                </button>

                {/* Cart */}
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

                {/* User Desktop */}
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

          {/* Search Bar (expandable) */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-t border-brand-bg-light"
              >
                <div className="max-w-7xl mx-auto px-4 md:px-10 py-3">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar produtos..."
                      className="w-full pl-10 pr-10 py-2.5 bg-brand-bg-light border border-brand-bg-dark rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      autoFocus
                    />
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      <FiX size={16} />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu - Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-40 md:hidden"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 md:hidden shadow-xl"
              >
                <div className="flex items-center justify-between p-5 border-b border-brand-bg-light">
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

                  <hr className="my-4 border-brand-bg-light" />

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

      {/* Spacer for fixed header */}
      <div className="h-[calc(68px+26px)] md:h-[calc(76px+26px)]" />
    </>
  );
}