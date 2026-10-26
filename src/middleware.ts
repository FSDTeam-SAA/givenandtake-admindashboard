// Keep both supported Next.js entry locations on the same session policy.
export { middleware } from '../middleware';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
