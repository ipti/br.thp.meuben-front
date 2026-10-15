const STORAGE_KEY = "meuben-access-requests-v1";
const MAX_SAVED_REQUESTS = 5;

export interface SavedAccessRequest {
  protocol: string;
  trackingKey: string;
  savedAt: string;
}

export const createTrackingCode = (
  protocol: string,
  trackingKey: string,
): string => `${protocol}.${trackingKey}`;

export const parseTrackingCode = (
  code: string,
): Pick<SavedAccessRequest, "protocol" | "trackingKey"> | null => {
  const normalized = code.trim();
  const separator = normalized.indexOf(".");
  if (separator < 1 || separator === normalized.length - 1) return null;

  const protocol = normalized.slice(0, separator).trim();
  const trackingKey = normalized.slice(separator + 1).trim();
  if (!protocol || trackingKey.length < 32) return null;
  return { protocol, trackingKey };
};

export const getSavedAccessRequests = (): SavedAccessRequest[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SavedAccessRequest =>
        typeof item?.protocol === "string" &&
        typeof item?.trackingKey === "string" &&
        typeof item?.savedAt === "string",
    );
  } catch {
    return [];
  }
};

export const saveAccessRequest = (
  protocol: string,
  trackingKey: string,
): SavedAccessRequest => {
  const saved = { protocol, trackingKey, savedAt: new Date().toISOString() };
  const remaining = getSavedAccessRequests().filter(
    (item) => item.protocol !== protocol,
  );
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([saved, ...remaining].slice(0, MAX_SAVED_REQUESTS)),
  );
  return saved;
};

export const removeSavedAccessRequest = (protocol: string): void => {
  const remaining = getSavedAccessRequests().filter(
    (item) => item.protocol !== protocol,
  );
  if (remaining.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};
