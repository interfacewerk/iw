export class Success<InputType, OutputType> {
  constructor(private params: { input: InputType; output: OutputType }) {}

  get input() {
    return this.params.input;
  }

  get output() {
    return this.params.output;
  }
}
