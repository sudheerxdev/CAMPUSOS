import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {hint ? <p className="text-xs text-slate-300">{hint}</p> : null}
    </Card>
  );
}
