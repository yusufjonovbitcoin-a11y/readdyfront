import type { ReactNode } from "react";

interface ResponsiveTableProps {
  children: ReactNode;
  minWidthClassName?: string;
  caption?: string;
  className?: string;
}

export default function ResponsiveTable({
  children,
  minWidthClassName,
  caption,
  className = "",
}: ResponsiveTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${minWidthClassName ?? ""} ${className}`}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

