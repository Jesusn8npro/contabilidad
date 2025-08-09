// Service Worker para ContabilidadPro Suite
// Versión del cache
const CACHE_NAME = 'contabilidadpro-v1.0.0';
const STATIC_CACHE = 'contabilidadpro-static-v1.0.0';
const DYNAMIC_CACHE = 'contabilidadpro-dynamic-v1.0.0';

// Archivos esenciales para cachear
const STATIC_FILES = [
  '/',
  '/panel',
  '/panel/ventas',
  '/panel/clientes',
  '/panel/inventario',
  '/panel/finanzas',
  '/iniciar-sesion',
  '/manifest.json',
  '/favicon.png'
];

// URLs que siempre deben intentar la red primero
const NETWORK_FIRST_URLS = [
  '/api/',
  'supabase.co'
];

// URLs que pueden usar cache primero
const CACHE_FIRST_URLS = [
  '/static/',
  '/images/',
  '.css',
  '.js',
  '.woff',
  '.woff2'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('📦 Service Worker: Caching essential files');
      return cache.addAll(STATIC_FILES);
    }).then(() => {
      console.log('✅ Service Worker: Installation complete');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('❌ Service Worker: Installation failed', error);
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Ignorar peticiones que no son GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Estrategia para diferentes tipos de recursos
  if (shouldUseNetworkFirst(requestUrl)) {
    event.respondWith(networkFirst(event.request));
  } else if (shouldUseCacheFirst(requestUrl)) {
    event.respondWith(cacheFirst(event.request));
  } else {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});

// Determinar si usar Network First
function shouldUseNetworkFirst(url) {
  return NETWORK_FIRST_URLS.some(pattern => url.href.includes(pattern));
}

// Determinar si usar Cache First
function shouldUseCacheFirst(url) {
  return CACHE_FIRST_URLS.some(pattern => url.href.includes(pattern));
}

// Estrategia Network First (para datos dinámicos)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para páginas offline
    if (request.headers.get('accept').includes('text/html')) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sin Conexión - ContabilidadPro</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              padding: 20px;
            }
            .container {
              max-width: 400px;
              background: rgba(255,255,255,0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
            .icon { font-size: 4em; margin-bottom: 20px; }
            h1 { margin: 0 0 20px 0; font-size: 2em; }
            p { margin-bottom: 30px; opacity: 0.9; line-height: 1.6; }
            .button {
              background: rgba(255,255,255,0.2);
              border: 2px solid rgba(255,255,255,0.3);
              color: white;
              padding: 12px 24px;
              border-radius: 10px;
              text-decoration: none;
              display: inline-block;
              transition: all 0.3s ease;
            }
            .button:hover { background: rgba(255,255,255,0.3); }
            .features {
              margin-top: 30px;
              text-align: left;
            }
            .feature {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
              opacity: 0.8;
            }
            .feature-icon { margin-right: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📱</div>
            <h1>Modo Offline</h1>
            <p>No hay conexión a internet, pero puedes seguir usando ContabilidadPro con las funciones disponibles offline.</p>
            
            <div class="features">
              <div class="feature">
                <span class="feature-icon">✅</span>
                <span>Ver datos guardados</span>
              </div>
              <div class="feature">
                <span class="feature-icon">✅</span>
                <span>Crear ventas offline</span>
              </div>
              <div class="feature">
                <span class="feature-icon">✅</span>
                <span>Consultar inventario</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🔄</span>
                <span>Sync automático al reconectar</span>
              </div>
            </div>
            
            <a href="/panel" class="button">Ir al Dashboard</a>
          </div>
          
          <script>
            // Intentar reconectar automáticamente
            function checkConnection() {
              if (navigator.onLine) {
                window.location.reload();
              }
            }
            
            window.addEventListener('online', checkConnection);
            
            // Verificar cada 5 segundos
            setInterval(checkConnection, 5000);
          </script>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    throw error;
  }
}

// Estrategia Cache First (para recursos estáticos)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Failed to fetch resource:', request.url);
    throw error;
  }
}

// Estrategia Stale While Revalidate (para contenido que puede ser un poco viejo)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    console.log('Network failed for:', request.url);
  });
  
  return cachedResponse || fetchPromise;
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => {
      event.ports[0].postMessage({ size });
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearCache().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Obtener tamaño del cache
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

// Limpiar cache
async function clearCache() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

// Manejar actualizaciones en segundo plano
self.addEventListener('backgroundsync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData());
  }
});

// Sincronizar datos cuando se recupere la conexión
async function syncData() {
  try {
    console.log('🔄 Background sync: Syncing offline data...');
    
    // Aquí implementarías la lógica para sincronizar datos offline
    // Por ejemplo, enviar ventas guardadas offline, actualizar inventario, etc.
    
    // Notificar al usuario sobre la sincronización
    self.registration.showNotification('ContabilidadPro', {
      body: 'Datos sincronizados correctamente',
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag: 'sync-complete'
    });
    
    console.log('✅ Background sync: Complete');
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  console.log('📢 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de ContabilidadPro',
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver',
        icon: '/favicon.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/favicon.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ContabilidadPro', options)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/panel')
    );
  }
});

console.log('🎯 Service Worker: ContabilidadPro Suite loaded successfully'); 