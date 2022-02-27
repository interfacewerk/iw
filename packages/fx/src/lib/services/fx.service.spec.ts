import { of, throwError } from 'rxjs';
import { Notifier } from '../providers/notifier';
import { Failure } from '../model/failure';
import { Success } from '../model/success';
import { Confirm } from '../providers/confirm';
import { FxService } from './fx.service';
import { fakeAsync, tick } from '@angular/core/testing';
import { tap } from 'rxjs/operators';

describe('FxService', () => {
  let fx: FxService;
  let notifier: Notifier;
  let confirm: Confirm;

  beforeEach(() => {
    notifier = {
      openSuccess: jest.fn(),
      openFailure: jest.fn(),
    };
    confirm = {
      open: jest.fn(),
    };
    fx = new FxService(notifier, confirm);
  });

  describe('execute', () => {
    it('returns a Success object when the action succeeds', fakeAsync(() => {
      of(1)
        .pipe(
          fx.execute<number, string>((input) => of(String(input))),
          tap((result) => {
            expect(result).toBeInstanceOf(Success);
            expect((result as Success<number, string>).input).toEqual(1);
            expect((result as Success<number, string>).output).toEqual('1');
          })
        )
        .subscribe();
      tick();
      expect.assertions(3);
    }));

    it('returns a Failure object when the action fails', fakeAsync(() => {
      of(1)
        .pipe(
          fx.execute<number, string>(() => throwError(new Error('Some error'))),
          tap((result) => {
            expect(result).toBeInstanceOf(Failure);
            expect((result as Failure<number>).input).toEqual(1);
            expect((result as Failure<number>).error).toBeInstanceOf(Error);
            expect(
              ((result as Failure<number>).error as Error).message
            ).toEqual('Some error');
          })
        )
        .subscribe();
      tick();
      expect.assertions(4);
    }));
  });

  describe('doOnSuccess', () => {
    it('calls the provided callback when the action succeeds', fakeAsync(() => {
      const doFn = jest.fn();
      of(1)
        .pipe(
          fx.execute<number, string>((input) => of(String(input))),
          fx.doOnSuccess(doFn)
        )
        .subscribe();
      tick();
      expect(doFn).toHaveBeenCalledWith(
        { input: 1, output: '1' },
        new Success({ input: 1, output: '1' })
      );
    }));

    it('does not call the provided callback when the action fails', fakeAsync(() => {

      const doFn = jest.fn();
      of(1)
        .pipe(
          fx.execute<number, string>(() => throwError(new Error('Some error'))),
          fx.doOnSuccess(doFn)
        )
        .subscribe();
      tick();
      expect(doFn).not.toHaveBeenCalled();
    }));
  });

  describe('doOnFailure', () => {
    it('calls the provided callback when the action fails', fakeAsync(() => {
      const doFn = jest.fn();
      of(1)
        .pipe(
          fx.execute<number, string>(() => throwError(new Error('Some error'))),
          fx.doOnFailure(doFn)
        )
        .subscribe();
      tick();
      expect(doFn).toHaveBeenCalledWith(
        { input: 1, error: new Error('Some error') },
        new Failure({ input: 1, error: new Error('Some error') })
      );
    }));

    it('does not call the provided callback when the action succeeds', fakeAsync(() => {
      const doFn = jest.fn();
      of(1)
        .pipe(
          fx.execute<number, string>((input) => of(String(input))),
          fx.doOnFailure(doFn)
        )
        .subscribe();
      tick();
      expect(doFn).not.toHaveBeenCalled();
    }));
  });

  describe('notifySuccess', () => {
    it('calls notifier.openSuccess when the action succeeds', fakeAsync(() => {
      of(1)
        .pipe(
          fx.execute<number, string>((input) => of(String(input))),
          fx.notifySuccess(({ input, output }) => ({
            input,
            output,
            custom: 'data',
          }))
        )
        .subscribe();
      tick();
      expect(notifier.openSuccess).toHaveBeenCalledWith(
        { input: 1, output: '1', custom: 'data' },
        new Success({ input: 1, output: '1' })
      );
    }));

    it('does not call notifier.openSuccess when the action fails', fakeAsync(() => {
      of(1)
        .pipe(
          fx.execute<number, string>(() => throwError(new Error('Some error'))),
          fx.notifySuccess(({ input, output }) => ({
            input,
            output,
            custom: 'data',
          }))
        )
        .subscribe();
      tick();
      expect(notifier.openSuccess).not.toHaveBeenCalled();
    }));
  });

  describe('notifyFailure', () => {
    it('calls notifier.openFailure when the action fails', fakeAsync(() => {
      of(1)
        .pipe(
          fx.execute<number, string>(() => throwError(new Error('Some error'))),
          fx.notifyFailure(({ input, error }) => ({
            input,
            error,
            custom: 'data',
          }))
        )
        .subscribe();
      tick();
      expect(notifier.openFailure).toHaveBeenCalledWith(
        { input: 1, error: new Error('Some error'), custom: 'data' },
        new Failure({ input: 1, error: new Error('Some error') })
      );
    }));

    it('does not call notifier.openFailure when the action succeeds', fakeAsync(() => {
      of(1)
        .pipe(
          fx.execute<number, string>((input) => of(String(input))),
          fx.notifyFailure(({ input, error }) => ({
            input,
            error,
            custom: 'data',
          }))
        )
        .subscribe();
      tick();
      expect(notifier.openFailure).not.toHaveBeenCalled();
    }));
  });

  describe('mapResult', () => {
    it('calls the success callback when the action succeeds', fakeAsync(() => {
      const cb = {
        success: jest.fn(),
        failure: jest.fn(),
      };
      of(1)
        .pipe(
          fx.execute<number, string>((input) => of(String(input))),
          fx.mapResult(cb)
        )
        .subscribe();
      expect(cb.success).toHaveBeenCalledWith({ input: 1, output: '1' });
    }));

    it('calls the error callback when the action fails', fakeAsync(() => {
      const cb = {
        success: jest.fn(),
        failure: jest.fn(),
      };
      of(1)
        .pipe(
          fx.execute<number, string>(() => throwError(new Error('Some error'))),
          fx.mapResult(cb)
        )
        .subscribe();
      expect(cb.failure).toHaveBeenCalledWith({
        input: 1,
        error: new Error('Some error'),
      });
    }));
  });

  describe('confirmFilter', () => {
    it('calls the confirm.open method', fakeAsync(() => {
      confirm.open = jest.fn(() => of(true));
      of(1)
        .pipe(fx.confirmFilter(() => ({ data: 1 })))
        .subscribe();
      tick();
      expect(confirm.open).toHaveBeenCalledWith({ data: 1 }, 1);
    }));

    it('lets the stream continue when confirmed', fakeAsync(() => {
      confirm.open = jest.fn(() => of(true));
      let result = null;
      of(1)
        .pipe(
          fx.confirmFilter(() => ({ data: 1 })),
          tap((r) => (result = r))
        )
        .subscribe();
      tick();
      expect(result).toEqual(1);
    }));

    it('stops the stream continue when not confirmed', fakeAsync(() => {
      confirm.open = jest.fn(() => of(false));
      let result = null;
      of(1)
        .pipe(
          fx.confirmFilter(() => ({ data: 1 })),
          tap((r) => (result = r))
        )
        .subscribe();
      tick();
      expect(result).toEqual(null);
    }));
  });
});
