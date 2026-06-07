import { withAuth } from "next-auth/middleware";

export default withAuth;

export const config = {
  matcher: [
    "/",
    "/journal/:path*",
    "/backtesting/:path*",
    "/settings/:path*",
  ],
};
