import Image from "next/image";
import { cn } from "@/lib/utils";

interface DetailBannerProps {
  banner: string | null;
  title: string;
  color?: string | null;
  className?: string;
}

export function DetailBanner({ banner, title, color, className }: DetailBannerProps) {
  return (
    <div
      className={cn(
        "relative w-full h-48 sm:h-64 md:h-80 overflow-hidden bg-muted",
        className
      )}
      style={!banner && color ? { backgroundColor: color } : undefined}
    >
      {banner && (
        <Image
          src={banner}
          alt={`${title} banner`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      )}
      {/* Gradient overlay bottom-to-top */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
    </div>
  );
}
