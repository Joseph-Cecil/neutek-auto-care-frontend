'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { homeForRole } from '@/lib/utils/permissions';

const MAKES = ['Toyota', 'Mercedes-Benz', 'BMW', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Ford', 'Volkswagen'];

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const signedIn = useAuthStore((s) => s.isAuthenticated);
  const account = user ? homeForRole(user.role) : '/login';

  return (
    <div className="mk">
      <header className="nav">
        <div className="in">
          <a href="#top" className="brandlink" aria-label="Neutek Auto Care, back to top">
            <span className="mark">NT</span>
            <span>
              <span className="b" style={{ display: 'block', lineHeight: 1.1 }}>Neutek</span>
              <span className="faint sm">Auto Care</span>
            </span>
          </a>
          <nav className="links" aria-label="Page">
            <a href="#drivers">For drivers</a>
            <a href="#workshops">For the workshop</a>
            <a href="#how">How it works</a>
            <a href="#services">Services</a>
            <Link href="/tracking">Track a car</Link>
            <Link href="/blog">Blog</Link>
          </nav>
          <div className="row" style={{ marginLeft: 'auto', gap: 8, flexWrap: 'nowrap' }}>
            {signedIn ? (
              <Link href={account} className="btn ghost hide">Open my account</Link>
            ) : (
              <Link href="/login" className="btn ghost hide">Sign in</Link>
            )}
            <Link href="/booking" className="btn primary">Book service</Link>
          </div>
        </div>
      </header>
      <main id="top">
        <section className="wrap">
          <div className="hero-grid">
            <div>
              <p className="eyebrow rise">Accra&apos;s workshop you can follow</p>
              <h1 className="hero rise d1">Know where your car is, and what it costs.</h1>
              <p className="lede rise d2">
                Neutek Auto Care takes the guessing out of car repair. Book online, watch every step of the job, approve the quote from your phone and pay by mobile money, all before you collect the keys.
              </p>
              <div className="row rise d3" style={{ gap: 12, marginTop: 32 }}>
                <Link href="/booking" className="btnL p">Book a service</Link>
                <Link href="/tracking" className="btnL">Track a car</Link>
              </div>
              <p className="rise d3" style={{ marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
                Fixed prices on routine work. No work starts without your approval.
              </p>
            </div>
            <div style={{ position: 'relative', paddingBottom: 48 }}>
              <div className="ph rise d2" style={{ minHeight: 460 }}>
                <span className="cap">Photo slot: a Ghanaian driver collecting keys from a technician</span>
              </div>
              <div className="float" style={{ left: -28, bottom: 0, width: 260 }} role="img" aria-label="Example of live job tracking">
                <div className="row sb"><span className="b sm">Live tracking</span><span className="pill">Live</span></div>
                <ul className="trk">
                  <li><i />Diagnosing</li>
                  <li><i />Quote sent</li>
                  <li><i />In progress</li>
                  <li><i />Ready for pickup</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <div className="strip" aria-label="Makes we work on">
          <div className="marq" aria-hidden="true">
            {[...MAKES, ...MAKES].map((make, index) => <span key={`${make}-${index}`}>{make}</span>)}
          </div>
        </div>
        <section className="s wrap" id="drivers">
          <div>
            <p className="eyebrow">For drivers</p>
            <h2 className="sec">Your repair, without the phone calls.</h2>
            <p className="lede">Everything you used to chase the workshop for is on your phone.</p>
          </div>
          <div className="grid3" style={{ marginTop: 40 }}>
            <div className="card"><h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Book in two minutes</h3><p className="muted">Pick your services, choose a slot and you are done. No account needed for your first visit.</p></div>
            <div className="card"><h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Follow every step</h3><p className="muted">From received to ready for pickup, see exactly where your car is, with the date of each step.</p></div>
            <div className="card"><h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Approve before we start</h3><p className="muted">Every part and every hour of labour is on the quote. You say yes, or no, and give a reason.</p></div>
            <div className="card"><h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Pay the way you prefer</h3><p className="muted">Mobile money, card or bank transfer through Paystack. Your receipt and balance stay in your account.</p></div>
          </div>
        </section>
        <section className="s wrap" id="services" style={{ paddingTop: 0 }}>
          <div className="split">
            <div className="ph" style={{ minHeight: 420 }}><span className="cap">Photo slot: a customer reviewing a quote on her phone</span></div>
            <div>
              <p className="eyebrow">The quote you can trust</p>
              <h2 className="sec">Nothing starts until you say yes.</h2>
              <p className="lede">When our technician finds a problem, you get a clear quote with every line priced. Approve it from wherever you are.</p>
              <ul className="tick">
                <li>Line-by-line prices in cedis</li>
                <li>A short plain-language note on what we found</li>
                <li>Reject it with a reason and we will talk it through</li>
              </ul>
              <div style={{ marginTop: 28 }}><Link href="/services" className="btn">See services and prices</Link></div>
            </div>
          </div>
        </section>
        <section className="s wrap" id="workshops" style={{ paddingTop: 0 }}>
          <div className="split">
            <div>
              <p className="eyebrow">For the workshop</p>
              <h2 className="sec">Run the whole bay from one screen.</h2>
              <p className="lede">Bookings, jobs, quotes, invoices and payments, with the same records your customers see.</p>
              <ul className="tick">
                <li>Move jobs only along legal steps, with a history of who did what</li>
                <li>Diagnostic reports with findings and photos</li>
                <li>Record payments against open invoices</li>
                <li>Fleet accounts with credit limits</li>
              </ul>
              <div style={{ marginTop: 32 }}><Link href="/login" className="btnL p">Explore the workshop</Link></div>
            </div>
            <div className="ph" style={{ minHeight: 360 }}><span className="cap">Photo slot: technicians at work in an Accra workshop</span></div>
          </div>
        </section>
        <section className="s wrap" id="how" style={{ paddingTop: 0 }}>
          <div style={{ textAlign: 'center' }}><p className="eyebrow">How it works</p><h2 className="sec" style={{ marginLeft: 'auto', marginRight: 'auto' }}>Four steps, no surprises.</h2></div>
          <div className="steps4" style={{ marginTop: 40 }}>
            <div className="card"><h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Book</h3><p className="muted">Choose services and a time. We confirm by phone.</p></div>
            <div className="card"><h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Drop off</h3><p className="muted">We receive the car, note its condition and start diagnosing.</p></div>
            <div className="card"><h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Approve the quote</h3><p className="muted">See every line and price. Approve or decline online.</p></div>
            <div className="card"><h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Collect</h3><p className="muted">After a quality check we call you, and you pay and drive away.</p></div>
          </div>
        </section>
        <section className="s wrap" id="faq" style={{ paddingTop: 0, maxWidth: 860 }}>
          <p className="eyebrow">Questions</p>
          <h2 className="sec">Good to know before you book.</h2>
          <div className="stack s" style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <details><summary>Do I need an account to book?</summary><p>No. Give your name and phone number and we will confirm. An account lets you track cars, approve quotes and pay online.</p></details>
            <details><summary>Will you start work without asking me?</summary><p>Never. Routine services have fixed prices. Anything else is quoted first, and nothing starts until you approve it.</p></details>
            <details><summary>How can I pay?</summary><p>Online checkout uses Paystack. You can also pay at the workshop. The prototype&apos;s mobile-money brands are not a second provider.</p></details>
            <details><summary>Can I follow my car without signing in?</summary><p>Yes. Enter the job number and the last four digits of the phone on the job.</p></details>
            <details><summary>Do you serve company fleets?</summary><p>Yes. Fleet accounts are managed from the workshop.</p></details>
          </div>
        </section>
        <section className="wrap" style={{ paddingBottom: 88 }}>
          <div className="band">
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', letterSpacing: '-.025em', fontWeight: 800, margin: '0 0 12px', maxWidth: '18ch' }}>Your next service, done in the open.</h2>
            <p style={{ color: '#E7E2DA', fontSize: 18, maxWidth: '46ch', margin: '0 0 28px', lineHeight: 1.6 }}>Book in two minutes and follow the work from your phone.</p>
            <div className="row" style={{ gap: 12 }}>
              <Link href="/booking" className="btnL p">Book a service</Link>
              <Link href="/login" className="btnL">Sign in</Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="foot">
        <div className="wrap row sb" style={{ alignItems: 'flex-start', gap: 32 }}>
          <div><div className="row" style={{ gap: 12 }}><span className="mark">NT</span><b>Neutek Auto Care</b></div><p className="muted sm" style={{ marginTop: 12 }}>14 Spintex Road, Accra</p></div>
          <div><b>Call us</b><p className="muted sm" style={{ marginTop: 6 }}>030 277 4410</p></div>
          <div><b>Hours</b><p className="muted sm" style={{ marginTop: 6 }}>Mon to Fri 07:30 to 18:00<br />Sat 08:00 to 15:00</p></div>
        </div>
      </footer>
    </div>
  );
}
