import express from "express";
import cors from "cors";
import trasactionroutes from "./routes/transaction.routes.js";
import authroutes from "./routes/auth.routes.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(trasactionroutes);
app.use(authroutes);

const port = process.env.PORT || 5000;

app.listen(port, () => { console.log(`Running app in port: ${port}!`) });