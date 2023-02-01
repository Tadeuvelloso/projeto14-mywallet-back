import { userSchema } from "../schemas/userSchema.js";
import { usersCollection, sessionsCollection } from "../database/db.js";
import bcrypt from "bcrypt";

export function checkAuthObj(req, res, next) {
    const user = req.body;

    const { error } = userSchema.validate(user, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).send(errors);
    };
    next();
}

export async function checkUserExistInDb(req, res, next) {
    const user = req.body;

    try {
        const userExists = await usersCollection.findOne({ email: user.email })

        if (userExists) {
            return res.status(409).send("Email já existente!");
        }

        next();
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export async function passwordValidation(req, res, next){
    const { email, password } = req.body;

    try{
        const userExists = await usersCollection.findOne({ email });
        
        if (!userExists) {
            return res.sendStatus(401);
        }

        const passwordValidation = bcrypt.compareSync(password, userExists.password);

        if (!passwordValidation) {
            console.log("senha errada!");
            return res.sendStatus(401);
        }
        res.locals.user = userExists;
        next();
    } catch (error) {
        return res.status(500).send(error.message)
    }

}