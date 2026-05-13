import { NextResponse } from "next/server";
import { query } from "@/lib/db-direct";

export async function GET() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        cpf TEXT NOT NULL,
        gender TEXT NOT NULL,
        phone TEXT NOT NULL,
        role TEXT DEFAULT 'CLIENT',
        email_verified TIMESTAMP,
        confirmation_token TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
        user_id TEXT NOT NULL,
        cep TEXT NOT NULL,
        street TEXT NOT NULL,
        number TEXT NOT NULL,
        complement TEXT,
        neighborhood TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        image TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        price DOUBLE PRECISION NOT NULL,
        promotional_price DOUBLE PRECISION,
        stock INTEGER DEFAULT 0,
        weight DOUBLE PRECISION,
        height DOUBLE PRECISION,
        width DOUBLE PRECISION,
        length DOUBLE PRECISION,
        active BOOLEAN DEFAULT true,
        category_id TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
        product_id TEXT NOT NULL,
        url TEXT NOT NULL,
        is_main BOOLEAN DEFAULT false,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS carts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
        user_id TEXT UNIQUE,
        session_id TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
        cart_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DOUBLE PRECISION NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
        order_number TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        address_id TEXT NOT NULL,
        status TEXT DEFAULT 'AGUARDANDO_PAGAMENTO',
        subtotal DOUBLE PRECISION NOT NULL,
        shipping_price DOUBLE PRECISION NOT NULL,
        total DOUBLE PRECISION NOT NULL,
        shipping_provider TEXT,
        shipping_deadline INTEGER,
        shipping_tracking TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DOUBLE PRECISION NOT NULL,
        total DOUBLE PRECISION NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
        order_id TEXT NOT NULL UNIQUE,
        provider TEXT NOT NULL,
        method TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        transaction_id TEXT,
        webhook_token TEXT,
        pix_qr_code TEXT,
        pix_copy_paste TEXT,
        installment INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON users(email)`);
    await query(`CREATE UNIQUE INDEX IF NOT EXISTS "User_cpf_key" ON users(cpf)`);
    await query(`CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON products(slug)`);
    await query(`CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON categories(slug)`);
    await query(`CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON orders(order_number)`);
    await query(`CREATE UNIQUE INDEX IF NOT EXISTS "Payment_orderId_key" ON payments(order_id)`);

    await query(`
      CREATE TABLE IF NOT EXISTS rate_limit_records (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
        identifier TEXT NOT NULL,
        action TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        blocked BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    return NextResponse.json({ success: true, message: "Tabelas criadas com sucesso!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}