import { prisma } from "../../db_connection/prisma";
import { generateAnswer, generateSQL } from "../../ai/Geminiservice";

export const chatWithAI = async (userMessage: string) => {
  // 1. Convert Natural Language to SQL
  const { sql, isValid } = await generateSQL(userMessage);

  if (!isValid) return null;

  // 2. Execute SQL
  const rows = await prisma.$queryRawUnsafe<any[]>(sql);

  // 3. Generate Human Answer
  const answer = await generateAnswer(userMessage, sql, rows);

  return { sql, rows, answer };
};

export const getFoods = async (filters: any) => {
  const { search, category, is_available, limit = 20 } = filters;

  return await prisma.food.findMany({
    where: {
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(category && { category: { contains: category, mode: "insensitive" } }),
      ...(is_available && { is_available }),
    },
    orderBy: { rating: "desc" },
    take: Number(limit),
  });
};
