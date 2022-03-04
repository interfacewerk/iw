import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  catchError,
  exhaustMap,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Failure } from '../model/failure';
import { ExecutionResult } from '../model/result';
import { Success } from '../model/success';
import { Confirm, FX_CONFIRM } from '../providers/confirm';
import { FX_NOTIFIER, Notifier } from '../providers/notifier';

@Injectable()
export class FxService {
  constructor(
    @Inject(FX_NOTIFIER) private notifier: Notifier,
    @Inject(FX_CONFIRM) private confirm: Confirm
  ) {}

  confirmFilter<ActionType, ConfirmData>(confirmData: (action: ActionType) => ConfirmData) {
    return (source: Observable<ActionType>): Observable<ActionType> => {
      return source.pipe(
        exhaustMap((action) => {
          return this.confirm
            .open(confirmData(action), action)
            .pipe(map((confirm) => ({ action, confirm })));
        }),
        filter(({ confirm }) => confirm),
        map(({ action }) => action)
      );
    };
  }

  execute<InputType, OutputType>(
    fn: (input: InputType) => Observable<OutputType>
  ) {
    return (
      source: Observable<InputType>
    ): Observable<ExecutionResult<InputType, OutputType>> => {
      return source.pipe(
        switchMap((input) =>
          fn(input).pipe(
            map((output) => new Success({ output, input })),
            catchError((error) => of(new Failure({ input, error })))
          )
        )
      );
    };
  }

  mapResult<InputType, OutputType, SuccessReturnType, FailureReturnType>(cases: {
    success: (args: { input: InputType; output: OutputType }) => SuccessReturnType;
    failure: (args: { input: InputType; error: unknown }) => FailureReturnType;
  }) {
    return (
      source: Observable<ExecutionResult<InputType, OutputType>>
    ) => {
      return source.pipe(
        map((result) => {
          if (result instanceof Failure) {
            return cases.failure({ input: result.input, error: result.error });
          }
          return cases.success({ input: result.input, output: result.output });
        })
      );
    };
  }

  doOnSuccess<InputType, OutputType>(
    fn: (args: {
      input: InputType;
      output: OutputType;
    }, success: Success<InputType, OutputType>) => void
  ) {
    return (
      source: Observable<ExecutionResult<InputType, OutputType>>
    ) => {
      return source.pipe(
        tap((result) => {
          if (result instanceof Failure) {
            return;
          }
          fn({ input: result.input, output: result.output }, result);
        })
      );
    };
  }

  doOnFailure<InputType, OutputType>(
    fn: (args: {
      input: InputType;
      error: unknown;
    }, failure: Failure<InputType>) => void
  ) {
    return (
      source: Observable<ExecutionResult<InputType, OutputType>>
    ) => {
      return source.pipe(
        tap((result) => {
          if (result instanceof Success) {
            return;
          }
          fn({ input: result.input, error: result.error }, result);
        })
      );
    };
  }

  notifySuccess<InputType, OutputType, NotificationData>(
    notificationFn: (args: {
      input: InputType;
      output: OutputType;
    }) => NotificationData
  ) {
    return this.doOnSuccess<InputType, OutputType>(({ input, output }, success) => {
      this.notifier.openSuccess(
        notificationFn({ input, output }),
        success
      );
    });
  }

  notifyFailure<InputType, OutputType, NotificationData>(
    notificationFn: (args: {
      input: InputType;
      error: unknown;
    }) => NotificationData
  ) {
    return this.doOnFailure<InputType, OutputType>(({ input, error }, failure) => {
      this.notifier.openFailure(
        notificationFn({ input, error }),
        failure
      )
    });
  }
}
