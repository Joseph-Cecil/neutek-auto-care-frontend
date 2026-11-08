import Image from 'next/image';
import Link from 'next/link';

type NeutekLogoProps = {
  href?: string;
  /** Compact shield for nav/shell marks, or full lockup for auth/hero brand. */
  variant?: 'mark' | 'lockup';
  /** When using mark, also show Neutek / Auto Care text beside it. */
  showWordmark?: boolean;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
};

export function NeutekLogo({
  href = '/home',
  variant = 'mark',
  showWordmark = true,
  className,
  priority = false,
  onClick,
}: NeutekLogoProps) {
  const content =
    variant === 'lockup' ? (
      <Image
        src="/brand/logo-lockup.png"
        alt="Neutek Autocare"
        width={246}
        height={100}
        className="logo-lockup"
        priority={priority}
      />
    ) : (
      <>
        <span className="mark" aria-hidden={showWordmark}>
          <Image
            src="/brand/logo-mark.png"
            alt={showWordmark ? '' : 'Neutek Autocare'}
            width={72}
            height={72}
            priority={priority}
          />
        </span>
        {showWordmark ? (
          <span className="t">
            <span className="b" style={{ display: 'block', lineHeight: 1.1 }}>
              Neutek
            </span>
            <span className="faint sm" style={{ color: 'var(--color-nt-accent)' }}>
              Auto Care
            </span>
          </span>
        ) : null}
      </>
    );

  return (
    <Link
      href={href}
      className={className ?? 'brand'}
      aria-label="Neutek Auto Care home"
      onClick={onClick}
    >
      {content}
    </Link>
  );
}
