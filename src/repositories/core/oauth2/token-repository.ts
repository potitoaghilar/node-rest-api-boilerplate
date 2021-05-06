import PrismaProvider from "../prisma/prisma-provider";
import TokenUserBind from "../../../models/core/oauth2/token-user-bind";

export default class TokenRepository {

    public static async saveTokenUserBind(tokenUserBind: TokenUserBind): Promise<TokenUserBind> {
        return TokenUserBind.fromJSON(
            await PrismaProvider.getInstance().token.create({
                data: {
                    userId: tokenUserBind.user.getUserId(),
                    accessToken: tokenUserBind.accessToken,
                    refreshToken: tokenUserBind.refreshToken,
                    expirationDate: tokenUserBind.expirationDate
                }
            })
        )
    }

}
