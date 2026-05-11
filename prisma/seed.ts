import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Creating seeds...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "belaacessoriossa@gmail.com" },
    update: {},
    create: {
      name: "Bella Acessórios",
      email: "belaacessoriossa@gmail.com",
      passwordHash: adminPassword,
      cpf: "12345678901",
      gender: "FEMININO",
      phone: "11999999999",
      role: "ADMIN",
    },
  });
  console.log("✓ Admin user created");

  const categories = [
    { name: "Anéis", slug: "aneis" },
    { name: "Brincos", slug: "brincos" },
    { name: "Colares", slug: "colares" },
    { name: "Pulseiras", slug: "pulseiras" },
    { name: "Tornozeleiras", slug: "tornozeleiras" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✓ Categories created");

  const aneisCategory = await prisma.category.findUnique({ where: { slug: "aneis" } });
  const brincosCategory = await prisma.category.findUnique({ where: { slug: "brincos" } });
  const colaresCategory = await prisma.category.findUnique({ where: { slug: "colares" } });
  const pulseirasCategory = await prisma.category.findUnique({ where: { slug: "pulseiras" } });

  const products = [
    {
      name: "Anel Casulo Dourado",
      slug: "anel-casulo-dourado",
      description: "Anel elegante em formato de casulo, banhado a ouro 18k. Perfeito para occasions especiais.",
      price: 89.9,
      promotionalPrice: 69.9,
      stock: 15,
      categoryId: aneisCategory?.id,
      weight: 0.005,
      images: [
        { url: "https://placehold.co/800x800/fce7f3/db2777?text=Anel+Casulo+1", isMain: true },
        { url: "https://placehold.co/800x800/fce7f3/db2777?text=Anel+Casulo+2", isMain: false },
      ],
    },
    {
      name: "Brinco Ponto de Luz",
      slug: "brinco-ponto-de-luz",
      description: "Brinco clássico ponto de luz com pedra cristal. Elegante e versátil.",
      price: 59.9,
      promotionalPrice: null,
      stock: 20,
      categoryId: brincosCategory?.id,
      weight: 0.003,
      images: [
        { url: "https://placehold.co/800x800/fce7f3/db2777?text=Brinco+Ponto+1", isMain: true },
      ],
    },
    {
      name: "Colar Gargantilha",
      slug: "colar-gargantilha",
      description: "Colar gargantilha com correntes delicadas. Acompanha pingente coração.",
      price: 129.9,
      promotionalPrice: 99.9,
      stock: 10,
      categoryId: colaresCategory?.id,
      weight: 0.008,
      images: [
        { url: "https://placehold.co/800x800/fce7f3/db2777?text=Colar+Gargantilha+1", isMain: true },
        { url: "https://placehold.co/800x800/fce7f3/db2777?text=Colar+Gargantilha+2", isMain: false },
      ],
    },
    {
      name: "Pulseira Berloque",
      slug: "pulseira-berloque",
      description: "Pulseira em ouro 18k com berloques personalizados. Ideal para presente.",
      price: 79.9,
      promotionalPrice: null,
      stock: 12,
      categoryId: pulseirasCategory?.id,
      weight: 0.006,
      images: [
        { url: "https://placehold.co/800x800/fce7f3/db2777?text=Pulseira+Berloque+1", isMain: true },
      ],
    },
    {
      name: "Tornozeleira Dourada",
      slug: "tornozeleira-dourada",
      description: "Tornozeleira delicada com detalhes em flores. Banhada a ouro 18k.",
      price: 49.9,
      promotionalPrice: 39.9,
      stock: 25,
      categoryId: (await prisma.category.findUnique({ where: { slug: "tornozeleiras" } }))?.id,
      weight: 0.004,
      images: [
        { url: "https://placehold.co/800x800/fce7f3/db2777?text=Tornozeleira+1", isMain: true },
      ],
    },
  ];

  for (const productData of products) {
    const { images, ...product } = productData;
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });

    for (const img of images) {
      await prisma.productImage.upsert({
        where: { id: `${created.id}-${img.isMain ? "main" : Math.random()}` },
        update: {},
        create: {
          productId: created.id,
          url: img.url,
          isMain: img.isMain,
          order: img.isMain ? 0 : 1,
        },
      });
    }
  }
  console.log("✓ Products created");

  console.log("✅ Seeds completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });