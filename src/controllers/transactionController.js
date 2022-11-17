import { date } from "../index.js";
import { ObjectId } from "mongodb";
import { transactionSchema, usersCollection, sessionsCollection, movementsCollection } from "../index.js";


export async function postTransactions (req, res) {
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
}

export async function getTransactions (req, res) {
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
}

export async function deleteTransactions (req, res) {
    const { id } = req.params;
    const { authorization } = req.headers;

    const token = authorization?.replace('Bearer ', '');

    if(!token) {
        return res.sendStatus(401);
    }

    try{
        await movementsCollection.deleteOne({_id: ObjectId(id)});
        console.log("excluido!");
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}

export async function putTransactions (req, res) {
    const { authorization } = req.headers;
    const { id } = req.params;
    const movimentAtt = req.body;

    const token = authorization?.replace('Bearer ', '');

    if(!token) {
        return res.sendStatus(401);
    }

    const { error } = transactionSchema.validate(movimentAtt, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).send(errors);
    };

    try{
        const session = await sessionsCollection.findOne({token});

        if(!session){
            return res.sendStatus(401);
        }
        
        const oldMovementation = await movementsCollection.findOne({_id: ObjectId(id)});

        if(!oldMovementation){
            return res.sendStatus(404);
        }
        
        const newObj = {
            value: movimentAtt.value,
            description: movimentAtt.description,
            userId: session.userId,
            date
        };

        await movementsCollection.updateOne({_id: ObjectId(id)}, {$set: newObj})

        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }

}