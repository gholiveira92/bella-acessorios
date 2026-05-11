import { NextResponse } from "next/server";

const mockProducts = [
  {
    id: "1",
    name: "Anel Casulo Dourado",
    slug: "anel-casulo-dourado",
    description: "Anel elegante em formato de casulo, banhado a ouro 18k. Perfeito para ocasiões especiais. Acabamento detalhado e brilho intenso. Uma peça que agrega elegância a qualquer look.",
    price: 89.9,
    promotionalPrice: 69.9,
    stock: 15,
    weight: 0.005,
    height: 2,
    width: 2,
    length: 2,
    categoryId: "1",
    category: { id: "1", name: "Anéis", slug: "aneis" },
    images: [
      { id: "1", url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop", isMain: true },
      { id: "2", url: "https://images.unsplash.com/photo-1617038224538-2a5d96930c30?w=800&h=800&fit=crop", isMain: false },
      { id: "3", url: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop", isMain: false },
    ],
    relatedProducts: [
      { id: "6", name: "Anel Coração", slug: "anel-coracao", price: 69.9, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop" },
      { id: "2", name: "Brinco Ponto de Luz", slug: "brinco-ponto-de-luz", price: 59.9, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop" },
      { id: "3", name: "Colar Gargantilha", slug: "colar-gargantilha", price: 99.9, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop" },
    ],
  },
  {
    id: "2",
    name: "Brinco Ponto de Luz",
    slug: "brinco-ponto-de-luz",
    description: "Brinco clássico ponto de luz com pedra cristal. Elegante e versátil para qualquer ocasião.",
    price: 59.9,
    promotionalPrice: null,
    stock: 20,
    weight: 0.003,
    categoryId: "2",
    category: { id: "2", name: "Brincos", slug: "brincos" },
    images: [
      { id: "4", url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop", isMain: true },
    ],
    relatedProducts: [],
  },
  {
    id: "3",
    name: "Colar Gargantilha",
    slug: "colar-gargantilha",
    description: "Colar gargantilha com correntes delicadas banhadas a ouro 18k. Acompanha pingente coração cravejado.",
    price: 129.9,
    promotionalPrice: 99.9,
    stock: 10,
    weight: 0.008,
    categoryId: "3",
    category: { id: "3", name: "Colares", slug: "colares" },
    images: [
      { id: "5", url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop", isMain: true },
      { id: "6", url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&h=800&fit=crop", isMain: false },
    ],
    relatedProducts: [],
  },
  {
    id: "4",
    name: "Pulseira Berloque",
    slug: "pulseira-berloque",
    description: "Pulseira em ouro 18k com berloques personalizados. Ideal para presente e dia especial.",
    price: 79.9,
    promotionalPrice: null,
    stock: 12,
    weight: 0.006,
    categoryId: "4",
    category: { id: "4", name: "Pulseiras", slug: "pulseiras" },
    images: [
      { id: "7", url: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&h=800&fit=crop", isMain: true },
    ],
    relatedProducts: [],
  },
  {
    id: "5",
    name: "Tornozeleira Dourada",
    slug: "tornozeleira-dourada",
    description: "Tornozeleira delicada com detalhes em flores. Banhada a ouro 18k com acabamento em rosé gold.",
    price: 49.9,
    promotionalPrice: 39.9,
    stock: 25,
    weight: 0.004,
    categoryId: "5",
    category: { id: "5", name: "Tornozeleiras", slug: "tornozeleiras" },
    images: [
      { id: "8", url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=800&fit=crop", isMain: true },
    ],
    relatedProducts: [],
  },
  {
    id: "6",
    name: "Anel Coração",
    slug: "anel-coracao",
    description: "Anel moderno com design de coração. Banhado a ouro rose com detalhe em zirconia.",
    price: 69.9,
    promotionalPrice: null,
    stock: 18,
    weight: 0.005,
    categoryId: "1",
    category: { id: "1", name: "Anéis", slug: "aneis" },
    images: [
      { id: "9", url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop", isMain: true },
    ],
    relatedProducts: [],
  },
  {
    id: "7",
    name: "Brinco Argola Dourada",
    slug: "brinco-argola-dourada",
    description: "Brinco argola clássica em ouro 18k. Tamanho médio perfeito para o dia a dia.",
    price: 89.9,
    promotionalPrice: 69.9,
    stock: 14,
    categoryId: "2",
    category: { id: "2", name: "Brincos", slug: "brincos" },
    images: [
      { id: "10", url: "https://images.unsplash.com/photo-1630019852942-f89202989a51?w=800&h=800&fit=crop", isMain: true },
    ],
    relatedProducts: [],
  },
  {
    id: "8",
    name: "Colar Pingente Lua",
    slug: "colar-pingente-lua",
    description: "Colar delicadíssima com pingente lua crescente. Corrente em ouro 18k.",
    price: 79.9,
    promotionalPrice: null,
    stock: 8,
    categoryId: "3",
    category: { id: "3", name: "Colares", slug: "colares" },
    images: [
      { id: "11", url: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&h=800&fit=crop", isMain: true },
    ],
    relatedProducts: [],
  },
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  const product = mockProducts.find((p) => p.slug === slug);

  if (!product) {
    return NextResponse.json(
      { error: "Produto não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({ product });
}