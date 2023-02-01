import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import { usersCollection, movementsCollection } from "../database/db.js";

const now = dayjs();
export const date = now.format("DD/MM");


export async function postTransactions (req, res) {
    const moviment = req.body;
    const session = res.locals.session

    try{
        await movementsCollection.insertOne({
            value: moviment.value,
            description: moviment.description,
            type: moviment.type,
            userId: session.userId,
            date
        })
        res.status(201).send("Movimentação criada!");
    } catch (err) {
        res.sendStatus(500);
    }
}

export async function getTransactions (req, res) {
    const session = res.locals.session

    try {
        const user = await usersCollection.findOne({ _id: session.userId });

        if(!user){return res.sendStatus(401)}

        const usersMoviments = await movementsCollection.find({userId: user._id}).toArray();
       
        res.send(usersMoviments);
      } catch (err) {
        res.sendStatus(500);
      }
}

export async function deleteTransactions (req, res) {
    const { id } = req.params;

    try{
        await movementsCollection.deleteOne({_id: ObjectId(id)});
        res.sendStatus(200);
    } catch (err) {
        res.sendStatus(500);
    }
}

export async function putTransactions (req, res) {
    const { id } = req.params;
    const movimentAtt = req.body;
    const session = res.locals.session;

    try{
        const oldMovementation = await movementsCollection.findOne({_id: ObjectId(id)});

        if(!oldMovementation){
            return res.sendStatus(404);
        }
        
        const newObj = {
            value: movimentAtt.value,
            description: movimentAtt.description,
            userId: session.userId,
            type: movimentAtt.type,
            date
        };

        await movementsCollection.updateOne({_id: ObjectId(id)}, {$set: newObj})

        res.sendStatus(200);
    } catch (err) {
        res.sendStatus(500);
    }
}