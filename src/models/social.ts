import {BaseModel} from "./core/shared/base-model"
import {string} from "joiful"

export default class Social extends BaseModel {

    @string().optional()
    facebook?: string

    @string().optional()
    twitter?: string

    @string().optional()
    github?: string

    @string().optional()
    website?: string

    concatSocials() {
        return `Facebook: ${this.facebook} | Twitter: ${this.twitter} | GitHub: ${this.github} | Website: ${this.website}`
    }

}
