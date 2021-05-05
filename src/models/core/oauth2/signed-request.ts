
export default class SignedRequest {
    method!: string
    url!: string
    headers?: { [key: string]: string | string[]; }
}
