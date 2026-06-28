import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = req.auth
  const isOnLogin = req.nextUrl.pathname === "/login"
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard")

  if (isProtectedRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login", req.url))
    }
    return
  }

  if (isOnLogin && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.url))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}