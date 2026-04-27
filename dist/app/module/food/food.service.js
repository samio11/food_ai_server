"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFoods = exports.chatWithAI = void 0;
const prisma_1 = require("../../db_connection/prisma");
const Geminiservice_1 = require("../../ai/Geminiservice");
const chatWithAI = (userMessage) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Convert Natural Language to SQL
    const { sql, isValid } = yield (0, Geminiservice_1.generateSQL)(userMessage);
    if (!isValid)
        return null;
    // 2. Execute SQL
    const rows = yield prisma_1.prisma.$queryRawUnsafe(sql);
    // 3. Generate Human Answer
    const answer = yield (0, Geminiservice_1.generateAnswer)(userMessage, sql, rows);
    return { sql, rows, answer };
});
exports.chatWithAI = chatWithAI;
const getFoods = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, category, is_available, limit = 20 } = filters;
    return yield prisma_1.prisma.food.findMany({
        where: Object.assign(Object.assign(Object.assign({}, (search && { name: { contains: search, mode: "insensitive" } })), (category && { category: { contains: category, mode: "insensitive" } })), (is_available && { is_available })),
        orderBy: { rating: "desc" },
        take: Number(limit),
    });
});
exports.getFoods = getFoods;
