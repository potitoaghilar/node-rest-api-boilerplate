import PrismaProvider from "../prisma/prisma-provider";
import Token from "../../../models/core/oauth2/token";

export default class TokenRepository {

    public static async saveTokenUserBind(userId: string, accessToken: string, refreshToken: string, expirationDate: Date): Promise<Token> {
        return Token.fromJSON(
            await PrismaProvider.getInstance().token.create({
                data: {
                    userId, accessToken, refreshToken, expirationDate: expirationDate
                }
            })
        )
    }

}
