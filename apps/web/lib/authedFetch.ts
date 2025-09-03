// apps/web/lib/authedFetch.ts
export async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  let token: string | undefined;

  //access Firebase
  if (typeof window !== 'undefined') {
    const { auth } = await import('./firebase');
    token = await auth.currentUser?.getIdToken();
  }

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  return fetch(input, { ...init, headers });
}
