import Joi from "joi";

const idValidatorObject = Joi.object({
    id: Joi.string().pattern(/^[0-9]+$/),
})

export {
    idValidatorObject
};
