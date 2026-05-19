import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  BarChart3, CalendarDays, DollarSign, Mail, BedDouble,
  Users, LogOut, Eye, Check, X, Pencil, Trash2, CreditCard, RefreshCw, Printer, Undo2, ChevronDown, ChevronUp
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
    const [bookingsRes, messagesRes, roomsRes, eventsRes, syncRes] = await Promise.all([
      supabase.from("bookings").select("*, rooms(name)").order("created_at", { ascending: false }),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("rooms").select("*").order("name"),
      supabase.from("payment_events").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("opera_sync_log").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

    const b = bookingsRes.data || [];
    const m = messagesRes.data || [];
    const r = roomsRes.data || [];

    setBookings(b);
    setMessages(m);
    setRooms(r);
    setPaymentEvents(eventsRes.data || []);
    setSyncLogs(syncRes.data || []);
    setStats({
      bookings: b.length,
      revenue: b.filter((x) => x.payment_status === "paid").reduce((s, x) => s + Number(x.total_price), 0),
      messages: m.filter((x) => !x.is_read).length,
      rooms: r.length,
    });
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

  if (loading || !isAdmin) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "bookings", label: "Bookings", icon: CalendarDays },
    { id: "rooms", label: "Rooms", icon: BedDouble },
    { id: "messages", label: "Messages", icon: Mail },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "opera", label: "Opera PMS", icon: RefreshCw },
  ];

  const statCards = [
    { label: "Total Bookings", value: stats.bookings, icon: CalendarDays, color: "text-gold" },
    { label: "Revenue", value: formatCurrency(stats.revenue), icon: DollarSign, color: "text-teal" },
    { label: "Unread Messages", value: stats.messages, icon: Mail, color: "text-terracotta" },
    { label: "Rooms", value: stats.rooms, icon: BedDouble, color: "text-olive" },
  ];

  return (
    <div dir="ltr" className="min-h-screen bg-slate-950 text-slate-100 font-sans" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 text-slate-200 p-6 hidden lg:block">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-sm">D</div>
          <h2 className="text-lg font-semibold text-amber-400 tracking-tight">Dar Lys</h2>
        </div>
        <p className="text-[10px] text-slate-500 tracking-[0.25em] uppercase mb-8 ml-10">Control Center</p>

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all rounded-md ${
                activeTab === tab.id
                  ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-400"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border-l-2 border-transparent"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button onClick={() => { signOut(); navigate("/"); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-500 hover:text-slate-100 hover:bg-slate-800/60 rounded-md transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30">
        <h2 className="text-base font-semibold text-amber-400">Dar Lys · Admin</h2>
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`p-2 rounded-md ${activeTab === tab.id ? "text-amber-400 bg-amber-500/10" : "text-slate-500"}`}>
              <tab.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="lg:ml-64 p-6 lg:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 capitalize tracking-tight">{activeTab}</h1>
            <p className="text-sm text-slate-400">Welcome back, {user?.email}</p>
          </div>
        </div>

        {activeTab === "overview" && (
          <div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((card) => (
                <div key={card.label} className="bg-slate-900 p-6 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
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

        {activeTab === "rooms" && (
          <div className="space-y-4">
            {rooms.map((room) => (
              <div key={room.id} className="bg-slate-900 p-6 border border-slate-800 rounded-lg flex items-center justify-between hover:border-slate-700 transition-colors">
                <div>
                  <h3 className="font-semibold text-slate-100">{room.name}</h3>
                  <p className="text-sm text-slate-400">{room.category} · {room.size} · {formatCurrency(Number(room.price_per_night))}/night</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${room.is_available ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                    {room.is_available ? "Available" : "Unavailable"}
                  </span>
                  <button onClick={() => updateRoomAvailability(room.id, !room.is_available)} className="p-2 text-slate-400 hover:text-slate-100 transition-colors" title="Toggle availability">
                    <Pencil className="w-4 h-4" />
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
