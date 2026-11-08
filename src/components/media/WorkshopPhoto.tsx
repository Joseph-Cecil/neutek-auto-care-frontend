import type { CSSProperties } from 'react';
import Image from 'next/image';
import { MECHANIC_IMAGES, type MechanicImageKey } from '@/config/mechanic-images';

type WorkshopPhotoProps = {
  image: MechanicImageKey;
  caption?: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  /** Soften the photo for text overlays (auth / CTA bands). */
  dim?: boolean;
};

export function WorkshopPhoto({
  image,
  caption,
  className = 'ph',
  style,
  priority = false,
  dim = false,
}: WorkshopPhotoProps) {
  const asset = MECHANIC_IMAGES[image];

  return (
    <div className={`${className}${dim ? ' dim' : ''}`} style={style}>
      <Image
        src={asset.src}
        alt={asset.alt}
        fill
        sizes="(max-width: 800px) 100vw, 50vw"
        className="ph-img"
        priority={priority}
      />
      {caption ? <span className="cap">{caption}</span> : null}
    </div>
  );
}
