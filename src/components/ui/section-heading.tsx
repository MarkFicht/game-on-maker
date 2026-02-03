// Reusable section heading component
interface SectionHeadingProps {
  children: React.ReactNode;
}

export function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h2 className="font-display text-xl font-bold text-foreground mt-6 mb-3">
      {children}
    </h2>
  );
}
