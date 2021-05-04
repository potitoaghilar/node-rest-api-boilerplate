
export default class Utils {

    public static isProduction(): boolean {
        return process.env.NODE_ENV === 'production'
    }

    public static isDev(): boolean {
        return !this.isProduction()
    }

}
