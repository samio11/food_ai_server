"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetFoods = exports.handleAIChat = void 0;
const FoodService = __importStar(require("./food.service"));
const config_1 = __importDefault(require("../../config"));
const handleAIChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message } = req.body;
        if (!message)
            return res.status(400).json({ success: false, error: "Message is required" });
        const result = yield FoodService.chatWithAI(message.trim());
        if (!result) {
            return res.status(200).json({
                success: true,
                answer: "I can only answer questions about our food menu. Try asking 'What pizzas do you have?'",
            });
        }
        res.status(200).json({
            success: true,
            sql: result.sql,
            count: result.rows.length,
            data: result.rows,
            answer: result.answer,
        });
    }
    catch (err) {
        console.error("Chat Error:", err.message);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            detail: config_1.default.NODE_ENV === "development" ? err.message : undefined,
        });
    }
});
exports.handleAIChat = handleAIChat;
const handleGetFoods = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const foods = yield FoodService.getFoods(req.query);
        res.status(200).json({ success: true, count: foods.length, data: foods });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.handleGetFoods = handleGetFoods;
