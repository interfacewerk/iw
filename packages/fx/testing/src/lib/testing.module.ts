/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable, NgModule } from '@angular/core';
import { Confirm, FxService, FX_CONFIRM, FX_NOTIFIER, Notifier } from '@iw/fx';
import { of } from 'rxjs';

@Injectable()
export class NotifierTestingService implements Notifier {
  openFailure() { }
  openSuccess() { }
}

@Injectable()
export class ConfirmTestingService implements Confirm {
  nextResult = true;
  lastConfirmData = null;
  open(data: any) {
    this.lastConfirmData = data;
    return of(this.nextResult);
  }
}

@NgModule({
  imports: [],
  providers: [
    NotifierTestingService,
    ConfirmTestingService,
    { provide: FX_NOTIFIER, useExisting: NotifierTestingService },
    { provide: FX_CONFIRM, useExisting: ConfirmTestingService },
    FxService,
  ],
})
export class FxTestingModule { }
