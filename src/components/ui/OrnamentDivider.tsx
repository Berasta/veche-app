export function OrnamentDivider({ label }: { label?: string }) {
  return (
    <div className="ornament-divider">
      {label ? <span>{label}</span> : <span>❦</span>}
    </div>
  );
}
