// Firestore does not reject a write while the device is offline: the promise just stays pending and the
// write is queued. Without a guard the UI would hang on "Saving..." with no message (SRS TC-16).
// guardedWrite() fails fast when the browser reports it is offline, and after `ms` otherwise,
// with a message that is safe to show to the user.

export const OFFLINE_MESSAGE = "You appear to be offline, so the change was not confirmed. Check your connection and try again.";

function offlineError() {
  const error = new Error(OFFLINE_MESSAGE);
  error.userFacing = true;
  error.code = "app/offline";
  return error;
}

export function guardedWrite(run, ms = 10000) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return Promise.reject(offlineError());
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(offlineError()), ms);
  });
  return Promise.race([run(), timeout]).finally(() => clearTimeout(timer));
}
