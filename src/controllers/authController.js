import { usersCollection, sessionsCollection } from "../database/db.js";
import bcrypt from "bcrypt"
import { v4 as uuidV4 } from 'uuid';


export async function signUp (req, res) {
    const user = req.body;

    try {
        const hashPassword = bcrypt.hashSync(user.password, 10);

        await usersCollection.insertOne({ ...user, password: hashPassword });
        res.sendStatus(201);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }

}

export async function signIn (req, res) {
    const user = res.locals.user;

    const token = uuidV4();
    
    try {
        const userSession = await sessionsCollection.findOne({ userId: user._id })

        const objUser = { name: user.name, token }

        if(userSession){
            return res.send(objUser);
        }

        await sessionsCollection.insertOne({ userId: user._id, token });
    
        res.status(200).send(objUser);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}

export async function logOut (req, res) {
    const { authorization } = req.headers;

    const token = authorization?.replace('Bearer ', '');

    if(!token) {return res.sendStatus(401)}

    try{
        await sessionsCollection.deleteOne({token});
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}