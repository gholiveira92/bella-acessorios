"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiCheck, FiX, FiMail } from "react-icons/fi";

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("Link de confirmação inválido");
      return;
    }

    const confirmEmail = async () => {
      try {
        const res = await fetch("/api/auth/confirm-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error);
        }
      } catch {
        setStatus("error");
        setMessage("Erro ao confirmar e-mail");
      }
    };

    confirmEmail();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F7F2EA] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-[#F7F2EA] rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 border-4 border-[#C8A269] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600">Confirmando seu e-mail...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#F7F2EA] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiX className="text-red-600 text-3xl" />
            </div>
            <h1 className="text-2xl font-serif text-gray-800 mb-4">Erro na Confirmação</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/auth/login"
              className="inline-block bg-[#C8A269] text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Voltar para Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F2EA] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-green-600 text-3xl" />
          </div>
          <h1 className="text-2xl font-serif text-gray-800 mb-4">E-mail Confirmado!</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            href="/auth/login"
            className="inline-block bg-[#C8A269] text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F2EA] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#C8A269] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}