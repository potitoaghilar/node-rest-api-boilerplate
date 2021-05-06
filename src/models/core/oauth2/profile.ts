import {BaseModel} from "../shared/base-model";
import {boolean, date, string} from "joiful";

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

    getAuthProvider(): string {
        return Profile.getAuthProvider(this)
    }

    getUserId(): string {
        return Profile.getUserId(this)
    }

    static getAuthProvider(profile: Profile) {
        return profile.sub.split('|')[0]
    }

    static getUserId(profile: Profile) {
        return profile.sub.split('|')[1]
    }

}
