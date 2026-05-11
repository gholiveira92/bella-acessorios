"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { FiMenu, FiX, FiShoppingBag, FiInstagram, FiUser } from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io5";

export default function Header() {
  const { data: session } = useSession();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-serif text-rose-600">
            Bella Acessórios
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-rose-600 transition-colors">
              Início
            </Link>
            <Link href="/catalog" className="text-gray-700 hover:text-rose-600 transition-colors">
              Catálogo
            </Link>
            <Link
              href="https://instagram.com/bella.acessorios.sa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-rose-600 transition-colors"
            >
              <FiInstagram size={20} />
            </Link>
            <Link
              href="https://wa.me/55SEUNUMERO"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-rose-600 transition-colors"
            >
              <IoLogoWhatsapp size={20} />
            </Link>
            <Link href="/cart" className="text-gray-700 hover:text-rose-600 transition-colors relative">
              <FiShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-rose-600 transition-colors"
                >
                  <FiUser size={20} />
                  <span className="text-sm">{session.user.name?.split(" ")[0]}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-2">
                    <Link
                      href="/my-orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Meus Pedidos
                    </Link>
                    {session.user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ redirect: false });
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-rose-600 transition-colors"
              >
                Login
              </Link>
            )}
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-rose-600"
                onClick={() => setMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                href="/catalog"
                className="text-gray-700 hover:text-rose-600"
                onClick={() => setMenuOpen(false)}
              >
                Catálogo
              </Link>
              <div className="flex gap-4">
                <Link
                  href="https://instagram.com/bella.acessorios.sa"
                  target="_blank"
                  className="text-gray-700"
                >
                  <FiInstagram size={20} />
                </Link>
                <Link
                  href="https://wa.me/55SEUNUMERO"
                  target="_blank"
                  className="text-gray-700"
                >
                  <IoLogoWhatsapp size={20} />
                </Link>
              </div>
              <Link
                href="/cart"
                className="text-gray-700 hover:text-rose-600 flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                Carrinho
                {itemCount > 0 && (
                  <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>
              {session?.user ? (
                <>
                  <Link
                    href="/my-orders"
                    className="text-gray-700 hover:text-rose-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    Meus Pedidos
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="text-gray-700 hover:text-rose-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut({ redirect: false });
                    }}
                    className="text-left text-gray-700 hover:text-rose-600"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-rose-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}