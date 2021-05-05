import PrismaProvider from "./core/prisma/prisma-provider";
import State from "../models/core/oauth2/state";

export default class StateCodeRepository {

    public static async addStateCode(state: string, ip: string): Promise<State> {
        return State.parseJSON<State>(
            await PrismaProvider.getInstance().state.create({
                data: {
                    state,
                    ip
                }
            })
        )
    }

    public static async checkStateCodeValidation(state: string, ip: string): Promise<boolean> {
        return await PrismaProvider.getInstance().state.findUnique({
            where: {
                state_ip: { state, ip }
            }
        }) != null
    }

    public static async removeStateCode(state: string, ip: string): Promise<void> {
        await PrismaProvider.getInstance().state.delete({
            where: {
                state_ip: { state, ip }
            }
        })
    }

}
