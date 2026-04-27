import { Request, Response } from "express";
import * as FoodService from "./food.service";
import config from "../../config";

export const handleAIChat = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, error: "Message is required" });

    const result = await FoodService.chatWithAI(message.trim());

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
  } catch (err: any) {
    console.error("Chat Error:", err.message);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      detail: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const handleGetFoods = async (req: Request, res: Response) => {
  try {
    const foods = await FoodService.getFoods(req.query);
    res.status(200).json({ success: true, count: foods.length, data: foods });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
