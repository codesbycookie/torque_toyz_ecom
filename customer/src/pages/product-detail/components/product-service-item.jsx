export default function ProductServiceItem({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5 rounded-lg border bg-muted/40 px-2 py-3">
      <Icon className="size-5 text-primary" />
      <p className="text-xs font-semibold leading-tight">{title}</p>
      <p className="text-[11px] text-muted-foreground leading-tight">
        {description}
      </p>
    </div>
  );
}