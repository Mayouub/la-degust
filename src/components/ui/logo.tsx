import Image from "next/image";

type LogoVariant = "encre" | "blanc" | "bleu" | "beurre";

const sizes: Record<string, { width: number; height: number }> = {
  sm: { width: 120, height: 36 },
  md: { width: 180, height: 54 },
  lg: { width: 240, height: 72 },
};

interface LogoProps {
  variant?: LogoVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ variant = "encre", size = "md", className }: LogoProps) {
  const { width, height } = sizes[size];

  return (
    <Image
      src={`/logo/logo-${variant}.svg`}
      alt="La Dégust' du Grand Coin"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
