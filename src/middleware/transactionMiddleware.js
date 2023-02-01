import { transactionSchema } from "../schemas/transitionSchema.js";
import { sessionsCollection } from "../database/db.js"

export function checkObjTransaction(req, res, next) {
    const moviment = req.body;

    const { error } = transactionSchema.validate(moviment, { abortEarly: false });

    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).send(errors);
    };
    next();
}

export async function checkSession(req, res, next) {
    const { authorization } = req.headers;

    const token = authorization?.replace('Bearer ', '');

    if (!token) {
        return res.sendStatus(401);
    }

    try {
        const session = await sessionsCollection.findOne({ token });

        if (!session) {
            return res.sendStatus(401);
        }
        res.locals.session = session;
        next();
    } catch (error) {
        return res.status(500).send(error.message)
    }
}