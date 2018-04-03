import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    OnDestroy,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subscription} from "rxjs/Subscription";
import {
    EpubChapter,
    EpubError,
    EpubLocation,
    EpubMetadata,
    EpubPage,
    EpubSearchResult
} from "./angularEpubViewer.models";
import 'rxjs/add/operator/filter';

declare const ePub: any;

/**
 * AngularEpubViewer component
 */
@Component({
    selector: 'angular-epub-viewer',
    template: `<div id="angularEpubViewerComponent" [style.padding]="padding" #angularEpubViewerComponent></div>`,
    styles: [`
        #angularEpubViewerComponent {
            width: 100%;
            height: 100%;
            margin: 0;
            overflow: hidden;
        }
    `],
    encapsulation: ViewEncapsulation.None
})
export class AngularEpubViewerComponent implements AfterViewInit, OnDestroy {

    /**
     * Root container's DOM reference
     */
    @ViewChild('angularEpubViewerComponent', {read: ElementRef})
    root: ElementRef;

    /**
     * Primary object
     */
    epub: any = null;

    /**
     * Current location of document's rendered part
     */
    currentLocation: EpubLocation = {
        startCfi: null,
        endCfi: null,
        page: null
    };

    documentReady: boolean = false;

    computingPagination: boolean = false;

    /**
     * Root container's padding in px, em, etc.
     */
    @Input()
    padding: string = null;
    /**
     * Enables auto calculate of pagination after document is ready or viewport has been changed
     */
    @Input()
    autoPagination: boolean = false;
    /**
     * Enables auto loading of metadata after document is ready
     */
    @Input()
    autoMetadata: boolean = false;
    /**
     * Enables auto loading of table of contents after document is ready
     */
    @Input()
    autoTOC: boolean = false;

    /**
     * Get event when document is loaded
     */
    @Output('onDocumentReady')
    onDocumentReady: EventEmitter<void> = new EventEmitter<void>();
    /**
     * Get event when chapter is unloaded
     */
    @Output('onChapterUnloaded')
    onChapterUnloaded: EventEmitter<void> = new EventEmitter<void>();
    /**
     * Get event when chapter is displayed
     */
    @Output('onChapterDisplayed')
    onChapterDisplayed: EventEmitter<EpubChapter> = new EventEmitter<EpubChapter>();
    /**
     * Get event about the current location
     */
    @Output('onLocationFound')
    onLocationFound: EventEmitter<EpubLocation> = new EventEmitter<EpubLocation>();
    /**
     * Get event about search results
     */
    @Output('onSearchFinished')
    onSearchFinished: EventEmitter<EpubSearchResult[]> = new EventEmitter<EpubSearchResult[]>();
    /**
     * Get event about pagination
     */
    @Output('onPaginationComputed')
    onPaginationComputed: EventEmitter<EpubPage[]> = new EventEmitter<EpubPage[]>();
    /**
     * Get event about metadata
     */
    @Output('onMetadataLoaded')
    onMetadataLoaded: EventEmitter<EpubMetadata> = new EventEmitter<EpubMetadata>();
    /**
     * Get event about table of contents
     */
    @Output('onTOCLoaded')
    onTOCLoaded: EventEmitter<EpubChapter[]> = new EventEmitter<EpubChapter[]>();
    /**
     * Get event when any error occurred
     */
    @Output('onErrorOccurred')
    onErrorOccurred: EventEmitter<EpubError> = new EventEmitter<EpubError>();

    /**
     * Starts loading document by link only after DOM is ready
     */
    private _link: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    private linkSubscription: Subscription;

    private needComputePagination: boolean = false;

    constructor(private zone: NgZone) {}

    ngAfterViewInit() {
        this.linkSubscription = this._link.asObservable()
            .filter(link => link != null)
            .subscribe(link => {
                this.initEpub({
                    bookPath: link
                });
            });
    }

    private initEpub = (properties: object) => {
        this.destroyEpub();
        this.epub = ePub(properties);
        this.epub.on('book:ready', () => {
            this.documentReady = true;
            this.onDocumentReady.next(null);
            if (this.autoPagination) {
                this.computePagination();
            }
            if (this.autoMetadata) {
                this.loadMetadata();
            }
            if (this.autoTOC) {
                this.loadTOC();
            }
        });
        this.epub.on('book:pageChanged', (location) => {
            if (!this.computingPagination) {
                this.currentLocation.page = location.anchorPage;
                this.onLocationFound.next(this.currentLocation);
            }
        });
        this.epub.on('renderer:chapterUnloaded', () => {
            this.onChapterUnloaded.next(null);
        });
        this.epub.on('renderer:chapterDisplayed', (chapter: EpubChapter) => {
            chapter['label'] = null;
            this.onChapterDisplayed.next(chapter);
        });
        this.epub.on('renderer:resized', () => {
            this.needComputePagination = true;
            if (this.documentReady && this.autoPagination) {
                this.computePagination();
            }
        });
        this.epub.on('renderer:visibleRangeChanged', range => {
            // renderer:locationChanged is a part of this event
            this.currentLocation.startCfi = range.start;
            this.currentLocation.endCfi = range.end;
            this.onLocationFound.next(this.currentLocation);
        });
        this.epub.renderTo('angularEpubViewerComponent');
    };

    /**
     * Opens EPUB document by link
     * @param link
     */
    openLink(link: string) {
        this._link.next(link);
    }

    /**
     * Opens EPUB document file
     * @param file
     */
    openFile(file: File) {
        if (window['FileReader']) {
            this.zone.runOutsideAngular(() => {
                const reader: FileReader = new FileReader();
                reader.onload = () => {
                    this.zone.run(() => {
                        this.initEpub({
                            bookPath: reader.result
                        });
                    });
                };
                reader.onerror = () => {
                    this.zone.run(() => {
                        this.onErrorOccurred.emit(EpubError.READ_FILE);
                    });
                };
                reader.readAsArrayBuffer(file);
            });
        } else {
            this.onErrorOccurred.emit(EpubError.OPEN_FILE);
        }
    }

    /**
     * Navigates to the specified url or EPUB CFI or page
     * @param location
     */
    goTo(location: string | number) {
        if (!this.documentReady) {
            this.onErrorOccurred.emit(EpubError.DOCUMENT_READY);
            return;
        }
        if (typeof location === "number") {
            // page
            this.epub.displayChapter(location);
        } else if (/.*html$/.test(location)) {
            // url
            this.epub.goto(location);
        } else {
            // EPUB CFI
            this.epub.displayChapter(location);
        }
    }

    /**
     * Navigates to the next page
     */
    nextPage() {
        if (!this.documentReady) {
            this.onErrorOccurred.emit(EpubError.DOCUMENT_READY);
            return;
        }
        this.epub.nextPage();
    }

    /**
     * Navigates to the previous page
     */
    previousPage() {
        if (!this.documentReady) {
            this.onErrorOccurred.emit(EpubError.DOCUMENT_READY);
            return;
        }
        this.epub.prevPage();
    }

    /**
     * Searches all text matches *in the current chapter*
     * @param text
     */
    searchText(text: string) {
        if (!this.documentReady) {
            return;
        }
        this.zone.runOutsideAngular(() => {
            const results: EpubSearchResult[] = this.epub.currentChapter.find(text);
            this.zone.run(() => {
                this.onSearchFinished.next(results);
            });
        });
    }

    /**
     * Adds style to be attached to the document's body element
     * @param style
     * @param value
     */
    setStyle(style: string, value: string) {
        if (!this.documentReady) {
            this.onErrorOccurred.emit(EpubError.DOCUMENT_READY);
            return;
        }
        this.epub.setStyle(style, value);
    }

    /**
     * Removes a style from the rendered document
     * @param style
     */
    resetStyle(style: string) {
        if (!this.documentReady) {
            this.onErrorOccurred.emit(EpubError.DOCUMENT_READY);
            return;
        }
        this.epub.removeStyle(style);
    }

    /**
     * Calculates pagination as output event
     */
    computePagination() {
        if (!this.documentReady) {
            this.onErrorOccurred.emit(EpubError.DOCUMENT_READY);
            return;
        }
        if (this.computingPagination) {
            return;
        }
        this.computingPagination = true;
        this.needComputePagination = false;
        this.zone.runOutsideAngular(() => {
            this.epub.generatePagination()
                .then((pages: EpubPage[]) => {
                    const currentPage = this.epub.pagination.pageFromCfi(this.epub.getCurrentLocationCfi());
                    this.zone.run(() => {
                        this.computingPagination = false;
                        if (this.needComputePagination) {
                            this.computePagination();
                        } else {
                            this.onPaginationComputed.next(pages);
                            this.currentLocation.page = currentPage;
                            this.onLocationFound.next(this.currentLocation);
                        }
                    });
                })
                .catch(() => {
                    this.zone.run(() => {
                        this.computingPagination = false;
                        this.onErrorOccurred.emit(EpubError.COMPUTE_PAGINATION);
                    });
                });
        });
    }

    /**
     * Loads metadata as output event
     */
    loadMetadata() {
        if (!this.documentReady) {
            this.onErrorOccurred.emit(EpubError.DOCUMENT_READY);
            return;
        }
        this.zone.runOutsideAngular(() => {
            this.epub.getMetadata()
                .then((metadata: EpubMetadata) => {
                    this.zone.run(() => {
                        this.onMetadataLoaded.next(metadata);
                    });
                })
                .catch(() => {
                    this.zone.run(() => {
                        this.onErrorOccurred.emit(EpubError.LOAD_METADATA);
                    });
                });
        });
    }

    /**
     * Loads table of contents as output event
     */
    loadTOC() {
        if (!this.documentReady) {
            this.onErrorOccurred.emit(EpubError.DOCUMENT_READY);
            return;
        }
        this.zone.runOutsideAngular(() => {
            this.epub.getToc()
                .then((chapters: EpubChapter[]) => {
                    this.zone.run(() => {
                        this.onTOCLoaded.next(chapters);
                    });
                })
                .catch(() => {
                    this.zone.run(() => {
                        this.onErrorOccurred.emit(EpubError.LOAD_TOC);
                    });
                });
        });
    }

    private destroyEpub() {
        this.documentReady = false;
        this.computingPagination = false;
        this.needComputePagination = false;
        if (this.epub) {
            this.epub.destroy();
            this.epub = null;
        }
    };

    ngOnDestroy() {
        if (this.linkSubscription) {this.linkSubscription.unsubscribe();}
        this.destroyEpub();
    }
}
