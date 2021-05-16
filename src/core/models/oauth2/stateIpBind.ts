import {BaseModel} from "../shared/base-model";
import {string} from "joiful";

export default class StateIpBind extends BaseModel {

    @string().required()
    state!: string

    @string().ip().required()
    ip!: string

}
