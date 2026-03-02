import { LateApiError } from '@getlatedev/node';
import { outputError } from './output.js';

/**
 * Handle errors from SDK calls.
 * LateApiError instances get structured JSON output; everything else gets a generic message.
 */
export function handleError(err: unknown): never {
  if (err instanceof LateApiError) {
    outputError(err.message, err.statusCode);
  }
  outputError((err as Error).message);
}
