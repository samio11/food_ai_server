import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { rootRoute } from './app/routes';
const app: Application = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Welcome to Food Delivery API", upTime: process.uptime() });
})
app.use("/api/v1", rootRoute);

export default app;