import PrismaProvider from "./core/providers/prisma-provider";

async function createFirstUser() {
    return PrismaProvider.getClient().user.create({
        data: {
            id: 'foo@bar.com',
            email: 'foo@bar.com',
            firstName: 'foo',
            lastName: 'bar'
        }
    })
}

createFirstUser().then(() => { process.exit() })
