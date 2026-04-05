import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  BarChart3, CalendarDays, DollarSign, Mail, BedDouble,
  Users, LogOut, Eye, Check, X, Pencil, Trash2, CreditCard, RefreshCw
} from "lucide-react";

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({ bookings: 0, revenue: 0, messages: 0, rooms: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [paymentEvents, setPaymentEvents] = useState<any[]>([]);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);

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
    const [bookingsRes, messagesRes, roomsRes] = await Promise.all([
      supabase.from("bookings").select("*, rooms(name)").order("created_at", { ascending: false }),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("rooms").select("*").order("name"),
    ]);

    const b = bookingsRes.data || [];
    const m = messagesRes.data || [];
    const r = roomsRes.data || [];

    setBookings(b);
    setMessages(m);
    setRooms(r);
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
  ];

  const statCards = [
    { label: "Total Bookings", value: stats.bookings, icon: CalendarDays, color: "text-gold" },
    { label: "Revenue", value: `€${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-teal" },
    { label: "Unread Messages", value: stats.messages, icon: Mail, color: "text-terracotta" },
    { label: "Rooms", value: stats.rooms, icon: BedDouble, color: "text-olive" },
  ];

  return (
    <div className="min-h-screen bg-cream-dark">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-charcoal text-cream p-6 hidden lg:block">
        <h2 className="text-xl font-display font-bold text-gold mb-2">Dar Lys</h2>
        <p className="text-xs text-cream/50 font-body tracking-wider uppercase mb-8">Admin Panel</p>

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-body transition-colors rounded ${
                activeTab === tab.id ? "bg-gold/20 text-gold" : "text-cream/60 hover:text-cream hover:bg-cream/5"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button onClick={() => { signOut(); navigate("/"); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-body text-cream/50 hover:text-cream transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden bg-charcoal p-4 flex items-center justify-between sticky top-0 z-30">
        <h2 className="text-lg font-display font-bold text-gold">Dar Lys Admin</h2>
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`p-2 ${activeTab === tab.id ? "text-gold" : "text-cream/50"}`}>
              <tab.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="lg:ml-64 p-6 lg:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-charcoal capitalize">{activeTab}</h1>
            <p className="text-sm text-muted-foreground font-body">Welcome back, {user?.email}</p>
          </div>
        </div>

        {activeTab === "overview" && (
          <div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((card) => (
                <div key={card.label} className="bg-cream p-6 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs tracking-wider uppercase font-body text-muted-foreground">{card.label}</span>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <p className="text-2xl font-display font-bold text-charcoal">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-cream p-6 border border-border">
              <h3 className="font-display font-semibold text-charcoal mb-4">Recent Bookings</h3>
              <div className="space-y-3">
                {bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-cream-dark border border-border text-sm font-body">
                    <div>
                      <p className="text-charcoal font-medium">{b.guest_name}</p>
                      <p className="text-muted-foreground text-xs">{b.rooms?.name} · {b.check_in} to {b.check_out}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold font-semibold">€{b.total_price}</p>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && <p className="text-muted-foreground text-sm font-body">No bookings yet.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bg-cream border border-border overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left text-xs tracking-wider uppercase text-muted-foreground">Guest</th>
                  <th className="p-4 text-left text-xs tracking-wider uppercase text-muted-foreground">Room</th>
                  <th className="p-4 text-left text-xs tracking-wider uppercase text-muted-foreground">Dates</th>
                  <th className="p-4 text-left text-xs tracking-wider uppercase text-muted-foreground">Total</th>
                  <th className="p-4 text-left text-xs tracking-wider uppercase text-muted-foreground">Status</th>
                  <th className="p-4 text-left text-xs tracking-wider uppercase text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-border hover:bg-cream-dark transition-colors">
                    <td className="p-4">
                      <p className="text-charcoal font-medium">{b.guest_name}</p>
                      <p className="text-muted-foreground text-xs">{b.guest_email}</p>
                    </td>
                    <td className="p-4 text-charcoal">{b.rooms?.name}</td>
                    <td className="p-4 text-muted-foreground">{b.check_in} → {b.check_out}</td>
                    <td className="p-4 text-gold font-semibold">€{b.total_price}</td>
                    <td className="p-4"><StatusBadge status={b.status} /></td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {b.status === "pending" && (
                          <>
                            <button onClick={() => updateBookingStatus(b.id, "confirmed")} className="p-1 text-teal hover:bg-teal/10 rounded" title="Confirm"><Check className="w-4 h-4" /></button>
                            <button onClick={() => updateBookingStatus(b.id, "cancelled")} className="p-1 text-destructive hover:bg-destructive/10 rounded" title="Cancel"><X className="w-4 h-4" /></button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <button onClick={() => updateBookingStatus(b.id, "completed")} className="p-1 text-olive hover:bg-olive/10 rounded" title="Complete"><Check className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && <p className="text-center text-muted-foreground text-sm font-body p-8">No bookings found.</p>}
          </div>
        )}

        {activeTab === "rooms" && (
          <div className="space-y-4">
            {rooms.map((room) => (
              <div key={room.id} className="bg-cream p-6 border border-border flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-charcoal">{room.name}</h3>
                  <p className="text-sm text-muted-foreground font-body">{room.category} · {room.size} · €{room.price_per_night}/night</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-body px-3 py-1 ${room.is_available ? "bg-teal/10 text-teal" : "bg-destructive/10 text-destructive"}`}>
                    {room.is_available ? "Available" : "Unavailable"}
                  </span>
                  <button onClick={() => updateRoomAvailability(room.id, !room.is_available)} className="p-2 text-muted-foreground hover:text-charcoal transition-colors" title="Toggle availability">
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
              <div key={msg.id} className={`bg-cream p-5 border ${msg.is_read ? "border-border" : "border-gold"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-display font-semibold text-charcoal">{msg.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{msg.email} · {new Date(msg.created_at).toLocaleDateString()}</p>
                  </div>
                  {!msg.is_read && (
                    <button onClick={() => markMessageRead(msg.id)} className="text-xs text-gold font-body flex items-center gap-1 hover:text-gold-dark transition-colors">
                      <Eye className="w-3 h-3" /> Mark read
                    </button>
                  )}
                </div>
                {msg.subject && <p className="text-sm font-body text-charcoal font-medium mb-1">{msg.subject}</p>}
                <p className="text-sm text-muted-foreground font-body">{msg.message}</p>
              </div>
            ))}
            {messages.length === 0 && <p className="text-muted-foreground text-sm font-body">No messages yet.</p>}
          </div>
        )}
      </main>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: "bg-gold/10 text-gold",
    confirmed: "bg-teal/10 text-teal",
    cancelled: "bg-destructive/10 text-destructive",
    completed: "bg-olive/10 text-olive",
  };
  return <span className={`text-xs font-body px-2 py-0.5 capitalize ${colors[status] || "bg-muted text-muted-foreground"}`}>{status}</span>;
};

export default AdminDashboard;
