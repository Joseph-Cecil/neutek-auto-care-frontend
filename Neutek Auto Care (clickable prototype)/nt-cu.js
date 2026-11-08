/* Portal: the customer's own jobs, cars, quotes, invoices, notifications and profile */
(function (NT) {
  var F = NT.fmt, opts = NT.opts, pesewas = NT.pesewas;
  NT.fdef = { pname: 'Ama Mensah', pemail: 'ama.mensah@example.com', pphone: '024 411 2201', pmethod: 'Mobile money', nprio: 'Normal', vcat: 'Routine', irole: 'technician', svid: 'v4', pcat: 'Routine', pstatus: 'Draft', vmake: 'Toyota' };
  var ME = 'c1';
  var mine = function (j) { return j.cid === ME; };
  var phrase = { 'Intake': 'has been received', 'Diagnosing': 'is being diagnosed', 'Quote sent': 'has a quote waiting for you', 'Quote approved': 'is approved and waiting to start', 'In progress': 'is being worked on', 'Quality check': 'is in quality check', 'Ready for pickup': 'is ready for pickup', 'Completed': 'is done', 'Quote rejected': 'has no work booked', 'Cancelled': 'was cancelled' };
  var myQuotes = function () { return NT.quotes.filter(function (q) { var j = NT.job(q.job); return j && mine(j); }); };
  var myInvoices = function () { return NT.invoices.filter(function (i) { return i.cid === ME; }); };
  var timeline = function (j) {
    var idx = NT.JOB_FLOW.indexOf(j.status);
    return NT.JOB_FLOW.map(function (l, i) {
      var h = null; (j.hist || []).forEach(function (x) { if (x.to === l) h = x; });
      var k = i < idx ? 'done' : (i === idx ? 'cur' : 'todo');
      return { l: l, cls: k, mark: k === 'done' ? '✓' : '', cur: k === 'cur', when: k === 'todo' ? '' : (h ? F.d(h.at) : '—') };
    });
  };
  var lines = function (d) { return d.lines.map(function (l) { return { d: l.d, q: l.q, u: F.m(l.u), t: F.m(l.q * l.u) }; }); };
  var tots = function (d) { var t = NT.totals(d); return { sub: F.m(t.sub), tax: F.m(d.tax || 0), disc: F.m(d.disc || 0), total: F.m(t.total) }; };

  NT.act.push(function (A, c, s) {
    var set = A.set;
    /* vehicles */
    A.saveVehicle = function () {
      var f = c.state.f, errs = [], yr = parseInt(f.vyear, 10);
      if (!(f.vmodel || '').trim()) errs.push({ f: 'vmodel', m: 'Enter the model.' });
      if (isNaN(yr) || yr < 1980 || yr > 2027) errs.push({ f: 'vyear', m: 'Enter a year between 1980 and 2027.' });
      if (!(f.vplate || '').trim()) errs.push({ f: 'vplate', m: 'Enter the number plate.' });
      if (errs.length) return set({ errs: errs });
      NT.vehicles.push({ id: 'v' + (NT.vehicles.length + 1), cid: ME, make: f.vmake || 'Toyota', model: f.vmodel, year: yr, colour: f.vcolour || '—', plate: f.vplate, km: parseInt(String(f.vkm || '0').replace(/,/g, ''), 10) || 0 });
      set({ dlg: null, f: {} }); A.flash(f.vplate + ' added to your cars');
    };
    /* quotes */
    var quote = function () { return NT.quote(c.state.param); };
    var moveJob = function (q, to, note) {
      var j = NT.job(q.job);
      if (j && NT.MOVES[j.status].indexOf(to) >= 0) { j.hist.push({ who: 'Ama Mensah', from: j.status, to: to, note: note, at: NT.NOW }); j.status = to; j.upd = NT.NOW; if (to === 'Quote approved') j.note = 'You approved the quote. We will start soon.'; if (to === 'Quote rejected') j.note = 'You turned down the quote, so no work was done.'; }
    };
    A.approve = function () { var q = quote(); q.status = 'Approved'; moveJob(q, 'Quote approved', 'Approved online.'); set({ ask: '' }); A.flash(q.id + ' approved'); };
    A.reject = function () {
      var q = quote(), r = (c.state.f.reason || '').trim();
      if (!r) return set({ errs: [{ f: 'reason', m: 'Tell us why, so we can help.' }] });
      q.status = 'Rejected'; q.reason = r; moveJob(q, 'Quote rejected', r); set({ ask: '', errs: [] }); A.flash(q.id + ' rejected');
    };
    A.askApprove = A.askRow('approve'); A.askReject = A.askRow('reject');
    /* pay */
    var MOMO = ['MTN MoMo', 'Telecel Cash', 'AirtelTigo Money'];
    A.openPay = function (invId) { return function () { c._opener = document.activeElement; set({ dlg: { type: 'pay', inv: invId, ref: '', paid: false }, errs: [], f: Object.assign({}, c.state.f, { pmethod: 'MTN MoMo', pnum: '024 411 2201' }) }); }; };
    A.confirmPay = function () {
      var f = c.state.f, momo = MOMO.indexOf(f.pmethod || 'MTN MoMo') >= 0;
      if (momo && !/^0\d{2}[\s-]?\d{3}[\s-]?\d{4}$/.test((f.pnum || '').trim())) return set({ errs: [{ f: 'pnum', m: 'Enter the 10-digit mobile money number, like 024 411 2201.' }] });
      var i = NT.inv(c.state.dlg.inv); NT.payN++;
      var ref = 'PAY-2026-0' + NT.payN, amt = NT.balance(i), pay = { id: ref, inv: i.id, cid: i.cid, amt: amt, method: f.pmethod || 'MTN MoMo', status: 'Pending', at: NT.NOW };
      NT.payments.unshift(pay);
      set({ errs: [], dlg: Object.assign({}, c.state.dlg, { ref: ref, paid: false, amt: amt }) });
      if (momo) setTimeout(function () {
        pay.status = 'Paid'; i.paid = (i.paid || 0) + amt;
        if (c.state.dlg && c.state.dlg.ref === ref) set({ dlg: Object.assign({}, c.state.dlg, { paid: true }) });
        A.flash('Payment of GHS ' + F.m(amt) + ' received'); A.rebuild();
      }, 4200);
    };
    /* notifications */
    A.markAllRead = function () { NT.notifs.forEach(function (n) { n.read = true; }); A.flash('All notifications marked read'); A.rebuild(); };
    /* profile */
    A.saveProfile = function () {
      var f = c.state.f, errs = [];
      if (!(A.f.pname || '').trim()) errs.push({ f: 'pname', m: 'Enter your name.' });
      if (f.pnew) { if (f.pnew.length < 8) errs.push({ f: 'pnew', m: 'New password must be at least 8 characters.' }); else if (f.pnew !== f.pnew2) errs.push({ f: 'pnew2', m: 'The two passwords do not match.' }); }
      if (errs.length) return set({ errs: errs, saved: false });
      set({ errs: [], saved: true, f: Object.assign({}, f, { pnew: '', pnew2: '', pold: '' }) }); clearTimeout(c._sv); c._sv = setTimeout(function () { set({ saved: false }); }, 4000);
    };
    A.saved = !!s.saved;
    A.dx = A.dx || {};
    if (s.dlg && s.dlg.type === 'pay') {
      var i = NT.inv(s.dlg.inv);
      var pm = s.f.pmethod || 'MTN MoMo', isMomo = MOMO.indexOf(pm) >= 0;
      A.dx.pay = { inv: i.id, amt: F.m(s.dlg.amt || NT.balance(i)), done: !!s.dlg.ref, ask: !s.dlg.ref, ref: s.dlg.ref, methods: opts(MOMO.concat(['Card', 'Bank transfer'])), method: pm, momo: isMomo, num: s.f.pnum || '',
        waiting: !!s.dlg.ref && isMomo && !s.dlg.paid, paid: !!s.dlg.paid, pending: !!s.dlg.ref && !isMomo };
    }
    if (s.dlg && s.dlg.type === 'veh') A.dx.veh = { makes: opts(NT.makes) };
  });

  NT.vm.portal = function (A, c, s) {
    var jobs = NT.jobs.filter(mine).filter(NT.activeJob), j = jobs[0];
    var qs = myQuotes().filter(function (q) { return q.status === 'Sent'; }), q = qs[0];
    var od = myInvoices().filter(function (i) { return i.status === 'Overdue'; }), inv = od[0];
    var bk = NT.bookings.filter(function (b) { return b.cid === ME && b.status === 'Confirmed'; })[0];
    return {
      hasCar: !!j, noCar: !j, carText: j ? 'Your ' + NT.veh(j.vid).model + ' ' + phrase[j.status] + '.' : '', carStatus: j ? j.status : '', carPill: j ? 'pill ' + NT.pill(j.status) : 'pill', carGo: j ? A.to('my-job', j.id) : A.nav['my-jobs'], carId: j ? j.id : '',
      hasQuote: !!q, quoteText: q ? q.id + ' for GHS ' + F.m(NT.totals(q).total) : '', quoteGo: q ? A.to('my-quote', q.id) : A.nav['my-quotes'], quotesGo: A.nav['my-quotes'],
      hasInv: !!inv, invText: inv ? inv.id + ', ' + NT.overdueDays(inv) + ' days overdue' : '', invBal: inv ? F.m(NT.balance(inv)) : '', invGo: inv ? A.to('my-invoice', inv.id) : A.nav['my-invoices'], pay: inv ? A.openPay(inv.id) : A.nav['my-invoices'],
      hasBk: !!bk, bkText: bk ? F.dt(bk.at) + ', ' + bk.sv.map(function (i) { return NT.svc(i).name; }).join(', ') : '', bkId: bk ? bk.id : ''
    };
  };

  NT.vm['my-jobs'] = function (A) {
    var rows = NT.jobs.filter(mine).map(function (j) { var v = NT.veh(j.vid); return { id: j.id, title: j.title, veh: NT.vname(v) + ' · ' + v.plate, status: j.status, pill: 'pill ' + NT.pill(j.status), upd: F.d(j.upd), go: A.to('my-job', j.id) }; });
    return { rows: rows };
  };
  NT.vm['my-job'] = function (A, c, s) {
    var j = NT.job(s.param); if (!j || !mine(j)) j = NT.jobs.filter(mine)[0];
    var v = NT.veh(j.vid), off = NT.JOB_FLOW.indexOf(j.status) < 0;
    var q = NT.quotes.filter(function (x) { return x.job === j.id; })[0], inv = NT.invoices.filter(function (x) { return x.job === j.id; })[0];
    var out = { id: j.id, title: j.title, veh: NT.vname(v) + ' · ' + v.plate, status: j.status, pill: 'pill ' + NT.pill(j.status), note: j.note || 'No update yet.', dxs: j.dx ? j.dx.summary : '', hasDx: !!j.dx, flow: timeline(j), off: off, on: !off,
      offMsg: j.status === 'Cancelled' ? 'This job was cancelled.' : 'You turned down the quote, so no work was done.',
      hasQuote: !!q, quote: q ? { id: q.id, st: q.status, go: A.to('my-quote', q.id) } : null, hasInv: !!inv, inv: inv ? { id: inv.id, st: inv.status, go: A.to('my-invoice', inv.id) } : null, noLinks: !q && !inv, back: A.to('my-jobs') };
    if (NT.myJobExtra) Object.assign(out, NT.myJobExtra(A, c, s, j));
    return out;
  };

  NT.vm.vehicles = function (A) {
    return { rows: NT.vehicles.filter(function (v) { return v.cid === ME; }).map(function (v) { return { t: NT.vname(v), plate: v.plate, colour: v.colour, km: F.n(v.km) + ' km' }; }), add: A.openDlg('veh') };
  };

  NT.vm['my-quotes'] = function (A) {
    return { rows: myQuotes().map(function (q) { return { id: q.id, job: q.job, total: F.m(NT.totals(q).total), valid: F.d(q.valid), status: q.status, pill: 'pill ' + NT.pill(q.status), go: A.to('my-quote', q.id) }; }) };
  };
  NT.vm['my-quote'] = function (A, c, s) {
    var q = NT.quote(s.param); if (!q) q = myQuotes()[0];
    var j = NT.job(q.job), t = tots(q), sent = q.status === 'Sent';
    return { id: q.id, status: q.status, pill: 'pill ' + NT.pill(q.status), job: j.title, jobGo: A.to('my-job', j.id), lines: lines(q), t: t, valid: F.d(q.valid), notes: q.notes || '', hasNotes: !!q.notes, reason: q.reason,
      canAct: sent && !s.ask, askApprove: sent && s.ask === 'approve', askReject: sent && s.ask === 'reject', isApp: q.status === 'Approved', isRej: q.status === 'Rejected', isExp: q.status === 'Expired', back: A.to('my-quotes') };
  };

  NT.vm['my-invoices'] = function (A) {
    return { rows: myInvoices().map(function (i) { return { id: i.id, due: F.d(i.due), total: F.m(NT.totals(i).total), bal: F.m(NT.balance(i)), status: i.status, pill: 'pill ' + NT.pill(i.status), go: A.to('my-invoice', i.id) }; }) };
  };
  NT.vm['my-invoice'] = function (A, c, s) {
    var i = NT.inv(s.param); if (!i || i.cid !== ME) i = myInvoices()[0];
    var pend = NT.payments.filter(function (p) { return p.inv === i.id && p.status === 'Pending'; })[0], bal = NT.balance(i);
    return { id: i.id, status: i.status, pill: 'pill ' + NT.pill(i.status), lines: lines(i), t: tots(i), paid: F.m(i.paid), bal: F.m(bal), due: F.d(i.due), overdue: i.status === 'Overdue', days: NT.overdueDays(i),
      canPay: NT.openInv(i) && !pend, pending: !!pend, ref: pend ? pend.id : '', pay: A.openPay(i.id), back: A.to('my-invoices') };
  };

  NT.vm.notifications = function (A) {
    var n = NT.notifs.map(function (x) { return { text: x.text, sub: x.sub, at: F.dt(x.at), unread: !x.read, read: x.read, go: function () { x.read = true; A.go(x.to, x.p); } }; });
    return { rows: n, has: n.length > 0, anyUnread: NT.notifs.some(function (x) { return !x.read; }) };
  };
  NT.vm.profile = function (A, c, s) { return { saved: !!s.saved }; };
})(window.NT);
