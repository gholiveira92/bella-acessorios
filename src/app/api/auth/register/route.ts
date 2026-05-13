import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/db";
import { validateCPF } from "@/lib/utils";
import { sendConfirmationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, cpf, gender, phone } = body;

    if (!name || !email || !password || !cpf || !gender || !phone) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    if (!validateCPF(cpf)) {
      return NextResponse.json(
        { error: "CPF inválido" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "E-mail já cadastrado" },
        { status: 400 }
      );
    }

    const existingCPF = await prisma.user.findUnique({
      where: { cpf },
    });

    if (existingCPF) {
      return NextResponse.json(
        { error: "CPF já cadastrado" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const confirmationToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        cpf,
        gender,
        phone,
        confirmationToken,
      },
    });

    try {
      await sendConfirmationEmail(email, name, confirmationToken);
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: "Conta criada! Verifique seu e-mail para confirmar.",
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar conta" },
      { status: 500 }
    );
  }
}