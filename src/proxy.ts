import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes, Next internals, Vercel internals
  // - files with an extension (e.g. /favicon.ico, /grain.png)
  // `admin` is deliberately excluded: the admin console lives outside the
  // locale tree (no /ar/admin), with its own layout + cookie auth.
  matcher: ["/", "/(ar|en)/:path*", "/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
