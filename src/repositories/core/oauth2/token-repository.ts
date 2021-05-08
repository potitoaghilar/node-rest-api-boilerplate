import PrismaProvider from "../prisma/prisma-provider";
import TokenUserBind from "../../../models/core/oauth2/token-user-bind";
import ClientOAuth2 from "client-oauth2";
import {add} from "date-fns";

export default class TokenRepository {

    // Same value of `TTL_REFRESH_TOKEN` in hydra server
    static refreshTokenExpiration = 720

    public static async saveTokenUserBind(userId: string, oauthToken: ClientOAuth2.Token): Promise<TokenUserBind> {
        return TokenUserBind.fromJSON(
            await PrismaProvider.getClient().token.create({
                data: {
                    userId,
                    accessToken: oauthToken.accessToken,
                    refreshToken: oauthToken.refreshToken,
                    accessTokenExpirationDate: add(new Date(), { seconds: parseInt(oauthToken.data.expires_in) }),
                    refreshTokenExpirationDate: add(new Date(), { hours: this.refreshTokenExpiration }),
                    rawData: oauthToken.data
                }
            })
        ) as TokenUserBind
    }

    public static async getTokenUserBind(userId: string, accessToken: string): Promise<TokenUserBind | null> {
        return TokenUserBind.fromJSON<TokenUserBind>(
            await PrismaProvider.getClient().token.findFirst({
                where: {
                    userId,
                    accessToken
                }
            })
        )
    }

    public static async updateTokenUserBind(userId: string, previousOAuthToken: ClientOAuth2.Token, newOAuthToken: ClientOAuth2.Token): Promise<void> {
        PrismaProvider.getClient().token.update({
            where: { accessToken: previousOAuthToken.accessToken, refreshToken: previousOAuthToken.refreshToken },
            data: {
                userId,
                accessToken: newOAuthToken.accessToken,
                refreshToken: newOAuthToken.refreshToken,
                accessTokenExpirationDate: add(new Date(), { seconds: parseInt(newOAuthToken.data.expires_in) }),
                refreshTokenExpirationDate: add(new Date(), { hours: this.refreshTokenExpiration }),
                rawData: newOAuthToken.data
            }
        })
    }

    public static async removeTokenUserBind(oAuthToken: ClientOAuth2.Token): Promise<void> {
        await PrismaProvider.getClient().token.delete({
            where: { accessToken: oAuthToken.accessToken, refreshToken: oAuthToken.refreshToken }
        })
    }

}
