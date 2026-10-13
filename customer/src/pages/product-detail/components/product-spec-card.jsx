export default function ProductSpecCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-background p-4">
      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="size-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}