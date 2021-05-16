import {BaseModel} from "../shared/base-model"
import boom from '@hapi/boom'
import IPageResponse from "./interfaces/ipage-response";
import PageRequest from "./page-request";

export default class Paginator<T> {

    static DEFAULT_PAGE_SIZE = 25

    model: typeof BaseModel

    // TODO define type for field `prismaModelDelegate`
    prismaModelDelegate: any

    totalElements: number

    totalPages: number

    currentPage: number

    pageSize: number

    content: T[]

    constructor(model: typeof BaseModel, prismaModelDelegate: any, pageRequest?: PageRequest) {
        this.model = model
        this.prismaModelDelegate = prismaModelDelegate
        this.totalElements = 0
        this.totalPages = 1
        this.currentPage = pageRequest?.pageIndex || 0
        this.pageSize = pageRequest?.pageSize || Paginator.DEFAULT_PAGE_SIZE
        this.content = []
    }

    async getPage(extraQueryParams?: object): Promise<IPageResponse<T>> {
        await this.fetchElements(extraQueryParams)

        // Out of pages exception
        if (this.currentPage > this.totalPages - 1) {
            throw boom.badRequest('Current page is greater than total pages')
        }

        return {
            content: this.content,
            pageSize: this.pageSize,
            currentPage: this.currentPage,
            totalElements: this.totalElements,
            totalPages: this.totalPages,
        } as IPageResponse<T>
    }

    private async fetchElements(extraQueryParams?: object): Promise<void> {

        // Count total elements
        this.totalElements = await this.getTotalElements()

        // Get totale pages
        this.totalPages = await this.getTotalPages()

        // Fetch elements for current page
        this.content = (await this.prismaModelDelegate.findMany({
            take: this.pageSize,
            skip: this.pageSize * this.currentPage,
            ...extraQueryParams
        })).map((data: object) => this.model.fromJSON<T>(data))

    }

    private async getTotalElements(): Promise<number> {
        return await this.prismaModelDelegate.count()
    }

    private async getTotalPages(): Promise<number> {
        return Math.ceil(await this.getTotalElements() / this.pageSize)
    }

}
