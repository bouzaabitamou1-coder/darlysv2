import { useState, useRef } from "react";
import { Upload, FileText, Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickOrderItem {
  slug: string;
  nights: number;
  guests: number;
  checkIn: string;
  checkOut: string;
  room?: any;
  error?: string;
}

export const QuickOrder = ({ onOrderComplete }: { onOrderComplete?: () => void }) => {
  const [items, setItems] = useState<QuickOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualSlug, setManualSlug] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split("T")[0];
  const defaultCheckIn = today;
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      const newItems: QuickOrderItem[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        if (cols.length >= 3) {
          newItems.push({
            slug: cols[0],
            checkIn: cols[1] || defaultCheckIn,
            checkOut: cols[2] || tomorrow,
            nights: Math.max(1, Math.ceil((new Date(cols[2] || tomorrow).getTime() - new Date(cols[1] || defaultCheckIn).getTime()) / 86400000)),
            guests: parseInt(cols[3]) || 1,
          });
        }
      }

      if (newItems.length === 0) {
        toast.error("No valid rows found. CSV format: room_slug, check_in, check_out, guests");
        return;
      }

      setItems((prev) => [...prev, ...newItems]);
      toast.success(`${newItems.length} room(s) added from CSV`);
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const addManualItem = () => {
    if (!manualSlug.trim()) return;
    setItems((prev) => [
      ...prev,
      { slug: manualSlug.trim(), checkIn: defaultCheckIn, checkOut: tomorrow, nights: 1, guests: 1 },
    ]);
    setManualSlug("");
  };

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const resolveRooms = async () => {
    setLoading(true);
    const resolved = [...items];
    const slugs = [...new Set(items.map((i) => i.slug))];
    const { data: rooms } = await supabase.from("rooms").select("*").in("slug", slugs);

    for (const item of resolved) {
      const room = rooms?.find((r) => r.slug === item.slug);
      if (room) {
        item.room = room;
        item.error = undefined;
      } else {
        item.error = "Room not found";
      }
    }

    setItems(resolved);
    setLoading(false);

    const valid = resolved.filter((i) => !i.error);
    if (valid.length === 0) {
      toast.error("No valid rooms found. Check room slugs.");
    } else {
      toast.success(`${valid.length} room(s) resolved. Ready to book.`);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Quick Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter room slug (e.g. la-classique)"
            value={manualSlug}
            onChange={(e) => setManualSlug(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addManualItem()}
          />
          <Button variant="outline" size="sm" onClick={addManualItem}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2">
            <Upload className="w-4 h-4" /> Upload CSV
          </Button>
          <span className="text-xs text-muted-foreground">Format: room_slug, check_in, check_out, guests</span>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
        </div>

        {items.length > 0 && (
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-2 text-left text-xs font-medium text-muted-foreground">Room</th>
                  <th className="p-2 text-left text-xs font-medium text-muted-foreground">Check-in</th>
                  <th className="p-2 text-left text-xs font-medium text-muted-foreground">Check-out</th>
                  <th className="p-2 text-left text-xs font-medium text-muted-foreground">Guests</th>
                  <th className="p-2 text-xs font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className={`border-t border-border ${item.error ? "bg-destructive/5" : ""}`}>
                    <td className="p-2 font-medium">{item.room?.name || item.slug} {item.error && <span className="text-xs text-destructive">({item.error})</span>}</td>
                    <td className="p-2 text-muted-foreground">{item.checkIn}</td>
                    <td className="p-2 text-muted-foreground">{item.checkOut}</td>
                    <td className="p-2 text-muted-foreground">{item.guests}</td>
                    <td className="p-2">
                      <button onClick={() => removeItem(idx)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {items.length > 0 && (
          <Button onClick={resolveRooms} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Resolving rooms..." : `Validate ${items.length} Room(s)`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
