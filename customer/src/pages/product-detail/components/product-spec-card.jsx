export default function ProductSpecCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-background p-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}