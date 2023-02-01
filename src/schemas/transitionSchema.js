import joi from "joi";

export const transactionSchema = joi.object({
    value: joi.number().min(1).required(),
    description: joi.string().min(3).required(),
    type: joi.string().valid("positive", "negative").required()
});