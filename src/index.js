import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";

const app = express();


// Configs
dotenv.config();
app.use(cors());
app.use(express.json());

// Schemas

// MongoDB
const MongoClient = new MongoClient(process.env.MONGO_URI);

try {
    await MongoClient.connect();
    console.log("Mongo conectado!")
} catch (err) {
    console.log(err)
}
const db = MongoClient.db("myWallet");
const users = db.collection("users");
const movement = db.collection("movement")

//Rotas






app.listen(4000, () => { console.log("Running app in port: 4000!")});