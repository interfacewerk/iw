# fx

This Angular library aims at providing easily usable functions that implement common UX patterns. Those functions are primarily meant to be used with NgRx Effects. The first goal was to make the code more linear and therefore easier to read. All those functions essentially consist in RxJS custom operators.

## Patterns

### Trigger execution from an action

This is equivalent to a `switchMap` and on top of that, will wrap the input (the action) and the output of the execution in one object.

```ts
constructore(private fx: FxService) {}

myEffect$ = createEffect(
  () => ofType(myAction).pipe(
    this.fx.execute(action => ...),
    tap(({ input, output }) => ...) // the result is wrapping the input and the output
    ...
  )
);
```

### Ask user for confirmation

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
import { FxModule, Confirm } from '@iw/fx';

@Injectable()
class CustomConfirm implements Confirm {

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

### Notify on success/failure

```ts
myEffect$ = createEffect(
  () => ofType(myAction).pipe(
    this.fx.confirmFilter(action => ({ ... })),
    this.fx.execute(action => ...), // EXECUTION
    this.fx.notifySuccess(({ input, output }) => ({ ... })), // will only run if the execution succeeds, generate data to pass to the notification UI handler
    this.fx.notifyFailure(({ input, error }) => ({ ... })), // will only run if the execution fails, generate data to pass to the notification UI handler
    ...
  )
);
```

### Do something on success/failure

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

### Map the result

```ts
myEffect$ = createEffect(
  () => ofType(myAction).pipe(
    this.fx.confirmFilter(action => ({ ... })),
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
