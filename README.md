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

### Demo page

[https://androidovshchik.github.io/AngularEpubViewer](https://androidovshchik.github.io/AngularEpubViewer)

### Getting started

```
npm install epubjs --save
npm install angular-epub-viewer --save
```

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

`"../node_modules/epubjs/build/hooks.js"`

> includes [default plugins](https://github.com/futurepress/epub.js/tree/master/hooks/default)

`"../node_modules/epubjs/build/libs/localforage.min.js"`

> includes [localForage.js library](https://github.com/localForage/localForage)

`"../node_modules/epubjs/build/libs/zip.min.js"`

> includes [JSZip.js library](https://github.com/Stuk/jszip)

Other plugins may be found [here](https://github.com/futurepress/epub.js/tree/master/hooks/extensions)

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

### API reference

[Detailed API documentation](https://androidovshchik.github.io/AngularEpubViewer/api)

Fields:

| Signature | Short Description |
| :------------- |:-------------|
| `epub: ePub` | Primary object |

Input parameters:

| Signature | Default value | Short Description |
| :------------- |:-------------|:-------------|
| `link: string` | `null` | Document's link for initial loading |
| `padding: string` | `'16px'` | Root container's padding |
| `enableAutoPagination: boolean` | `false` | Enables auto calculate of pagination after loading book or changing of viewport |
| `enableAutoLocation: boolean` | `false` | Enables auto loading of current location after any changing of navigation |
| `enableAutoMetadata: boolean` | `false` | Enables auto loading of metadata after loading book |
| `enableAutoTOC: boolean` | `false` | Enables auto loading of table of contents after loading book |

Output events:

| Signature | Short Description |
| :------------- |:-------------|
| `onDocumentReady: EventEmitter<void>` | Get event when document is loaded |
| `onSearchFinish: EventEmitter<EpubSearchResult[]>` | Get event about search results  |
| `onPaginationComputed: EventEmitter<EpubPages[]>` | Get event about pagination |
| `onLocationFound: EventEmitter<EpubLocation>` | Get event about the current location |
| `onMetadataLoaded: EventEmitter<EpubMetadata>` | Get event about metadata |
| `onTOCLoaded: EventEmitter<EpubChapters[]>` | Get event about table of contents |
| `onErrorOccurred: EventEmitter<EpubError>` | Get event when any error occurred |

Methods:

| Signature | Short Description |
| :------------- |:-------------|
| `openLink(link: string): void` | Opens EPUB document by link |
| `openFile(file: File): void` | Opens EPUB document file |
| `goToUrl(url: string): void` | Navigates to the specified url |
| `goToCFI(cfi: string): void` | Navigates to the specified EPUB CFI |
| `goToPage(page: number): void` | Navigates to the specified page |
| `nextPage(): void` | Navigates to the next page |
| `previousPage(): void` | Navigates to the previous page |
| `searchText(text: string): void` | Finds all text matches *in the current chapter* |
| `forceComputePagination(): void` | Calculates pagination as output event |
| `forceFindLocation(): void` | Finds the current location as output event |
| `forceLoadMetadata(): void` | Loads metadata as output event |
| `forceLoadTOC(): void` | Loads table of contents as output event |

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
