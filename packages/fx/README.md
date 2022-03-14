# @iwerk/fx

This Angular library aims at providing easily usable functions that implement common UX patterns. Those functions are primarily meant to be used with NgRx Effects. The first goal was to make the code more linear and therefore easier to read. All those functions essentially consist in RxJS custom operators.

## Install

```shell
npm install @iwerk/fx
```

```ts
import { FxModule } from '@iwerk/fx';

@NgModule({
  imports: [
    ...,
    FxModule.forRoot()
  ]
})
export class AppModule {}
```

## Success and Failure classes

This library provides two classes that are essential to understand how it works: `Success` and `Failure`. Both encapsulate an `input` member, which can be of the type you want. `Success` encapsulates an `output` member, which is also of the type you want. `Failure` encapsulates an `error` member.

## Trigger execution from an action

The `fx.execute` function is the starting point of a chain of operators that the Fx library can handle. It works as follows:

* it takes as argument a function that is to be executed when the effect is triggered (this function must return an observable)
* if the function throws an error, it will be caught and the function will return a `Failure` object in the stream, wrapping both the input and the error
* if the function succeeds, it will return a `Success` object in the stream, wrapping both the input and the output
* therefore, the `fx.execute` never throws an error and always returns either a `Success` or a `Failure`

```ts
constructore(private fx: FxService) {}

myEffect$ = createEffect(
  () => ofType(myAction).pipe(
    this.fx.execute(action => ...),
    tap((result: Success | Failure) => ...)
    ...
  )
);
```

After the `fx.execute` you can use your own operators or more `fx` built-in methods.

## Notify on success/failure

```ts
myEffect$ = createEffect(
  () => ofType(myAction).pipe(
    this.fx.execute(action => ...), // EXECUTION
    this.fx.notifySuccess(({ input, output }) => ({ ... })), // will only run if the execution succeeds, generate data to pass to the notification UI handler
    this.fx.notifyFailure(({ input, error }) => ({ ... })), // will only run if the execution fails, generate data to pass to the notification UI handler
    ...
  )
);
```

You can customize the notification UI by providing a notifier service when initializing the module.

```ts
import { FxModule, Notifier } from '@iwerk/fx';

@Injectable()
class CustomNotifier implements Notifier {
  openSuccess<InputType, OutputType>(
    data: unknown,
    success: Success<InputType, OutputType>
  ) {
    // display a success notification
  }

  openFailure<InputType>(data: unknown, success: Failure<InputType>) {
    // display a failure notification
  }
}

@NgModule({
  imports: [
    ...
    FxModule.forRoot({
      notifier: {
        useClass: CustomNotifier
      }
    })
  ]
})
```

## Do something on success/failure

```ts
myEffect$ = createEffect(
  () => ofType(myAction).pipe(
    this.fx.execute(action => ...),
    this.fx.doOnSuccess(({ input, output }, success) => {...}) // do whatever you want here,
    this.fx.doOnFailure(({ input, error }, failure) => {...}) // do whatever you want here
    ...
  )
);
```

## Map the result

```ts
myEffect$ = createEffect(
  () => ofType(myAction).pipe(
    this.fx.execute(action => ...),
    this.fx.notifySuccess(({ input, output }) => ({ ... })),
    this.fx.notifyFailure(({ input, error }) => ({ ... })),
    this.fx.mapResult({
      success: ({ input, output }) => ({...}),
      failure: ({ input, error }) => ({...})
    })
    ...
  )
);
```

## Ask user for confirmation

Before executing anything, easily ask your user to confirm! If the user rejects, the whole stream is stopped.

```ts
constructore(private fx: FxService) {}

myEffect$ = createEffect(
  () => ofType(myAction).pipe(
    this.fx.confirmFilter(action => ({ ... })), // pass the data to your confirmation UI handler
    this.fx.execute(action => ...), // only executes if the user confirms
    ...
  )
);
```

You can customize the confirmation UI by providing a confirmation service when initializing the module.

```ts
import { FxModule, Confirm } from '@iwerk/fx';

@Injectable()
class CustomConfirm implements Confirm {
  open<InputType>(data: unknown, input: InputType): Observable<boolean> {
    // display a confirmation dialog here
  }
}

@NgModule({
  imports: [
    ...
    FxModule.forRoot({
      confirm: {
        useClass: CustomConfirm
      }
    })
  ]
})
```
