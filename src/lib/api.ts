// REST client for the Laravel backend (replaces Supabase calls).
// Activate by setting VITE_API_URL in the project env, then migrate
// supabase.from(...) / supabase.auth / supabase.functions.invoke calls
// to use api(...) below. While VITE_API_URL is unset, this file is inert.

const BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function ensureCsrf(): Promise<void> {
  if (!BASE) throw new Error("VITE_API_URL is not set");
  await fetch(`${BASE}/sanctum/csrf-cookie`, { credentials: "include" });
}

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  if (!BASE) throw new Error("VITE_API_URL is not set");
  const res = await fetch(`${BASE}${path.startsWith("/") ? path : `/${path}`}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  });
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const msg = (data as any)?.message ?? (data as any)?.error ?? res.statusText;
    throw new ApiError(res.status, msg, data);
  }
  return data as T;
}

function safeJson(s: string) {
  try { return JSON.parse(s); } catch { return s; }
}

// Convenience wrappers — match the Laravel routes 1:1
export const apiClient = {
  // auth
  login: async (email: string, password: string) => {
    await ensureCsrf();
    return api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  },
  logout: () => api("/api/auth/logout", { method: "POST" }),
  me: () => api("/api/auth/me"),

  // rooms
  listRooms: () => api("/api/rooms"),
  getRoom: (slug: string) => api(`/api/rooms/${slug}`),

  // bookings
  createBooking: (b: Record<string, unknown>) => api("/api/bookings", { method: "POST", body: JSON.stringify(b) }),
  listBookings: () => api("/api/bookings"),
  getBooking: (id: string) => api(`/api/bookings/${id}`),
  updateBooking: (id: string, patch: Record<string, unknown>) =>
    api(`/api/bookings/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),

  // checkout / payments
  checkAvailability: (roomId: string, checkIn: string, checkOut: string) =>
    api("/api/availability", { method: "POST", body: JSON.stringify({ roomId, checkIn, checkOut }) }),
  createCheckout: (body: Record<string, unknown>) =>
    api("/api/checkout", { method: "POST", body: JSON.stringify(body) }),
  refund: (bookingId: string) => api(`/api/bookings/${bookingId}/refund`, { method: "POST" }),

  // contact
  sendContact: (b: Record<string, unknown>) => api("/api/contact", { method: "POST", body: JSON.stringify(b) }),
  listContact: () => api("/api/contact"),

  // admin
  operaLogs: () => api("/api/admin/opera-logs"),
  operaSync: (booking_id: string, action: string) =>
    api("/api/admin/opera-sync", { method: "POST", body: JSON.stringify({ booking_id, action }) }),
  bootstrapAdmin: (secret: string, body: Record<string, unknown>) =>
    api("/api/admin/bootstrap", {
      method: "POST",
      headers: { "X-Bootstrap-Secret": secret },
      body: JSON.stringify(body),
    }),
};