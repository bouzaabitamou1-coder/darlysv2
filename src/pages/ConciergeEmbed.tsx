import ConciergeChat from "@/components/ConciergeChat";
import { useTenant } from "@/contexts/TenantContext";

/**
 * Standalone route for the embedded concierge widget (loaded inside an iframe
 * from external sites via /embed/concierge.js).
 */
const ConciergeEmbed = () => {
  const { tenant, loading } = useTenant();
  if (loading) return <div className="p-4 text-sm text-muted-foreground">Loading…</div>;
  return (
    <div className="min-h-screen bg-transparent">
      <div className="p-4 text-xs text-muted-foreground">
        {tenant.name} · {tenant.concierge_name ?? "Concierge"}
      </div>
      <ConciergeChat />
    </div>
  );
};

export default ConciergeEmbed;