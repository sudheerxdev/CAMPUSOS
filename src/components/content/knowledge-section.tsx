import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type KnowledgeItem = {
  title: string;
  description: string;
  tag?: string;
  points?: string[];
};

export function KnowledgeSection({
  title,
  description,
  items,
  className,
  columnsClassName,
}: {
  title: string;
  description?: string;
  items: KnowledgeItem[];
  className?: string;
  columnsClassName?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-xl font-bold text-white md:text-2xl">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm text-slate-300 md:text-base">{description}</p>
        ) : null}
      </div>

      <div className={cn("grid gap-4 md:grid-cols-3", columnsClassName)}>
        {items.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle>{item.title}</CardTitle>
                {item.tag ? <Badge variant="slate">{item.tag}</Badge> : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-300">{item.description}</p>
              {item.points?.length ? (
                <ul className="space-y-1 text-sm text-slate-200">
                  {item.points.map((point) => (
                    <li key={point}>- {point}</li>
                  ))}
                </ul>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
