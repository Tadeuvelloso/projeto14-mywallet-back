import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from "bcrypt"

// Configs
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

// Schemas
const transactionSchema = joi.object({
    value: joi.number().min(1).required(),
    description: joi.string().min(3).required(),
    type: joi.string().valid("positive", "negative").required()
});

const userSchema = joi.object({
    name: joi.string().min(3).max(100).required(),
    email: joi.email().required(),
    password: joi.string().required()
});


// MongoDB
const MongoClient = new MongoClient(process.env.MONGO_URI);

try {
    await MongoClient.connect();
    console.log("Mongo conectado!")
} catch (err) {
    console.log(err)
}
const db = MongoClient.db("myWallet");
const usersCollection = db.collection("users");
const movementsCollection = db.collection("movement")

//Routes

app.post("/sign-up", async (req, res) => {
    const user = req.body;

    try {
        const userExists = await usersCollection.findOne({ email: user.email })

        if (userExists) {
            return res.status(409).send("Email já existente!");
        }

        const { error } = userSchema.validate(user, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).send(errors);
        }

        const hashPassword = bcrypt.hashSync(user.password, 10);


        await usersCollection.insertOne({ ...user, password: hashPassword });
        res.sendStatus(201);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }

})

app.post("/sign-in", async (req, res) => {
    const {email, password} = req.body;

    try {
        const userExists = await usersCollection.findOne({ email });
        if(!userExists){
            return res.sendStatus(401);
        }

        const passwordValidation = bcrypt.compareSync(password, userExists.password);

        if(!passwordValidation){
            return res.sendStatus(401);
        }
        

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.get("/transactions", async (req, res) => {

});

app.post("/transactions", async (req, res) => {

});

// app.put("/transactions", async (req, res) => {

// });

// app.delete("/transactions", async (req, res) => {

// });



app.listen(4000, () => { console.log("Running app in port: 4000!") });