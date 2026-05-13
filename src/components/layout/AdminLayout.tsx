"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FiHome, FiShoppingBag, FiPackage, FiGrid, FiSettings, FiLogOut } from "react-icons/fi";

const menuItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <FiHome /> },
  { href: "/admin/products", label: "Produtos", icon: <FiShoppingBag /> },
  { href: "/admin/categories", label: "Categorias", icon: <FiGrid /> },
  { href: "/admin/orders", label: "Pedidos", icon: <FiPackage /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <aside className="w-64 bg-white shadow-lg min-h-screen fixed">
          <div className="p-6 border-b">
            <Link href="/" className="text-xl font-serif text-rose-600">
              Bella Acessórios
            </Link>
            <p className="text-xs text-gray-500 mt-1">Painel Admin</p>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-rose-50 text-rose-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="absolute bottom-0 w-full p-4 border-t">
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-sm font-medium">
                {session?.user?.name?.charAt(0) || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 px-4 py-2 w-full text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiLogOut />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}