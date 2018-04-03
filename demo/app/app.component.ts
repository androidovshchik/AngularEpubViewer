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
    chosenBook: Book = UNZIPPED_BOOKS[0];

    chapters: EpubChapter[] = [];
    chosenChapter: EpubChapter = null;

    fontSizes: string[] = [].concat(FONT_SIZES);
    fontSize: string = this.fontSizes[2];

    paddings: string[] = [].concat(PADDINGS);
    padding: string = this.paddings[2];

    lockAllGui: boolean = true;

    ngOnInit() {
        // not in constructor because epubViewer wasn't initialized then
        this.onSelectedBook();
    }

    onSelectedBook() {
        this.lockAllGui = true;
        // removing picked file
        this.picker.nativeElement.value = null;
        // path will be translated to link
        this.epubViewer.openLink(this.chosenBook.path);
    }

    openFile(event) {
        this.lockAllGui = true;
        // removing selected book
        this.chosenBook = null;
        this.epubViewer.openFile(event.target.files[0]);
    }

    onDocumentReady() {
        console.log('event:onDocumentReady');
        this.epubViewer.setStyle('font-size', '16px');
        /*const tocSubscription = this.epubViewer.getTableOfContents()
            .subscribe((chapters: EpubChapter[]) => {
                //console.log(chapters);
                this.chapters = [].concat(chapters);
                if (this.chapters.length > 0) {
                    this.chapter = this.chapters[0];
                }
                if (tocSubscription) {
                    tocSubscription.unsubscribe();
                }
            });*/
    }

    onChapterUnloaded() {
        console.log('event:onChapterUnloaded');
    }

    onChapterDisplayed(chapter: EpubChapter) {
        console.log('event:onChapterDisplayed');
        this.epubViewer.searchText('a');
    }

    onLocationFound(location: EpubLocation) {
        console.log('event:onLocationFound');
        console.log(location);
    }

    onSearchFinished(results: EpubSearchResult[]) {
        console.log('event:onSearchFinished');
    }

    onPaginationComputed(pages: EpubPage[]) {
        console.log('event:onPaginationComputed');
        // locking gui because we need in pagination in this demo and it requires extra calculation with time
        this.lockAllGui = false;
    }

    onMetadataLoaded(metadata: EpubMetadata) {
        console.log('event:onMetadataLoaded');
        this.metadata.nativeElement.innerHTML = JSON.stringify(metadata, null, 2)
            .replace(/\n/g, '<br>')
            .replace(/ /g, '&nbsp;');
    }

    onTOCLoaded(chapters: EpubChapter[]) {
        console.log('event:onTOCLoaded');
    }

    onErrorOccurred(error: EpubError) {
        console.log('event:onErrorOccurred');
        this.lockAllGui = false;
        switch (error) {
            case EpubError.DOCUMENT_READY:
                alert('Error while accessing unloaded document');
                break;
            case EpubError.OPEN_FILE:
                alert('Error while opening file');
                break;
            case EpubError.READ_FILE:
                alert('Error while reading file');
                break;
            case EpubError.COMPUTE_PAGINATION:
                alert('Error while calculating pagination');
                break;
            case EpubError.LOAD_METADATA:
                alert('Error while loading metadata');
                break;
            case EpubError.LOAD_TOC:
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