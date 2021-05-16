import PrismaProvider from "../../providers/prisma-provider";
import StateIpBind from "../../models/oauth2/stateIpBind";

export default class StateCodeRepository {

    public static async addStateCode(stateIpBind: StateIpBind): Promise<StateIpBind> {
        return StateIpBind.fromJSON<StateIpBind>(
            await PrismaProvider.getClient().stateIpBind.create({
                data: {
                    state: stateIpBind.state,
                    ip: stateIpBind.ip
                }
            })
        ) as StateIpBind
    }

    public static async checkStateCodeValidation(stateIpBind: StateIpBind): Promise<boolean> {
        return await PrismaProvider.getClient().stateIpBind.findUnique({
            where: {
                state_ip: { state: stateIpBind.state, ip: stateIpBind.ip }
            }
        }) != null
    }

    public static async removeStateCode(stateIpBind: StateIpBind): Promise<void> {
        await PrismaProvider.getClient().stateIpBind.delete({
            where: {
                state_ip: { state: stateIpBind.state, ip: stateIpBind.ip }
            }
        })
    }

}
