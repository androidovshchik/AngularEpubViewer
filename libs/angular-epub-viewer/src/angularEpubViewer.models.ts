export interface EpubLocation {

}

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

export interface EpubSearchResult {
    cfi: string,
    excerpt: string
}

export interface EpubMetadata {
    bookTitle: string,
    creator: string,
    description: string,
    direction: any,
    identifier: string,
    language: string,
    layout: string,
    modified_date: string,
    orientation: string,
    pubdate: string,
    publisher: string,
    rights: string,
    spread: string
}

export enum EpubError {
    OPEN_FILE,
    PAGINATION,
    METADATA,
    TOC
}