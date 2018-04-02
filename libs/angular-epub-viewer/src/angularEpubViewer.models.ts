export interface EpubChapter {
    cfi: string,
    href: string,
    label: string,
    spinePos: number,
    subitems: any[]
}
export interface EpubPage {
    cfi: string,
    page: number
}
export enum EpubError {
    OPEN_FILE,
    PAGINATION
}