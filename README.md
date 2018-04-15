<h1>AngularEpubViewer</h1>

<p>
  <a href="https://www.npmjs.com/package/angular-epub-viewer">
    <img src="https://img.shields.io/npm/dm/angular-epub-viewer.svg?style=flat" height="18" alt="downloads">
  </a>
  <a href="https://www.npmjs.com/package/angular-epub-viewer">
    <img src="https://badge.fury.io/js/angular-epub-viewer.png" height="18" alt="npm version">
  </a>
  <a href="https://david-dm.org/androidovshchik/AngularEpubViewer" title="dependencies status">
    <img src="https://david-dm.org/androidovshchik/AngularEpubViewer/status.svg" height="18"/>
  </a>
  <a href="https://www.paypal.me/mrcpp" title="Donate to this project using Paypal">
    <img src="https://img.shields.io/badge/paypal-donate-green.svg" alt="PayPal donate button" height="18"/>
  </a>
</p>

This is a simple epub viewer component for angular4+ websites.

All issues and pull requests are welcome!

### Demo page

[https://androidovshchik.github.io/AngularEpubViewer](https://androidovshchik.github.io/AngularEpubViewer)

### Getting started

```
npm install epubjs@0.2.x --save
npm install angular-epub-viewer --save
```

*(Actual version of the 2-nd branch for epub.js may be found [here](https://www.npmjs.com/package/epubjs))*

Then add **required** `epub.js` script to your `.angular-cli.json`

```
{
  ...
  "apps": [
    {
      ...
      "scripts": [
        "../node_modules/epubjs/build/epub.js",
        ...
      ]
    }
  ]
}

```

Optional scripts:

> `"../node_modules/epubjs/build/hooks.js"`
>
> includes [default plugins](https://github.com/futurepress/epub.js/tree/master/hooks/default)

> `"../node_modules/epubjs/build/libs/zip.min.js"` *(recommended)*
>
> includes [JSZip.js library](https://github.com/Stuk/jszip)

> `"../node_modules/epubjs/build/libs/localforage.min.js"`
>
> includes [localForage.js library](https://github.com/localForage/localForage)

Other official plugins may be found [here](https://github.com/futurepress/epub.js/tree/master/hooks/extensions)

In folder `add-ons` are also available my own hooks, include them such way:

`"../node_modules/angular-epub-viewer/add-ons/YOUR_CHOSEN_HOOK_NAME.js"`

### Supporting IE

Compatibility coming with [wicked-good-xpath](https://github.com/google/wicked-good-xpath)

Include these scripts in `.angular-cli.json`:

```
"../node_modules/epubjs/examples/wgxpath.install.js",
"../node_modules/epubjs/hooks/extensions/wgxpath.js"
```

[More info here](https://github.com/futurepress/epub.js#internet-explorer)

### An example of usage

`*.module.ts` file

```js
import { AngularEpubViewerModule } from 'angular-epub-viewer';

@NgModule({
  ...
  imports: [
    ...
    AngularEpubViewerModule
  ]
})
```

`*.component.html` file

```html
<angular-epub-viewer #epubViewer></angular-epub-viewer>
<input type="file" accept="application/epub+zip" (change)="openFile($event)">
<button (click)="epubViewer.previousPage()">Previous page</button>
<button (click)="epubViewer.nextPage()">Next page</button>
```

`*.component.ts` file

```js
@Component({
  ...
})
export class AppComponent {

  @ViewChild('epubViewer')
  epubViewer: AngularEpubViewerComponent;

  openFile(event) {
    this.epubViewer.openFile(event.target.files[0]);
  }
}
```

### API documentation

Fields:

| Signature | Short Description |
| :------------- |:-------------|
| `epub: ePub` | Primary object |
| `root: ElementRef` | Root container's DOM reference |
| `currentLocation: EpubLocation` | Current location of document's rendered part |
| `documentReady: boolean` | Indicates whenever document is ready |
| `isChapterDisplayed: boolean` | Indicates whenever chapter is displayed |
| `computingPagination: boolean` | Indicates whenever pagination is computing |
| `searchingText: boolean` | Indicates whenever searching text |

Input parameters:

| Signature | Default value | Short Description |
| :------------- |:-------------|:-------------|
| `padding: string` | `null` | Root container's padding in px, em, etc |
| `autoPagination: boolean` | `false` | Enables auto calculate of pagination after document is ready or viewport has been changed |
| `autoMetadata: boolean` | `false` | Enables auto loading of metadata after document is ready |
| `autoTOC: boolean` | `false` | Enables auto loading of table of contents after document is ready |

Output events:

| Signature | Short Description |
| :------------- |:-------------|
| `onDocumentReady: EventEmitter<void>` | Get event when document is loaded |
| `onChapterUnloaded: EventEmitter<void>` | Get event when chapter is unloaded  |
| `onChapterDisplayed: EventEmitter<EpubChapter>` | Get event when chapter is displayed  |
| `onLocationFound: EventEmitter<EpubLocation>` | Get event about the current location |
| `onSearchFinished: EventEmitter<EpubSearchResult[]>` | Get event about search results  |
| `onPaginationComputed: EventEmitter<EpubPage[]>` | Get event about pagination |
| `onMetadataLoaded: EventEmitter<EpubMetadata>` | Get event about metadata |
| `onTOCLoaded: EventEmitter<EpubChapter[]>` | Get event about table of contents |
| `onErrorOccurred: EventEmitter<EpubError>` | Get event when any error occurred |

Methods:

| Signature | Short Description |
| :------------- |:-------------|
| `openLink(link: string): void` | Opens EPUB document by link |
| `openFile(file: File): void` | Opens EPUB document file |
| `goTo(location: string or number): void` | Navigates to the specified url or EPUB CFI or page |
| `nextPage(): void` | Navigates to the next page |
| `previousPage(): void` | Navigates to the previous page |
| `searchText(text: string): void` | Searches all text matches *in the current chapter* |
| `setStyle(style: string, value: string): void` | Adds style to be attached to the document's body element |
| `resetStyle(style: string): void` | Removes a style from the rendered document |
| `computePagination(): void` | Calculates pagination as output event |
| `loadMetadata(): void` | Loads metadata as output event |
| `loadTOC(): void` | Loads table of contents as output event |

### Running demo from sources

```
git clone https://github.com/androidovshchik/AngularEpubViewer.git
cd AngularEpubViewer
git submodule update --init --recursive
npm install
npm start
```

Open http://localhost:4200 in browser

### License

<img src="https://raw.githubusercontent.com/androidovshchik/AngularEpubViewer/master/art/gplv3-127x51.png">

### Other

EPUB is a registered trademark of the [IDPF](http://idpf.org/).
