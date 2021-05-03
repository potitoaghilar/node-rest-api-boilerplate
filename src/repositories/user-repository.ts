import User from "../models/user";
import boom from '@hapi/boom';
import {PrismaClient} from "@prisma/client";

export default class UserRepository {

    public static async getUsers(prisma: PrismaClient): Promise<User[]> {
        return (await prisma.user.findMany()).map(user => User.parseJSON<User>(user))
    }

    public static async getUser(prisma: PrismaClient, id: number): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        return user ? User.parseJSON(user) : null;
    }

    public static async createUser(prisma: PrismaClient, user: User): Promise<User> {
        return User.parseJSON<User>(
            await prisma.user.create({
                data: user,
            })
        )
    }

    public static async getUserByEmail(prisma: PrismaClient, email: string): Promise<User | null> {
        const user = prisma.user.findUnique({
            where: { email }
        })
        return user ? User.parseJSON(user) : null;
    }

    public static async deleteUser(prisma: PrismaClient, id: number): Promise<void> {
        await prisma.user.delete({
            where: { id }
        })
    }

    public static async updateUser(prisma: PrismaClient, id: number, user: User): Promise<User> {
        return User.parseJSON<User>(
            await prisma.user.update({
                where: { id },
                data: user
            })
        )
    }

    public static async patchUser(prisma: PrismaClient, id: number, user: Partial<User>): Promise<User> {
        return User.parseJSON<User>(
            await prisma.user.update({
                where: { id },
                data: user
            })
        )
    }

}
