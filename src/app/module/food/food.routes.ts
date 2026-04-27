import { Router } from "express";
import * as FoodController from "./food.controller";

const router = Router();

router.post("/chat", FoodController.handleAIChat);
router.get("/food", FoodController.handleGetFoods);

export const foodRoutes = router;
