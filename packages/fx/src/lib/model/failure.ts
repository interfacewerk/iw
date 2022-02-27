export class Failure<InputType> {
  constructor(private params: { input: InputType; error: unknown }) {}

  get input() {
    return this.params.input;
  }

  get error() {
    return this.params.error;
  }
}
