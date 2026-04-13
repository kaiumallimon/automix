import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";
type LogoTone = "light" | "dark";

interface LogoProps {
  size?: LogoSize;
  tone?: LogoTone;
  descriptor?: string;
  className?: string;
}

const sizeMap: Record<
  LogoSize,
  {
    gap: string;
    mark: string;
    word: string;
    descriptor: string;
  }
> = {
  sm: {
    gap: "gap-2",
    mark: "h-6 w-6",
    word: "text-lg",
    descriptor: "text-[10px]",
  },
  md: {
    gap: "gap-2.5",
    mark: "h-8 w-8",
    word: "text-[1.45rem]",
    descriptor: "text-[10px]",
  },
  lg: {
    gap: "gap-3",
    mark: "h-10 w-10",
    word: "text-[1.8rem]",
    descriptor: "text-[11px]",
  },
};

const toneMap: Record<
  LogoTone,
  {
    frame: string;
    frameInset: string;
    word: string;
    descriptor: string;
    accent: string;
    pillar: string;
  }
> = {
  light: {
    frame:
      "border-black/15 bg-[linear-gradient(150deg,rgba(255,255,255,0.95),rgba(0,113,227,0.12))]",
    frameInset: "border-black/10",
    word: "text-black",
    descriptor: "text-black/58",
    accent: "text-[#0071e3]",
    pillar: "bg-[#0071e3]",
  },
  dark: {
    frame:
      "border-white/30 bg-[linear-gradient(150deg,rgba(255,255,255,0.18),rgba(0,113,227,0.45))]",
    frameInset: "border-white/35",
    word: "text-white",
    descriptor: "text-white/65",
    accent: "text-[#8cc8ff]",
    pillar: "bg-[#9fd0ff]",
  },
};

export function Logo({
  size = "md",
  tone = "light",
  descriptor,
  className,
}: LogoProps) {
  const selectedSize = sizeMap[size];
  const selectedTone = toneMap[tone];

  return (
    <div className={cn("inline-flex items-center", selectedSize.gap, className)}>
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center border",
          selectedSize.mark,
          selectedTone.frame
        )}
      >
        <span className={cn("absolute inset-[3px] border", selectedTone.frameInset)} />
        <span className={cn("relative h-[52%] w-[2px]", selectedTone.pillar)} />
      </span>

      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-[var(--font-apple-display)] font-semibold tracking-[-0.03em]",
            selectedSize.word,
            selectedTone.word
          )}
        >
          Auto<span className={selectedTone.accent}>mix</span>
        </span>

        {descriptor ? (
          <span
            className={cn(
              "font-[var(--font-apple-mono)] uppercase tracking-[0.18em]",
              selectedSize.descriptor,
              selectedTone.descriptor
            )}
          >
            {descriptor}
          </span>
        ) : null}
      </span>
    </div>
  );
}