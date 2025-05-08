import { supportedLngs } from "@/i18n/language";
import { NextResponse, NextRequest } from "next/server";
import { cookieName, defaultLng } from "./i18n/settings";
 
let locales = supportedLngs.map(lng => lng.code)
 
export function middleware(request: NextRequest) {
    // Check if there is any supported locale in the pathname
    const { pathname } = request.nextUrl

    console.log()
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )
    
    if (pathnameHasLocale) return

    if(request.cookies.has(cookieName)) {
      request.nextUrl.pathname = `/${request.cookies.get(cookieName)!.value}${pathname}`
      return NextResponse.redirect(request.nextUrl)
    }
    
    // Redirect if there is no locale
    const locale = defaultLng
    request.nextUrl.pathname = `/${locale}${pathname}`
    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(request.nextUrl)
}
 
export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
}