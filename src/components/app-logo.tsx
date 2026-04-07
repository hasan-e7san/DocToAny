import Image from "next/image";
import Link from "next/link";

interface AppLogoProps {
  href?: string;
  withText?: boolean;
  size?: number;
  className?: string;
}

export function AppLogo({ href = "/", withText = true, size = 28, className = "" }: AppLogoProps) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/icons8-document-250.png"
        alt="DocToObject logo"
        width={size}
        height={size}
        className="rounded-md"
        priority
      />
      {withText ? <span className="text-sm font-semibold text-zinc-900">DocToObject</span> : null}
    </Link>
  );
}
