import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import dayjs from "dayjs";
import { signIn, signUp, logOut } from "./controllers/authController.js";
import { deleteTransactions, getTransactions, postTransactions, putTransactions } from "./controllers/transactionController.js";

// Configs
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const now = dayjs();
export const date = now.format("DD/MM");

// Schemas
export const transactionSchema = joi.object({
    value: joi.number().min(1).required(),
    description: joi.string().min(3).required(),
    type: joi.string().valid("positive", "negative").required()
});

export const userSchema = joi.object({
    name: joi.string().min(3).max(100).required(),
    email: joi.string().email().required(),
    password: joi.string().required()
});


// MongoDB
const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
    await mongoClient.connect();
    console.log("Mongo conectado!")
    
} catch (err) {
    console.log(err)
}

const db = mongoClient.db("myWallet");
export const usersCollection = db.collection("users");
export const movementsCollection = db.collection("movement")
export const sessionsCollection = db.collection("sessions")

//Routes

app.post("/sign-up", signUp)

app.post("/sign-in", signIn);

app.post("/logout", logOut)

app.get("/transactions", getTransactions);

app.post("/transactions", postTransactions);

app.delete("/transactions/:id", deleteTransactions);

app.put("/transactions/:id", putTransactions);

const port = process.env.PORT || 5000;

app.listen(port, () => { console.log(`Running app in port: ${port}!`) });