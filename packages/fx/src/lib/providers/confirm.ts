import { InjectionToken } from '@angular/core';
import { Observable, of } from 'rxjs';

export const FX_CONFIRM = new InjectionToken('FX_CONFIRM');

export interface Confirm {
  open<InputType>(data: unknown, input: InputType): Observable<boolean>;
}

export class WindowConfirm implements Confirm {
  open(data: string): Observable<boolean> {
    return of(window.confirm(data));
  }
}
