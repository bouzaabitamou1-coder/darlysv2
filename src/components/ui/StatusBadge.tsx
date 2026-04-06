import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  pending: { label: "Pending", variant: "outline", className: "border-amber-400 text-amber-600 bg-amber-50" },
  confirmed: { label: "Confirmed", variant: "default", className: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  approved: { label: "Approved", variant: "default", className: "bg-blue-100 text-blue-700 border-blue-300" },
  shipped: { label: "Shipped", variant: "default", className: "bg-indigo-100 text-indigo-700 border-indigo-300" },
  cancelled: { label: "Cancelled", variant: "destructive", className: "bg-red-50 text-red-600 border-red-300" },
  completed: { label: "Completed", variant: "default", className: "bg-emerald-50 text-emerald-600 border-emerald-300" },
};

export const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] || { label: status, variant: "outline" as const, className: "text-muted-foreground" };
  return (
    <Badge variant={config.variant} className={`text-xs font-medium capitalize ${config.className}`}>
      {config.label}
    </Badge>
  );
};
