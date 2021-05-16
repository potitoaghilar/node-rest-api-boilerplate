import {PrismaClient} from "@prisma/client"
import Utils from "../../helpers/utils"

let instance: PrismaProvider

export default class PrismaProvider {

    private client: PrismaClient

    constructor() {
        this.client = new PrismaClient({
            log: Utils.isDev() ? ['error', 'warn', 'query'] : []
        })
    }

    static init() {
        instance = new PrismaProvider()
    }

    static getInstance(): PrismaProvider {
        if (!instance) {
            instance = new PrismaProvider()
        }
        return instance
    }

    static getClient(): PrismaClient {
        return this.getInstance().client
    }
}
