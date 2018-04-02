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
import {Observable} from "rxjs/Observable";
import {EpubChapter, EpubError, EpubPage} from "./angularEpubViewer.models";
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/filter';

declare const ePub: any;

/**
 * Angular Epub Viewer component
 */
@Component({
    selector: 'angular-epub-viewer',
    template: `<div id="angularEpubViewer" [style.padding]="padding" #angularEpubViewer></div>`,
    styles: [`
        #angularEpubViewer {
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
     * Root DOM element
     */
    @ViewChild('angularEpubViewer', {read: ElementRef})
    root: ElementRef;
    /**
     * Primary instance
     */
    epub: any = null;

    /**
     * Viewport padding in px, em, etc.
     */
    @Input()
    padding: string = '16px';
    /**
     * Pagination requires extra calculates
     */
    @Input()
    enablePagination: boolean = false;
    /**
     * TOC requires extra calculates
     */
    @Input()
    enableTableOfContents: boolean = false;
    /**
     * Metadata requires extra calculates
     */
    @Input()
    enableMetadata: boolean = false;

    /**
     * BehaviorSubject for loading only after DOM is loaded
     */
    private _link: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    private linkSubscription: Subscription;
    private paginationSubscription: Subscription;

    @Output('onBookReady')
    onBookReady: EventEmitter<void> = new EventEmitter<void>();
    @Output('onPagination')
    onPagination: EventEmitter<EpubPage[]> = new EventEmitter<EpubPage[]>();
    @Output('onTableOfContents')
    onTableOfContents: EventEmitter<any> = new EventEmitter<any>();
    @Output('onMetadata')
    onMetadata: EventEmitter<any> = new EventEmitter<any>();
    @Output('onChapterDisplayed')
    onChapterDisplayed: EventEmitter<EpubChapter> = new EventEmitter<EpubChapter>();
    @Output('onChapterUnloaded')
    onChapterUnloaded: EventEmitter<void> = new EventEmitter<void>();
    @Output('onError')
    onError: EventEmitter<EpubError> = new EventEmitter<EpubError>();

    constructor(private zone: NgZone) {}

    ngAfterViewInit() {
        this.paginationSubscription = this.onBookReady.asObservable()
            .subscribe(() => {
                if (this.enablePagination) {
                    this.zone.runOutsideAngular(() => {
                        this.epub.generatePagination()
                            .then((pages: EpubPage[]) => {
                                this.zone.run(() => {
                                    this.onPagination.next(pages);
                                });
                            })
                            .catch(() => {
                                this.zone.run(() => {
                                    this.onError.emit(EpubError.PAGINATION);
                                });
                            });
                    });
                }
            });
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
        this.epub.renderTo('angularEpubViewer');
        this.epub.on('book:ready', () => {
            this.onBookReady.next(null);
        });
        this.epub.on('renderer:chapterUnloaded', () => {
            this.onChapterUnloaded.next(null);
        });
        this.epub.on('renderer:chapterDisplayed', chapter => {
            this.onChapterDisplayed.next(null);
        });
        this.epub.on('renderer:visibleRangeChanged', () => {
            // renderer:locationChanged is a part of this event

        });
        this.epub.on('renderer:resized', () => {

        });
    };

    /**
     * Open Epub document by link
     * @param link Link to file
     */
    openLink(link: string) {
        this._link.next(link);
    }

    /**
     * Open picked Epub file
     * @param file Picked file
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
                        this.onError.emit(EpubError.OPEN_FILE);
                    });
                };
                reader.readAsArrayBuffer(file);
            });
        } else {
            this.onError.emit(EpubError.OPEN_FILE);
        }
    }

    setFontSize(size: string) {
        this.epub.setStyle('font-size', size);
    }

    resetFontSize() {
        this.epub.removeStyle('font-size');
    }

    getTableOfContents(): Observable<EpubChapter[]> {
        return Observable.fromPromise(this.epub.getToc());
    }

    getMetadata(): Observable<any> {
        return Observable.fromPromise(this.epub.getMetadata());
    }

    private destroyEpub() {
        if (this.epub) {
            this.epub.destroy();
            this.epub = null;
        }
    };

    ngOnDestroy() {
        if (this.paginationSubscription) {this.paginationSubscription.unsubscribe();}
        if (this.linkSubscription) {this.linkSubscription.unsubscribe();}
        this.destroyEpub();
    }
}
