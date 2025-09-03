
import { getAuth } from 'firebase/auth';
import { API_BASE_URL } from '../config/api';
import './firebase';

declare global {
  interface Window { __fetchAuthPatched?: boolean }
}

if (typeof window !== 'undefined' && !window.__fetchAuthPatched) {
  window.__fetchAuthPatched = true;

  const originalFetch = window.fetch.bind(window);
  const auth = getAuth();

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
          ? input.href
          : (input as Request).url;

      if (url.startsWith(API_BASE_URL)) {
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : null;

        const headers = new Headers(
          init?.headers || (input instanceof Request ? input.headers : undefined)
        );
        if (token) headers.set('Authorization', `Bearer ${token}`);
        if (!headers.has('Content-Type') && init?.body) {
          headers.set('Content-Type', 'application/json');
        }

        return originalFetch(input, { ...init, headers });
      }
    } catch {
    }
    return originalFetch(input, init as any);
  };
}
