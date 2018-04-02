import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AngularEpubViewerComponent} from "../../libs/angular-epub-viewer/src/angularEpubViewer.component";
import {EpubChapter, EpubError, EpubPage} from "../../libs/angular-epub-viewer/src/angularEpubViewer.models";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    @ViewChild('picker', {read: ElementRef})
    picker: ElementRef;
    @ViewChild('epubViewer')
    epubViewer: AngularEpubViewerComponent;

    unzippedBooks: Book[] = [].concat(UNZIPPED_BOOKS);
    zippedBooks: Book[] = [].concat(ZIPPED_BOOKS);
    book: Book = UNZIPPED_BOOKS[0];

    chapter: EpubChapter;
    chapters: EpubChapter[];

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
        this.epubViewer.openLink(this.book.path);
    }

    openFile(event) {
        this.lockAllGui = true;
        // removing selected book
        this.book = null;
        this.epubViewer.openFile(event.target.files[0]);
    }

    onDocumentReady() {
        console.log('event:onDocumentReady');
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

    onPagination(pages: EpubPage[]) {
        console.log('event:onPagination');
        // locking gui because we need in pagination in this demo and it requires extra calculation with time
        this.lockAllGui = false;
    }

    onChapterDisplayed(chapter) {
        console.log('event:onChapterDisplayed');
        //console.log(chapter);
    }

    onChapterUnloaded() {
        //console.log('event:onChapterUnloaded');
    }

    onError(error: EpubError) {
        console.log('event:onError');
        this.lockAllGui = false;
        switch (error) {
            case EpubError.OPEN_FILE:
                alert('Error while opening file');
                break;
            case EpubError.PAGINATION:
                alert('Error while calculating pagination');
                break;
        }
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