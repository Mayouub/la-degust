import { cn } from "@/lib/utils";

interface SectionDividerProps {
  variant?: "wave" | "dots";
  className?: string;
  /** Invert pour sections sombres (marine) */
  inverted?: boolean;
}

export function SectionDivider({
  variant = "wave",
  className,
  inverted = false,
}: SectionDividerProps) {
  if (variant === "dots") {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 py-6",
          className
        )}
        aria-hidden
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              "rounded-full",
              i === 2 ? "h-1.5 w-1.5" : "h-1 w-1",
              inverted ? "bg-kraft/60" : "bg-kraft"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("w-full overflow-hidden leading-none", className)}
      aria-hidden
    >
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        className="h-8 w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,20 C150,5 300,35 450,20 C600,5 750,35 900,20 C1050,5 1150,30 1200,20"
          fill="none"
          stroke={inverted ? "rgba(201,181,143,0.4)" : "rgba(201,181,143,0.7)"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
