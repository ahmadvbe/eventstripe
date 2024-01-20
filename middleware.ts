import { authMiddleware } from "@clerk/nextjs";
 
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({//we wana allow users even they rnt logged in to be able to visit some routes
    publicRoutes: [
        '/',
        '/events/:id',
        '/api/webhook/clerk',
        '/api/webhook/stripe',
        '/api/uploadthing'
    ],
//we also want to clerk to ignore some routes
    ignoredRoutes:[
        '/api/webhook/clerk',
        '/api/webhook/stripe',
        '/api/uploadthing'
    ]
});
 
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};