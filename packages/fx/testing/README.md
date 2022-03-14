# @iwerk/fx/testing

This library provides necesary components for easier unit testing in your Angular application.

```ts
import { FxTestingModule, NotifierTestingService, ConfirmTestingService } from '@iwerk/fx/testing';

...

let confirm: ConfirmTestingService;

confirm.nextResult = true; // this will make the confirm service return true at the next execution
confirm.nextResult = false; // this will make the confirm service return false at the next execution
expect(confirm.lastConfirmData).toEqual(...);
```
