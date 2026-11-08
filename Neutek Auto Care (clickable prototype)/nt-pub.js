/* Public — marketing site, booking, tracking, and the auth form actions */
(function (NT) {
  var F = NT.fmt;
  NT.act.push(function (A, c, s) {
    var set = A.set;
    A.routeIs = new Proxy({}, { get: function (t, k) { return A.route === String(k).replace(/_/g, '-'); } });
    A.isHome = A.route === 'home'; A.isPubPage = A.isPub && !A.isHome;
    /* auth */
    A.pwHint = (s.f && s.f.password && s.f.password.length < 8 && A.ec.password) ? A.eh.password : 'Use at least 8 characters.';
    A.forgotSent = !!s.forgotSent; A.forgotOpen = !s.forgotSent;
    A.submitRegister = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      var f = c.state.f, errs = [];
      if (!f.first) errs.push({ f: 'first', m: 'Enter your first name.' });
      if (!f.last) errs.push({ f: 'last', m: 'Enter your last name.' });
      if (!f.email || f.email.indexOf('@') < 1) errs.push({ f: 'email', m: 'Enter a valid email.' });
      if (!f.phone) errs.push({ f: 'phone', m: 'Enter your phone number.' });
      if (!f.password || f.password.length < 8) errs.push({ f: 'password', m: 'Password must be at least 8 characters.' });
      if (errs.length) return set({ errs: errs });
      set({ f: {}, errs: [] }); A.go('signin'); A.flash('Account created. Sign in to continue.');
    };
    A.submitForgot = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      if (!c.state.f.email) return set({ errs: [{ f: 'email', m: 'Enter your email.' }] });
      set({ forgotSent: true, errs: [] });
    };
    A.submitReset = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      var f = c.state.f, errs = [];
      if (!f.password || f.password.length < 8) errs.push({ f: 'password', m: 'Password must be at least 8 characters.' });
      else if (f.password !== f.pw2) errs.push({ f: 'pw2', m: 'The two passwords do not match.' });
      if (errs.length) return set({ errs: errs });
      set({ f: {}, errs: [], forgotSent: false }); A.go('signin'); A.flash('Password changed. Sign in with the new one.');
    };
    /* booking */
    var sel = (s.f && s.f.sel) || [];
    A.toggleSvc = function (id) { return function () { var cur = (c.state.f.sel || []).slice(), i = cur.indexOf(id); if (i < 0) cur.push(id); else cur.splice(i, 1); set({ f: Object.assign({}, c.state.f, { sel: cur }), booked: '' }); }; };
    A.bookSvc = function (id) { return function () { set({ f: Object.assign({}, c.state.f, { sel: [id] }), step: 1, booked: '' }); A.go('book'); }; };
    A.goStep = function (n) { return function () { set({ step: n, booked: '', errs: [] }); }; };
    A.nextStep = function () {
      var f = c.state.f, st = c.state.step, errs = [];
      if (st === 1 && !(f.sel && f.sel.length)) errs.push({ f: 'sel', m: 'Choose at least one service.' });
      if (st === 2) {
        if (!f.date) errs.push({ f: 'date', m: 'Pick a date.' });
        else if (f.date + 'T' + (f.time || '00:00') < '2026-10-24T11:42') errs.push({ f: 'date', m: 'The earliest slot is two hours from now: 24 Oct 2026 at 11:42.' });
        if (!f.time) errs.push({ f: 'time', m: 'Pick a time.' });
      }
      if (st === 3 && c.state.role !== 'customer') {
        if (!f.bname) errs.push({ f: 'bname', m: 'Enter your name.' });
        if (!f.bphone) errs.push({ f: 'bphone', m: 'Enter your phone number.' });
      }
      if (errs.length) return set({ errs: errs });
      set({ step: st + 1, errs: [] });
    };
    A.prevStep = function () { set({ step: Math.max(1, c.state.step - 1), errs: [] }); };
    A.confirmBooking = function () {
      var f = c.state.f, cu = c.state.role === 'customer';
      var b = { id: 'BK-2026-015', cid: cu ? 'c1' : '', guest: cu ? '' : f.bname, phone: cu ? '' : f.bphone, note: cu ? '' : (f.bcar || ''), vid: cu ? (f.bveh || 'v1') : '', sv: (f.sel || []).slice(), at: f.date + 'T' + f.time, status: 'Pending' };
      NT.bookings = NT.bookings.filter(function (x) { return x.id !== b.id; }); NT.bookings.unshift(b);
      set({ booked: b.id });
    };
    A.newBooking = function () { set({ booked: '', step: 1, f: {} }); };
    A.pubMenuGo = function (r) { return function () { A.go(r); }; };
    /* tracking */
    A.submitTrack = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      var q = (c.state.f.trackq || '').toUpperCase().replace(/\s+/g, '');
      if (!q) return set({ errs: [{ f: 'trackq', m: 'Enter a job number or plate.' }], trackMiss: false });
      var hit = null;
      NT.jobs.forEach(function (j) { var v = NT.veh(j.vid); if (j.id.replace(/\s+/g, '') === q || (v && v.plate.replace(/\s+/g, '') === q)) { if (!hit || NT.activeJob(j)) hit = j; } });
      if (hit) { set({ trackMiss: false, errs: [] }); A.go('track-job', hit.id); } else set({ trackMiss: true, errs: [] });
    };
    A.trackMiss = !!s.trackMiss;
    A.trackSample = function () { A.setF({ trackq: 'JOB-2026-088' }); };
    A.openArticle = function (id) { return function () { A.go('article', id); }; };
  });

  /* Public view models: one builder serves every public route */
  var pubVm = function (A, c, s) {
    var f = s.f || {}, sel = f.sel || [], v = {};
    v.reasons = [['Honest quotes', 'You see the price and approve it before we touch the car.'], ['Follow the repair', 'Track your car online, step by step, from drop-off to pickup.'], ['Checked twice', 'Every job gets a quality check by a second technician before handover.'], ['Fixed prices for routine work', 'Oil, brakes, alignment and AC are priced right here on this site.']].map(function (r) { return { t: r[0], d: r[1] }; });
    var act = NT.services.filter(function (x) { return x.active; });
    v.services = act.map(function (x) { return { name: x.name, cat: x.cat, desc: x.desc, price: F.m(x.price), mins: x.mins, go: A.bookSvc(x.id) }; });
    var cats = [];
    act.forEach(function (x) { if (cats.indexOf(x.cat) < 0) cats.push(x.cat); });
    v.groups = cats.map(function (k) { return { cat: k, items: v.services.filter(function (x) { return x.cat === k; }) }; });
    v.makes = ['Toyota', 'Mercedes-Benz', 'BMW', 'Honda', 'Nissan', 'Hyundai'].map(function (m) { return { m: m }; });
    v.quotes = [['Booked at night, car back by Friday. The tracking page saved me three phone calls.', 'Ama M., East Legon'], ['They showed me the worn pads and the price before starting. No surprises on the invoice.', 'Kofi A., Accra'], ['Plain talk, fair prices. My C200 has never braked better.', 'Abena O., Osu']].map(function (q) { return { t: q[0], by: q[1] }; });
    /* booking */
    var st = s.step || 1, cu = s.role === 'customer', total = 0;
    v.pick = act.map(function (x) { var on = sel.indexOf(x.id) >= 0; if (on) total += x.price; return { name: x.name, sub: x.cat + ' · ' + x.mins + ' min', price: F.m(x.price), on: on, cls: 'chk' + (on ? ' on' : ''), pressed: on ? 'true' : 'false', toggle: A.toggleSvc(x.id) }; });
    v.total = F.m(total); v.hasSel = sel.length > 0;
    v.picked = sel.map(function (id) { var x = NT.svc(id); return { name: x.name, price: F.m(x.price) }; });
    v.steps = ['Services', 'Date and time', 'Your details', 'Confirm'].map(function (l, i) { return { n: i + 1, l: l, cls: 'pill' + (st === i + 1 ? ' brand' : (st > i + 1 ? ' ok' : '')), go: A.goStep(i + 1), can: i + 1 < st }; });
    v.st1 = st === 1; v.st2 = st === 2; v.st3 = st === 3; v.st4 = st === 4;
    v.done = !!s.booked; v.notDone = !s.booked; v.bookingNo = s.booked;
    v.isCu = cu; v.isGuest = !cu;
    v.times = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(function (t) { return { t: t }; });
    v.myVehicles = NT.vehicles.filter(function (x) { return x.cid === 'c1'; }).map(function (x) { return { id: x.id, t: NT.vname(x) + ' · ' + x.plate }; });
    v.when = f.date ? F.d(f.date) + ' at ' + (f.time || '—') : '—';
    v.who = cu ? 'Ama Mensah · ' + (NT.vname(NT.veh(f.bveh || 'v1'))) : ((f.bname || '—') + ' · ' + (f.bphone || '—'));
    v.hasPrev = st > 1; v.notLast = st < 4;
    /* track */
    var j = NT.job(A.param) || NT.job('JOB-2026-088');
    if (A.route === 'track-job' && j) {
      var veh = NT.veh(j.vid), idx = NT.JOB_FLOW.indexOf(j.status);
      v.job = { id: j.id, title: j.title, status: j.status, pill: 'pill ' + NT.pill(j.status), veh: NT.vname(veh), plate: veh.plate, off: idx < 0, on: idx >= 0 };
      v.offMsg = j.status === 'Cancelled' ? 'This job was cancelled. Call the workshop on 030 277 4410 if you have questions.' : 'The quote was declined, so no work was done on the car.';
      v.flow = NT.JOB_FLOW.map(function (l, i) {
        var h = null; (j.hist || []).forEach(function (x) { if (x.to === l) h = x; });
        var k = i < idx ? 'done' : (i === idx ? 'cur' : 'todo');
        return { l: l, cls: k, mark: k === 'done' ? '✓' : '', cur: k === 'cur', when: k === 'todo' ? '' : (h ? F.d(h.at) : '—') };
      });
    }
    v.trackPlaceholder = 'JOB-2026-088 or GR 4521-22';
    /* blog */
    var pubd = NT.posts.filter(function (p) { return p.status === 'Published'; });
    v.posts = pubd.map(function (p) { return { id: p.id, t: p.title, cat: p.cat, d: F.d(p.at), feat: p.feat, span: p.feat ? 'grid-column:1/-1' : '', open: A.openArticle(p.id) }; });
    var art = NT.by(NT.posts, A.param) || pubd[0];
    v.art = { t: art.title, d: F.d(art.at), cat: art.cat, paras: art.body.length > 1 ? art.body.map(function (b) { return { b: b }; }) : NT.posts[0].body.map(function (b) { return { b: b }; }) };
    return v;
  };
  ['home', 'services', 'book', 'track', 'track-job', 'blog', 'article'].forEach(function (r) { NT.vm[r] = pubVm; });
})(window.NT);
