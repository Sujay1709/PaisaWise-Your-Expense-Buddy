import { Link } from "@tanstack/react-router";

import logo from "@/assets/paisawise-logo.png";
import { cn } from "@/lib/utils";

export function PaisaWiseMark({
  className,
  size = 36,
  eager = false,
}: {
  className?: string;
  size?: number;
  eager?: boolean;
}) {
  return (
    <img
      src={logo}
      alt="PaisaWise logo"
      width={size}
      height={size}
      loading={eager ? "eager" : "lazy"}
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
    />
  );
}

export function PaisaWiseWordmark({
  className,
  markSize = 32,
  eager = false,
}: {
  className?: string;
  markSize?: number;
  eager?: boolean;
}) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <PaisaWiseMark size={markSize} eager={eager} />
      <span className="font-display text-xl font-extrabold tracking-tight">
        Paisa<span className="text-brand">Wise</span>
      </span>
    </Link>
  );
}
