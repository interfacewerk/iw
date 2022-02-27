import { InjectionToken } from '@angular/core';
import { Failure } from '../model/failure';
import { Success } from '../model/success';

export const FX_NOTIFIER = new InjectionToken('FX_NOTIFIER');

export interface Notifier {
  openSuccess<InputType, OutputType>(
    data: unknown,
    success: Success<InputType, OutputType>
  ): void;
  openFailure<InputType>(data: unknown, success: Failure<InputType>): void;
}

export class AlertNotifier implements Notifier {
  openSuccess(data: string): void {
    window.alert(data);
  }

  openFailure(data: string): void {
    window.alert(data)
  }
}
