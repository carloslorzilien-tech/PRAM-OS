import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist, NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'serwist'

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: new CacheFirst({
        cacheName: 'google-fonts',
        plugins: [],
      }),
    },
    {
      matcher: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: new CacheFirst({
        cacheName: 'images',
        plugins: [],
      }),
    },
    {
      matcher: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: new NetworkFirst({
        cacheName: 'supabase-api',
        networkTimeoutSeconds: 5,
      }),
    },
    {
      matcher: ({ request }) => request.destination === 'document',
      handler: new StaleWhileRevalidate({
        cacheName: 'pages',
      }),
    },
  ],
})

serwist.addEventListeners()
