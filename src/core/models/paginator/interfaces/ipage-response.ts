
export default interface IPageResponse<T> {
    totalElements: number
    totalPages: number
    currentPage: number
    pageSize: number
    content: T[]
}
