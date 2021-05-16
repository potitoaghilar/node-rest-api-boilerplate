import {BaseModel} from "../shared/base-model";
import {string} from "joiful";

export default class AuthorizationRequest extends BaseModel {

    @string().required()
    state!: string

    @string().required()
    code!: string

    @string().required()
    scope!: string

}
