import {BaseModel} from "../shared/base-model";
import {boolean, date, string} from "joiful";

// Sample class - edit based on your authorization server configuration
export default class Profile extends BaseModel {

    @string().required()
    sub!: string

    @string().required()
    nickname!: string

    @string().required()
    name!: string

    @string().required()
    picture!: string

    @date().required()
    updated_at!: Date

    @string().email().required()
    email!: string

    @boolean().required()
    email_verified!: boolean

    getUserId(): string {
        return Profile.getUserId(this)
    }

    static getUserId(profile: Profile) {
        return profile.sub
    }

}
