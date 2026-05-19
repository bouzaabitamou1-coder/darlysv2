import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  BarChart3, CalendarDays, DollarSign, Mail, BedDouble,
  Users, LogOut, Eye, Check, X, Pencil, Trash2, CreditCard, RefreshCw, Printer, Undo2, ChevronDown, ChevronUp, Car, MapPin, Star, Save
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { printInvoice } from "@/lib/printInvoice";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { formatCurrency, formatDate, formatDateTime } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({ bookings: 0, revenue: 0, messages: 0, rooms: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [paymentEvents, setPaymentEvents] = useState<any[]>([]);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [transportBookings, setTransportBookings] = useState<any[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [expandedSyncLog, setExpandedSyncLog] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    const [bookingsRes, messagesRes, roomsRes, eventsRes, syncRes, transportRes, surveysRes] = await Promise.all([
      supabase.from("bookings").select("*, rooms(name)").order("created_at", { ascending: false }),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("rooms").select("*").order("name"),
      supabase.from("payment_events").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("opera_sync_log").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("transport_bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("stay_surveys").select("*").order("created_at", { ascending: false }),
    ]);

    const b = bookingsRes.data || [];
    const m = messagesRes.data || [];
    const r = roomsRes.data || [];

    setBookings(b);
    setMessages(m);
    setRooms(r);
    setPaymentEvents(eventsRes.data || []);
    setSyncLogs(syncRes.data || []);
    setTransportBookings(transportRes.data || []);
    setSurveys(surveysRes.data || []);
    setStats({
      bookings: b.length,
      revenue: b.filter((x) => x.payment_status === "paid").reduce((s, x) => s + Number(x.total_price), 0),
      messages: m.filter((x) => !x.is_read).length,
      rooms: r.length,
    });
  };

  const updateTransportStatus = async (id: string, status: string) => {
    await supabase.from("transport_bookings").update({ status }).eq("id", id);
    toast.success(`Transport ${status}`);
    loadData();
  };

  const deleteTransport = async (t: any) => {
    if (!confirm(`Delete transport request for ${t.guest_name}?`)) return;
    await supabase.from("transport_bookings").delete().eq("id", t.id);
    toast.success("Transport request deleted");
    loadData();
  };

  const updateBookingStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    toast.success(`Booking ${status}`);
    loadData();
  };

  const deleteBooking = async (booking: any) => {
    if (!confirm(`Permanently delete reservation for ${booking.guest_name}? This cannot be undone.`)) return;
    const { error } = await supabase.from("bookings").delete().eq("id", booking.id);
    if (error) {
      toast.error(`Failed to delete: ${error.message}`);
      return;
    }
    toast.success("Reservation deleted");
    loadData();
  };



  const processRefund = async (booking: any) => {
    if (!confirm(`Refund €${Number(booking.total_price).toFixed(2)} for ${booking.guest_name}?`)) return;
    setRefundingId(booking.id);
    try {
      const { data, error } = await supabase.functions.invoke("process-refund", {
        body: { bookingId: booking.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Refund of €${data.amount} processed (${data.refundId})`);
      loadData();
    } catch (err: any) {
      toast.error(`Refund failed: ${err.message}`);
    } finally {
      setRefundingId(null);
    }
  };

  const markMessageRead = async (id: string) => {
    await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
    loadData();
  };

  const updateRoomAvailability = async (id: string, is_available: boolean) => {
    await supabase.from("rooms").update({ is_available }).eq("id", id);
    toast.success("Room updated");
    loadData();
  };

  const saveRoomPrice = async (id: string) => {
    const price = parseFloat(editPrice);
    if (isNaN(price) || price <= 0) { toast.error("Enter a valid price"); return; }
    const { error } = await supabase.from("rooms").update({ price_per_night: price }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Price updated");
    setEditingRoomId(null);
    loadData();
  };

  if (loading || !isAdmin) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "bookings", label: "Bookings", icon: CalendarDays },
    { id: "transport", label: "Transport", icon: Car },
    { id: "rooms", label: "Rooms", icon: BedDouble },
    { id: "messages", label: "Messages", icon: Mail },
    { id: "surveys", label: "Surveys", icon: Star },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "opera", label: "Opera PMS", icon: RefreshCw },
  ];

  const statCards = [
    { label: "Total Bookings", value: stats.bookings, icon: CalendarDays, color: "text-gold" },
    { label: "Revenue", value: formatCurrency(stats.revenue), icon: DollarSign, color: "text-teal" },
    { label: "Transport Requests", value: transportBookings.length, icon: Car, color: "text-amber-400" },
    { label: "Unread Messages", value: stats.messages, icon: Mail, color: "text-terracotta" },
    { label: "Rooms", value: stats.rooms, icon: BedDouble, color: "text-olive" },
  ];

  return (
    <div dir="ltr" className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>
      {/* Top brand bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-amber-500/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">D</div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-amber-400 tracking-tight">Dar Lys</p>
              <p className="text-[10px] text-slate-500 tracking-[0.25em] uppercase">Control Center</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span className="text-xs text-slate-500">Signed in as <span className="text-slate-300">{user?.email}</span></span>
            <button onClick={() => { signOut(); navigate("/"); }} className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-amber-400 border border-slate-800 hover:border-amber-500/40 rounded-md transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
        {/* Horizontal tab bar */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-amber-400 border-amber-400"
                  : "text-slate-500 border-transparent hover:text-slate-200"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 lg:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-100 capitalize tracking-tight">{activeTab}</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your riad operations from one elegant cockpit.</p>
        </div>

        {activeTab === "overview" && (
          <div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {statCards.map((card) => (
                <div key={card.label} className="bg-gradient-to-br from-slate-900 to-slate-900/40 p-6 border border-slate-800 rounded-xl hover:border-amber-500/30 hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] tracking-wider uppercase text-slate-500">{card.label}</span>
                    <card.icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-2xl font-semibold text-slate-100">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 p-6 border border-slate-800 rounded-lg">
              <h3 className="font-semibold text-slate-100 mb-4 text-sm uppercase tracking-wider">Recent Bookings</h3>
              <div className="space-y-3">
                {bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-800 rounded-md text-sm">
                    <div>
                      <p className="text-slate-100 font-medium">{b.guest_name}</p>
                      <p className="text-slate-400 text-xs">{b.rooms?.name} · {formatDate(b.check_in)} → {formatDate(b.check_out)}</p>
                      <p className="text-slate-500 text-xs">Booked {formatDateTime(b.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-400 font-semibold">{formatCurrency(Number(b.total_price))}</p>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && <p className="text-slate-500 text-sm">No bookings yet.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Guest</th>
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Room</th>
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Dates</th>
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Booked At</th>
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Total</th>
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Status</th>
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="text-slate-100 font-medium">{b.guest_name}</p>
                      <p className="text-slate-500 text-xs">{b.guest_email}</p>
                    </td>
                    <td className="p-4 text-slate-200">{b.rooms?.name}</td>
                    <td className="p-4 text-slate-400">{formatDate(b.check_in)} → {formatDate(b.check_out)}</td>
                    <td className="p-4 text-slate-500 text-xs">{formatDateTime(b.created_at)}</td>
                    <td className="p-4 text-amber-400 font-semibold">{formatCurrency(Number(b.total_price))}</td>
                    <td className="p-4"><StatusBadge status={b.status} /></td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {b.status === "pending" && (
                          <>
                            <button onClick={() => updateBookingStatus(b.id, "confirmed")} className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded" title="Confirm"><Check className="w-4 h-4" /></button>
                            <button onClick={() => updateBookingStatus(b.id, "approved")} className="p-1 text-sky-400 hover:bg-sky-500/10 rounded" title="Approve"><Check className="w-4 h-4" /></button>
                            <button onClick={() => updateBookingStatus(b.id, "cancelled")} className="p-1 text-rose-400 hover:bg-rose-500/10 rounded" title="Cancel"><X className="w-4 h-4" /></button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <button onClick={() => updateBookingStatus(b.id, "completed")} className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded" title="Complete"><Check className="w-4 h-4" /></button>
                        )}
                        {b.payment_status === "paid" && b.status !== "cancelled" && (
                          <button
                            onClick={() => processRefund(b)}
                            disabled={refundingId === b.id}
                            className="p-1 text-rose-400 hover:bg-rose-500/10 rounded disabled:opacity-50"
                            title="Refund"
                          >
                            <Undo2 className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => printInvoice(b)} className="p-1 text-slate-400 hover:text-slate-100 rounded" title="Print Invoice"><Printer className="w-4 h-4" /></button>
                        <button
                          onClick={() => deleteBooking(b)}
                          className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
                          title="Delete reservation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && <p className="text-center text-slate-500 text-sm p-8">No bookings found.</p>}
          </div>
        )}

        {activeTab === "transport" && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Guest</th>
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Pickup</th>
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">When</th>
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Distance</th>
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Fee (DH)</th>
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Linked</th>
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Status</th>
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transportBookings.map((t) => (
                  <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors align-top">
                    <td className="p-4">
                      <p className="text-slate-100 font-medium">{t.guest_name}</p>
                      <p className="text-slate-500 text-xs">{t.guest_email}</p>
                      {t.guest_phone && <p className="text-slate-500 text-xs">{t.guest_phone}</p>}
                    </td>
                    <td className="p-4 text-slate-300 max-w-xs">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs line-clamp-2">{t.pickup_address}</p>
                          {t.flight_or_train_no && <p className="text-[10px] text-slate-500 mt-0.5">{t.flight_or_train_no}</p>}
                          <p className="text-[10px] text-slate-500">{t.passengers} pax</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">{formatDateTime(t.pickup_datetime)}</td>
                    <td className="p-4 text-slate-300">{Number(t.distance_km).toFixed(1)} km</td>
                    <td className="p-4 text-amber-400 font-semibold">{Math.round(Number(t.estimated_fee_dh))} DH</td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{t.booking_id ? t.booking_id.slice(0, 8) : "—"}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                        t.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400"
                        : t.status === "cancelled" ? "bg-rose-500/10 text-rose-400"
                        : t.status === "completed" ? "bg-sky-500/10 text-sky-400"
                        : "bg-amber-500/10 text-amber-400"
                      }`}>{t.status}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {t.status === "pending" && (
                          <>
                            <button onClick={() => updateTransportStatus(t.id, "confirmed")} className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded" title="Confirm"><Check className="w-4 h-4" /></button>
                            <button onClick={() => updateTransportStatus(t.id, "cancelled")} className="p-1 text-rose-400 hover:bg-rose-500/10 rounded" title="Cancel"><X className="w-4 h-4" /></button>
                          </>
                        )}
                        {t.status === "confirmed" && (
                          <button onClick={() => updateTransportStatus(t.id, "completed")} className="p-1 text-sky-400 hover:bg-sky-500/10 rounded" title="Mark completed"><Check className="w-4 h-4" /></button>
                        )}
                        <button onClick={() => deleteTransport(t)} className="p-1 text-rose-400 hover:bg-rose-500/10 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transportBookings.length === 0 && <p className="text-center text-slate-500 text-sm p-8">No transport requests yet.</p>}
          </div>
        )}

        {activeTab === "rooms" && (
          <div className="space-y-4">
            {rooms.map((room) => (
              <div key={room.id} className="bg-slate-900 p-6 border border-slate-800 rounded-lg flex items-center justify-between hover:border-slate-700 transition-colors">
                <div>
                  <h3 className="font-semibold text-slate-100">{room.name}</h3>
                  <p className="text-sm text-slate-400">{room.category} · {room.size}</p>
                  {editingRoomId === room.id ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-32 bg-slate-950 border border-slate-700 text-slate-100 text-sm px-3 py-1.5 rounded focus:outline-none focus:border-amber-500"
                        autoFocus
                      />
                      <span className="text-xs text-slate-500">/ night</span>
                      <button onClick={() => saveRoomPrice(room.id)} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded text-xs flex items-center gap-1">
                        <Save className="w-3 h-3" /> Save
                      </button>
                      <button onClick={() => setEditingRoomId(null)} className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded text-xs">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-amber-300">{formatCurrency(Number(room.price_per_night))}/night</span>
                      <button
                        onClick={() => { setEditingRoomId(room.id); setEditPrice(String(room.price_per_night)); }}
                        className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1"
                        title="Edit price"
                      >
                        <Pencil className="w-3 h-3" /> Edit price
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${room.is_available ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                    {room.is_available ? "Available" : "Unavailable"}
                  </span>
                  <button onClick={() => updateRoomAvailability(room.id, !room.is_available)} className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors" title="Toggle availability">
                    {room.is_available ? "Mark unavailable" : "Mark available"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "messages" && (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`bg-slate-900 p-5 border rounded-lg ${msg.is_read ? "border-slate-800" : "border-amber-500/50"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-100">{msg.name}</p>
                    <p className="text-xs text-slate-500">{msg.email} · {formatDate(msg.created_at)}</p>
                  </div>
                  {!msg.is_read && (
                    <button onClick={() => markMessageRead(msg.id)} className="text-xs text-amber-400 flex items-center gap-1 hover:text-amber-300 transition-colors">
                      <Eye className="w-3 h-3" /> Mark read
                    </button>
                  )}
                </div>
                {msg.subject && <p className="text-sm text-slate-200 font-medium mb-1">{msg.subject}</p>}
                <p className="text-sm text-slate-400">{msg.message}</p>
              </div>
            ))}
            {messages.length === 0 && <p className="text-slate-500 text-sm">No messages yet.</p>}
          </div>
        )}

        {activeTab === "surveys" && (
          <div className="space-y-4">
            {surveys.length === 0 && <p className="text-center text-slate-500 text-sm p-8">No guest surveys submitted yet.</p>}
            {surveys.map((s) => (
              <div key={s.id} className="bg-slate-900 p-6 border border-slate-800 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-100">{s.guest_name || s.guest_email}</p>
                    <p className="text-xs text-slate-500">{s.guest_email} · {formatDateTime(s.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < (s.overall_rating || 0) ? "fill-amber-400" : "text-slate-700"}`} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
                  {["cleanliness", "service", "comfort", "food"].map((k) => (
                    <div key={k} className="bg-slate-950/50 border border-slate-800 rounded px-3 py-2">
                      <p className="text-slate-500 capitalize">{k}</p>
                      <p className="text-slate-200 font-semibold">{s[k] ?? "—"}/5</p>
                    </div>
                  ))}
                </div>
                {s.comments && <p className="text-sm text-slate-300 italic border-l-2 border-amber-500/40 pl-3">"{s.comments}"</p>}
                {s.would_recommend !== null && (
                  <p className="mt-2 text-xs text-slate-400">Would recommend: <span className={s.would_recommend ? "text-emerald-400" : "text-rose-400"}>{s.would_recommend ? "Yes" : "No"}</span></p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Event ID</th>
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Type</th>
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Booking</th>
                  <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {paymentEvents.map((evt) => (
                  <tr key={evt.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-slate-200 font-mono text-xs">{evt.stripe_event_id?.slice(0, 20)}...</td>
                    <td className="p-4"><span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">{evt.event_type}</span></td>
                    <td className="p-4 text-slate-400">{evt.booking_id?.slice(0, 8) || "—"}</td>
                    <td className="p-4 text-slate-400">{formatDateTime(evt.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {paymentEvents.length === 0 && <p className="text-center text-slate-500 text-sm p-8">No payment events recorded yet.</p>}
          </div>
        )}

        {activeTab === "opera" && (
          <div className="space-y-4">
            <div className="bg-amber-500/5 p-4 border border-amber-500/30 rounded-lg mb-4">
              <p className="text-sm text-slate-300">
                Opera PMS integration is in <span className="text-amber-400 font-semibold">stub mode</span>. Configure OPERA_API_URL and OPERA_API_KEY to enable live synchronization.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Booking</th>
                    <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Action</th>
                    <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Status</th>
                    <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Date</th>
                    <th className="p-4 text-left text-[11px] tracking-wider uppercase text-slate-500">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {syncLogs.map((log) => (
                    <>
                      <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setExpandedSyncLog(expandedSyncLog === log.id ? null : log.id)}>
                        <td className="p-4 text-slate-200 font-mono text-xs">{log.booking_id?.slice(0, 8) || "—"}</td>
                        <td className="p-4"><span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 capitalize">{log.action}</span></td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-0.5 rounded capitalize ${log.status === "success" ? "bg-emerald-500/10 text-emerald-400" : log.status === "failed" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{formatDateTime(log.created_at)}</td>
                        <td className="p-4">
                          <button className="text-slate-400 hover:text-slate-100">
                            {expandedSyncLog === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                      {expandedSyncLog === log.id && (
                        <tr key={`${log.id}-detail`} className="border-b border-slate-800">
                          <td colSpan={5} className="p-4 bg-slate-950">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs tracking-wider uppercase text-slate-500 mb-2">Request Payload (OHIP Format)</p>
                                <pre className="text-xs font-mono bg-slate-900 border border-slate-800 text-emerald-300 p-3 rounded overflow-auto max-h-60">
                                  {JSON.stringify(log.request_payload, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <p className="text-xs tracking-wider uppercase text-slate-500 mb-2">Response / Error</p>
                                <pre className="text-xs font-mono bg-slate-900 border border-slate-800 text-sky-300 p-3 rounded overflow-auto max-h-60">
                                  {JSON.stringify(log.response_payload, null, 2)}
                                </pre>
                                {log.error_message && (
                                  <p className="mt-2 text-xs text-rose-400">{log.error_message}</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
              {syncLogs.length === 0 && <p className="text-center text-slate-500 text-sm p-8">No Opera PMS sync attempts yet.</p>}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
