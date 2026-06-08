import { cn } from "@/lib/cn";

export function Container({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  return (
    <Tag className={cn("mx-auto w-full max-w-shell px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </Tag>
  );
}
