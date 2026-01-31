/* Service Worker for web push notifications - basic handler */

self.addEventListener('push', function (event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : { title: 'Nova notificação', body: 'Você tem uma nova mensagem.' };
  } catch (e) {
    data = { title: 'Nova notificação', body: event.data.text() };
  }

  const title = data.title || 'Atualização';
  const options = {
    body: data.body || 'Confira o app para mais detalhes.',
    icon: '/icons/icon-192.svg',
    badge: '/icons/badge-72.svg',
    data: data.url || '/',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
