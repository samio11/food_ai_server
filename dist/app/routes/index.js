"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootRoute = void 0;
const express_1 = require("express");
const food_routes_1 = require("../module/food/food.routes");
exports.rootRoute = (0, express_1.Router)();
const modelRoutes = [
    { path: "/ai", element: food_routes_1.foodRoutes },
];
modelRoutes.forEach((route) => {
    exports.rootRoute.use(route.path, route.element);
});
