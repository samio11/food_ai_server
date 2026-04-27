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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
const prisma_1 = require("./app/db_connection/prisma");
const seedFoodData_1 = require("./app/seedData/seedFoodData");
let server;
const PORT = config_1.default.PORT || 5000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`Environment: ${config_1.default.NODE_ENV}`);
        // Start server
        server = app_1.default.listen(PORT, () => {
            console.log(`Server running on port:- http://localhost:${config_1.default.PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
});
// Start server
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield startServer();
    yield (0, seedFoodData_1.seedData)();
}))();
process.on("unhandledRejection", (err) => __awaiter(void 0, void 0, void 0, function* () {
    console.error("Unhandled Rejection Detected... server shutting down...", err);
    if (server) {
        server.close(() => __awaiter(void 0, void 0, void 0, function* () {
            yield prisma_1.prisma.$disconnect();
            process.exit(1);
        }));
    }
    else {
        yield prisma_1.prisma.$disconnect();
        process.exit(1);
    }
}));
process.on("uncaughtException", (err) => __awaiter(void 0, void 0, void 0, function* () {
    console.error("Uncaught Exception Detected... server shutting down...", err);
    if (server) {
        server.close(() => __awaiter(void 0, void 0, void 0, function* () {
            yield prisma_1.prisma.$disconnect();
            process.exit(1);
        }));
    }
    else {
        yield prisma_1.prisma.$disconnect();
        process.exit(1);
    }
}));
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("SIGTERM signal received... shutting down gracefully");
    if (server) {
        server.close(() => __awaiter(void 0, void 0, void 0, function* () {
            yield prisma_1.prisma.$disconnect();
            process.exit(0);
        }));
    }
}));
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("SIGINT signal received... shutting down gracefully");
    if (server) {
        server.close(() => __awaiter(void 0, void 0, void 0, function* () {
            yield prisma_1.prisma.$disconnect();
            process.exit(0);
        }));
    }
}));
