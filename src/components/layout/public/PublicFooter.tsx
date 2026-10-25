export function PublicFooter() {
  return (
    <footer className="foot">
      <div className="pubwrap row sb" style={{ alignItems: 'flex-start', gap: 24 }}>
        <div>
          <div className="b">Neutek Auto Care</div>
          <p className="muted sm">14 Spintex Road, Accra</p>
        </div>
        <div>
          <div className="b">Call us</div>
          <p className="muted sm">030 277 4410</p>
        </div>
        <div>
          <div className="b">Hours</div>
          <p className="muted sm">
            Mon to Fri 07:30 to 18:00
            <br />
            Sat 08:00 to 15:00
          </p>
        </div>
      </div>
    </footer>
  );
}
