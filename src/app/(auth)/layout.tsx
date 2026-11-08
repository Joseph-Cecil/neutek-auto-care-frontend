import type { ReactNode } from 'react';
import Image from 'next/image';
import { MECHANIC_IMAGES } from '@/config/mechanic-images';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="nt-ui authwrap split">
      <aside className="authvisual" aria-hidden>
        <Image
          src={MECHANIC_IMAGES.bayPortrait.src}
          alt=""
          fill
          priority
          sizes="(max-width: 960px) 0px, 55vw"
          className="ph-img"
        />
      </aside>
      <div className="authmain">{children}</div>
    </div>
  );
}
