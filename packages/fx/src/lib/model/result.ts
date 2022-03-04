import { Failure } from './failure';
import { Success } from './success';

export type ExecutionResult<InputType, OutputType> =
  | Success<InputType, OutputType>
  | Failure<InputType>;
