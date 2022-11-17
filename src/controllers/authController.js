import { userSchema, usersCollection, sessionsCollection } from "../index.js";
import bcrypt from "bcrypt"
import { v4 as uuidV4 } from 'uuid';
import { ObjectId } from "mongodb";

export async function signUp (req, res) {
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

}

export async function signIn (req, res) {
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
}

export async function logOut (req, res) {
    const { authorization } = req.headers;

    const token = authorization?.replace('Bearer ', '');

    if(!token) {
        return res.sendStatus(401);
    }

    try{
        await sessionsCollection.deleteOne({token});
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}