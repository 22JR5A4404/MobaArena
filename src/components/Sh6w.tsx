import Link from "next/link";

export default function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h2 className="font-[family-name:var(--font-press-start)] text-sm sm:text-base text-primary crt-glow-green mb-2">{title}</h2>
        {subtitle && <p className="font-[family-name:var(--font-vt323)] text-lg text-text-muted">{subtitle}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="font-[family-name:var(--font-press-start)] text-[8px] text-secondary hover:text-primary transition-colors shrink-0"
        >
          {action.label} &gt;&gt;
        </Link>
      )}
    </div>
  );
}
