import type { ExceptionValue } from './interfaces';

export function filterUnWantedExceptions(exceptions: ExceptionValue[]) {
  return exceptions.filter((exception: ExceptionValue) => {
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
