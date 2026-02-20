import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Checkbox({
  checked,
  onChange,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded-md border transition-colors",
        checked
          ? "border-cyan-400 bg-cyan-400 text-slate-950"
          : "border-white/30 bg-transparent text-transparent",
        className,
      )}
    >
      <Check className="h-3.5 w-3.5" />
    </button>
  );
}
