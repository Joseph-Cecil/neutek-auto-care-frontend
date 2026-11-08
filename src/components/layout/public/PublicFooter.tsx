import { NeutekLogo } from '@/components/brand/NeutekLogo';

export function PublicFooter() {
  return (
    <footer className="foot">
      <div className="pubwrap row sb" style={{ alignItems: 'flex-start', gap: 24 }}>
        <div>
          <NeutekLogo className="brandlink" />
          <p className="muted sm" style={{ marginTop: 8 }}>14 Spintex Road, Accra</p>
        </div>
        <div>
          <div className="b">Call us</div>
          <p className="muted sm">030 277 4410</p>
        </div>
        <div>
          <div className="b">Hours</div>
          <p className="muted sm">Open 24 hours, every day</p>
        </div>
      </div>
    </footer>
  );
}
