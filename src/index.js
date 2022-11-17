import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from "bcrypt"
import { v4 as uuidV4 } from 'uuid';
import dayjs from "dayjs";

// Configs
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
let db;
let usersCollection;
let movementsCollection;
let sessionsCollection;
const now = dayjs();
const date = now.format("DD/MM");

// Schemas
const transactionSchema = joi.object({
    value: joi.string().min(1).required(),
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

        await sessionsCollection.insertOne({ userId: userExists._id, token });
        const userData = await usersCollection.findOne({_id: ObjectId(userExists._id)})

        const objUser = { name: userData.name, token }

        res.status(200).send(objUser);
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
        
        if(!session){
            return res.status(401).send("Token invalido!");
        }
        
        const user = await usersCollection.findOne({ _id: session.userId });

        if(!user){
            console.log("não achei")
            return res.sendStatus(401);
        }
        
        const usersMoviments = await movementsCollection.find({userId: user._id}).toArray();
       
        res.send(usersMoviments);
        
      } catch (err) {
        console.log(err);
        res.sendStatus(500);
      }
});


app.post("/transactions", async (req, res) => {
    const { authorization } = req.headers;
    const moviment = req.body;

    const token = authorization?.replace('Bearer ', '');

    if(!token) {
        return res.sendStatus(401);
    }

    const { error } = transactionSchema.validate(moviment, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).send(errors);
    };

    try{
        console.log("passei aqui!")
        const session = await sessionsCollection.findOne({ token });
        console.log(session)
    
        if(!session){
            return res.sendStatus(401);
        }
     
        await movementsCollection.insertOne({
            value: moviment.value,
            description: moviment.description,
            type: moviment.type,
            userId: session.userId,
            date
        })
        res.status(201).send("Movimentação criada!");
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
});


// app.put("/transactions", async (req, res) => {
//     const { authorization } = req.headers;
//     const newMoviment = req.body;

//     const token = authorization?.replace('Bearer ', '');

//     if(!token) {
//         return res.sendStatus(401);
//     }

//     const { error } = userSchema.validate(newMoviment, { abortEarly: false });

//     if (error) {
//         const errors = error.details.map(detail => detail.message);
//         return res.status(400).send(errors);
//     };

// });

// app.delete("/transactions", async (req, res) => {

// });



app.listen(4000, () => { console.log("Running app in port: 4000!") });