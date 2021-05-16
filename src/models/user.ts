import Social from "./social"
import {object, string} from "joiful"
import {BaseModel, model} from "../core/models/shared/base-model"

export default class User extends BaseModel {

    @string().required()
    firstName!: string

    @string().required()
    lastName!: string

    @string().email().required()
    email!: string

    @model(Social)
    @object({ objectClass: Social }).optional()
    social?: Social

}

