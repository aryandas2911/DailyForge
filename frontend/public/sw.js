/* eslint-env serviceworker */
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || "DailyForge Reminder";
  const options = {
    body: data.body || "You have an upcoming task in 5 minutes.",
    icon: "/vite.svg", // Fallback to vite logo for now
    badge: "/vite.svg",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow("/dashboard")
  );
});
