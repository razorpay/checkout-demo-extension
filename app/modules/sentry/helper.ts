import type { ExceptionValue } from './interfaces';
import { isIgnoredErrors } from 'error-service/filters';

export function filterUnWantedExceptions(exceptions: ExceptionValue[]) {
  return exceptions.filter((exception: ExceptionValue) => {
    if (isIgnoredErrors(exception.value)) {
      return false;
    }
    if (Array.isArray(exception.stacktrace?.frames)) {
      const isUnWantedException = exception.stacktrace.frames.find(
        (frame) =>
          isIgnoredErrors(frame.function) || isIgnoredErrors(frame.filename)
      );
      if (isUnWantedException) {
        return false;
      }
    }
    if (
      exception &&
      exception.stacktrace &&
      exception.stacktrace.frames?.length > 0
    ) {
      return exception.stacktrace.frames[0].filename?.includes(
        'checkout-frame'
      );
    }
    // we allow unhandled rejection
    return exception.type === 'UnhandledRejection';
  });
}
