import {Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {AngularEpubViewerComponent} from "../../libs/angular-epub-viewer/src/angularEpubViewer.component";
import {
    EpubChapter,
    EpubError,
    EpubLocation,
    EpubMetadata,
    EpubPage,
    EpubSearchResult
} from "../../libs/angular-epub-viewer/src/angularEpubViewer.models";
import {environment} from "../environments/environment";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

    @ViewChild('epubViewer')
    epubViewer: AngularEpubViewerComponent;
    @ViewChild('picker', {read: ElementRef})
    picker: ElementRef;
    @ViewChild('metadata', {read: ElementRef})
    metadata: ElementRef;

    unzippedBooks: Book[] = [].concat(UNZIPPED_BOOKS);
    zippedBooks: Book[] = [].concat(ZIPPED_BOOKS);
    chosenDocument: Book = UNZIPPED_BOOKS[0];

    totalPages: number = 0;
    currentPage: number = 0;

    chapters: EpubChapter[] = [];
    chosenChapter: EpubChapter = null;

    searchText: string = null;
    matchesCount: number = 0;

    fontSizes: string[] = [].concat(FONT_SIZES);
    chosenFontSize: string = this.fontSizes[2];

    paddings: string[] = [].concat(PADDINGS);
    chosenPadding: string = this.paddings[2];

    lockDocumentChoose: boolean = true;
    lockSearch: boolean = true;
    lockPagination: boolean = true;
    lockTOC: boolean = true;

    ngOnInit() {
        this.onSelectedBook();
    }

    onBookUnloaded() {
        this.lockDocumentChoose = true;
        this.lockSearch = true;
        this.lockPagination = true;
        this.lockTOC = true;
        this.currentPage = 0;
        this.totalPages = 0;
        this.chapters = [];
        this.chosenChapter = null;
        this.metadata.nativeElement.innerHTML = '';
    }

    onSelectedBook() {
        this.onBookUnloaded();
        // removing picked file
        this.picker.nativeElement.value = null;
        // path will be translated to link
        this.epubViewer.openLink(this.chosenDocument.path);
    }

    openFile(event) {
        this.onBookUnloaded();
        // removing selected book
        this.chosenDocument = null;
        this.epubViewer.openFile(event.target.files[0]);
    }

    onDocumentReady() {
        console.log('event:onDocumentReady');
        this.lockDocumentChoose = false;
        this.epubViewer.setStyle('font-size', this.chosenFontSize);
    }

    onChapterUnloaded() {
        console.log('event:onChapterUnloaded');
        this.lockSearch = true;
        this.lockPagination = true;
    }

    onChapterDisplayed(chapter: EpubChapter) {
        console.log('event:onChapterDisplayed');
        this.lockSearch = false;
        this.lockPagination = false;
        this.onSearchPrinted();
    }

    onLocationFound(location: EpubLocation) {
        console.log('event:onLocationFound');
        if (location.page) {
            this.currentPage = location.page;
        }
    }

    onPaginationComputed(pages: EpubPage[]) {
        console.log('event:onPaginationComputed');
        this.lockPagination = false;
        this.totalPages = pages.length;
    }

    onTOCLoaded(chapters: EpubChapter[]) {
        console.log('event:onTOCLoaded');
        this.chapters = [].concat(chapters);
        if (this.chapters.length > 0) {
            this.chosenChapter = this.chapters[0];
        }
        this.lockTOC = false;
    }

    onChapter() {
        if (this.epubViewer.documentReady) {
            this.epubViewer.goTo(this.chosenChapter.cfi);
        }
    }

    onSearchPrinted() {
        if (this.epubViewer.documentReady && this.epubViewer.chapterDisplayed &&
            this.searchText && this.searchText.trim().length > 0) {
            this.lockSearch = true;
            this.epubViewer.searchText(this.searchText);
        }
    }

    onSearchFinished(results: EpubSearchResult[]) {
        console.log('event:onSearchFinished');
        this.lockSearch = false;
        this.matchesCount = results.length;
    }

    onPaddingChosen() {
        this.epubViewer.padding = this.chosenPadding;
    }

    onFontSizeChosen() {
        if (this.epubViewer.documentReady) {
            this.epubViewer.setStyle('font-size', this.chosenFontSize);
        }
    }

    onMetadataLoaded(metadata: EpubMetadata) {
        console.log('event:onMetadataLoaded');
        this.metadata.nativeElement.innerHTML = JSON.stringify(metadata, null, 2)
            .replace(/\n/g, '<br>')
            .replace(/ /g, '&nbsp;');
    }

    onErrorOccurred(error: EpubError) {
        console.log('event:onErrorOccurred');
        switch (error) {
            case EpubError.OPEN_FILE:
                this.lockDocumentChoose = false;
                this.lockSearch = false;
                this.lockPagination = false;
                this.lockTOC = false;
                alert('Error while opening file');
                break;
            case EpubError.READ_FILE:
                this.lockDocumentChoose = false;
                this.lockSearch = false;
                this.lockPagination = false;
                this.lockTOC = false;
                alert('Error while reading file');
                break;
            case EpubError.DOCUMENT_READY:
                alert('Error while accessing unloaded document');
                break;
            case EpubError.CHAPTER_DISPLAYED:
                alert('Error while accessing not displayed chapter');
                break;
            case EpubError.SEARCH:
                this.lockSearch = false;
                alert('Error while searching text');
                break;
            case EpubError.COMPUTE_PAGINATION:
                this.lockPagination = false;
                alert('Error while calculating pagination');
                break;
            case EpubError.LOAD_METADATA:
                alert('Error while loading metadata');
                break;
            case EpubError.LOAD_TOC:
                this.lockTOC = false;
                alert('Error while loading table of contents');
                break;
        }
    }

    getGithubIcon(): string {
        return `${environment.production ? '' : '../'}assets/GitHub-Mark-Light-120px-plus.png`
    }
}

interface Book {
    path: string,
    name: string,
    unzipped: boolean
}

const UNZIPPED_BOOKS: Book[] = [{
    path: 'assets/books/alice/',
    name: 'Alice',
    unzipped: true
}, {
    path: 'assets/books/demo-book-gh-pages/',
    name: 'Demo book',
    unzipped: true
}, {
    path: 'assets/books/mathjax_tests/',
    name: 'MathJax',
    unzipped: true
}, {
    path: 'assets/books/moby-dick/',
    name: 'Moby Dick',
    unzipped: true
}];

const ZIPPED_BOOKS: Book[] = [{
    path: 'assets/books/georgia-cfi-20120521.epub',
    name: 'Georgia',
    unzipped: false
}, {
    path: 'assets/books/mathjax_tests.epub',
    name: 'MathJax',
    unzipped: false
}, {
    path: 'assets/books/moby-dick.epub',
    name: 'Moby Dick',
    unzipped: false
}];

const PADDINGS: string[] = [
    '0',
    '8px',
    '16px',
    '24px',
    '32px',
    '40px',
    '48px'
];

const FONT_SIZES: string[] = [
    '8px',
    '12px',
    '16px',
    '20px',
    '24px',
    '28px',
    '32px'
];