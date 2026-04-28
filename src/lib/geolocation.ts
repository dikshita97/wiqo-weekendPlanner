// Geolocation helpers — browser geolocation + free Nominatim reverse geocode.

export type LocationData = {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
};

const STORAGE_KEY = "wiqo:location";

export function getStoredLocation(): LocationData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredLocation(loc: LocationData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
}

export function clearStoredLocation() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function requestLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let city: string | undefined;
        let country: string | undefined;
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
            { headers: { "Accept-Language": "en" } }
          );
          if (r.ok) {
            const data = await r.json();
            city =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.county;
            country = data.address?.country;
          }
        } catch {
          // ignore reverse-geocode failure
        }
        const result = { lat, lng, city, country };
        setStoredLocation(result);
        resolve(result);
      },
      (err) => reject(err),
      { timeout: 10000, enableHighAccuracy: false }
    );
  });
}
