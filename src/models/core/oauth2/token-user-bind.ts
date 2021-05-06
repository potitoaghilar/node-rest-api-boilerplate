import {BaseModel, model} from "../shared/base-model";
import Profile from "./profile";
import {date, object, string} from "joiful";

export default class TokenUserBind extends BaseModel {

    @model(Profile)
    @object().required()
    user!: Profile

    @string().required()
    accessToken!: string

    @string().required()
    refreshToken!: string

    @date().required()
    expirationDate!: Date

}
