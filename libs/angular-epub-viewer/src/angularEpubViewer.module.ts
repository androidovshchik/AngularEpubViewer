import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {AngularEpubViewerComponent} from './angularEpubViewer.component';

@NgModule({
  imports: [HttpClientModule],
  declarations: [AngularEpubViewerComponent],
  exports: [AngularEpubViewerComponent]
})
export class AngularEpubViewerModule {}
