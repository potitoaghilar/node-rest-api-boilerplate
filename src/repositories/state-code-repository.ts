import PrismaProvider from "./core/prisma/prisma-provider";
import StateIpBind from "../models/core/oauth2/stateIpBind";

export default class StateCodeRepository {

    public static async addStateCode(stateIpBind: StateIpBind): Promise<StateIpBind> {
        return StateIpBind.fromJSON<StateIpBind>(
            await PrismaProvider.getInstance().state.create({
                data: {
                    state: stateIpBind.state,
                    ip: stateIpBind.ip
                }
            })
        )
    }

    public static async checkStateCodeValidation(stateIpBind: StateIpBind): Promise<boolean> {
        return await PrismaProvider.getInstance().state.findUnique({
            where: {
                state_ip: { state: stateIpBind.state, ip: stateIpBind.ip }
            }
        }) != null
    }

    public static async removeStateCode(stateIpBind: StateIpBind): Promise<void> {
        await PrismaProvider.getInstance().state.delete({
            where: {
                state_ip: { state: stateIpBind.state, ip: stateIpBind.ip }
            }
        })
    }

}
