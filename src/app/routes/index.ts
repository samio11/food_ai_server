import { Router } from "express";
import { foodRoutes } from "../module/food/food.routes";


export const rootRoute = Router()

const modelRoutes = [
    { path: "/ai", element: foodRoutes },
]

modelRoutes.forEach((route) => {
    rootRoute.use(route.path, route.element)
})