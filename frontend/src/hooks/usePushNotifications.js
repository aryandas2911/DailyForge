import { useState, useEffect } from 'react';
import api from '../api/axios';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const subscribeToPush = async () => {
    if (!isSupported) return false;

    try {
      const permResult = await Notification.requestPermission();
      setPermission(permResult);
      if (permResult !== 'granted') {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const response = await api.get('/notifications/vapid-public-key');
      const publicKey = response.data.publicKey;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      await api.post('/notifications/subscribe', { subscription });
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  };

  return { isSupported, permission, subscribeToPush };
};
