import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from "bcrypt"
import { v4 as uuidV4 } from 'uuid';


// Configs
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
let db;
let usersCollection;
let movementsCollection;
let sessionsCollection;

// Schemas
const transactionSchema = joi.object({
    value: joi.number().min(1).required(),
    description: joi.string().min(3).required(),
    type: joi.string().valid("positive", "negative").required()
});

const userSchema = joi.object({
    name: joi.string().min(3).max(100).required(),
    email: joi.string().email().required(),
    password: joi.string().required()
});


// MongoDB
const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
    await mongoClient.connect();
    console.log("Mongo conectado!")
    db = mongoClient.db("myWallet");
    usersCollection = db.collection("users");
    movementsCollection = db.collection("movement")
    sessionsCollection = db.collection("sessions")
} catch (err) {
    console.log(err)
}



//Routes

app.post("/sign-up", async (req, res) => {
    const user = req.body;
    console.log("passei!")
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
    const { email, password } = req.body;

    const token = uuidV4();
    
    try {
        const userExists = await usersCollection.findOne({ email });
        if (!userExists) {
            return res.sendStatus(401);
        }

        const passwordValidation = bcrypt.compareSync(password, userExists.password);

        if (!passwordValidation) {
            console.log("senha errada!");
            return res.sendStatus(401);
        }

        const userSession = await sessionsCollection.findOne({ userId: userExists._id })

        if(userSession){
            return res.status(401).send("Você já esta logado!, saia para entrar novamente!")
        }

        await sessionsCollection.insertOne({ userId: userExists._id, token })

        res.send(token)
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.get("/transactions", async (req, res) => {
    const { authorization } = req.headers;

    const token = authorization?.replace('Bearer ', '');

    if(!token) {
        return res.sendStatus(401);
    }

    try {
        const session = await sessionsCollection.findOne({ token });
       
        const user = await usersCollection.findOne({ _id: session?.userId });

        delete user.password;
        
        const userMoviments = movementsCollection.find();

        res.send(userMoviments, user);
      } catch (err) {
        console.log(err);
        res.sendStatus(500);
      }
});



// app.post("/transactions", async (req, res) => {

// });

// app.put("/transactions", async (req, res) => {

// });

// app.delete("/transactions", async (req, res) => {

// });



app.listen(4000, () => { console.log("Running app in port: 4000!") });