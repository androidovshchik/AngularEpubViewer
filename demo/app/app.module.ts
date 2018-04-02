import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {FormsModule} from '@angular/forms';
import {AngularEpubViewerModule} from '../../libs/angular-epub-viewer/src/angularEpubViewer.module';
import {CommonModule} from "@angular/common";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        AngularEpubViewerModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
