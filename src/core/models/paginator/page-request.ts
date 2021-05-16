import {BaseModel} from "../shared/base-model";
import {number} from "joiful";

export default class PageRequest extends BaseModel {

    @number().optional().min(0)
    pageIndex?: number

    @number().optional().min(1)
    pageSize?: number
}
