/* Workshop: customers and finance (quotes, invoices, payments) */
(function (NT) {
  var F = NT.fmt, opts = NT.opts;
  var norm = function (x) { return String(x || '').toLowerCase().replace(/\s+/g, ''); };
  var pesewas = function (x) { var n = parseFloat(String(x).replace(/,/g, '')); return isNaN(n) ? NaN : Math.round(n * 100); };
  NT.pesewas = pesewas;
  NT.payN = 29;
  var openInv = function (i) { return ['Paid', 'Cancelled', 'Draft'].indexOf(i.status) < 0 && NT.balance(i) > 0; };
  NT.openInv = openInv;
  var who = function (c) { var a = NT.ACCOUNTS[c.state.acct]; return a ? a.name : 'Workshop'; };
  var lineRows = function (d) { return d.lines.map(function (l) { return { d: l.d, q: l.q, u: F.m(l.u), t: F.m(l.q * l.u) }; }); };
  var totals = function (d) {
    var t = NT.totals(d);
    return { sub: F.m(t.sub), tax: d.tax ? F.m(d.tax) : '0.00', taxZero: !d.tax, disc: d.disc ? F.m(d.disc) : '0.00', discZero: !d.disc, total: F.m(t.total) };
  };

  NT.act.push(function (A, c, s) {
    var set = A.set;
    /* customers */
    A.saveCust = function () {
      var f = c.state.f, errs = [];
      if (!(f.cname || '').trim()) errs.push({ f: 'cname', m: 'Enter the customer name.' });
      if (!(f.cphone || '').trim()) errs.push({ f: 'cphone', m: 'Enter a phone number.' });
      if (errs.length) return set({ errs: errs });
      NT.customers.push({ id: 'c' + (NT.customers.length + 1), name: f.cname, phone: f.cphone, email: f.cemail || '', area: '', fleet: false });
      set({ dlg: null, f: {} }); A.flash(f.cname + ' added');
    };
    /* quotes */
    A.sendQuote = function (q) {
      return function () {
        q.status = 'Sent'; var j = NT.job(q.job);
        if (j && NT.MOVES[j.status].indexOf('Quote sent') >= 0) { j.hist.push({ who: who(c), from: j.status, to: 'Quote sent', note: q.id + ' sent.', at: NT.NOW }); j.status = 'Quote sent'; j.upd = NT.NOW; }
        j.quote = q.id; A.flash(q.id + ' sent to the customer'); A.rebuild();
      };
    };
    /* invoices */
    A.sendInvoice = function (i) { return function () { i.status = 'Sent'; A.flash(i.id + ' sent'); A.rebuild(); }; };
    A.openRec = function (invId) {
      return function () {
        c._opener = document.activeElement;
        var i = invId ? NT.inv(invId) : null;
        set({ dlg: { type: 'rec', inv: invId || '', fixed: !!invId }, errs: [], f: Object.assign({}, c.state.f, { rinv: invId || '', ramt: i ? (NT.balance(i) / 100).toFixed(2) : '', rmethod: 'Cash' }) });
      };
    };
    A.pickRecInv = function (e) { var i = NT.inv(e.target.value); A.setF({ rinv: e.target.value, ramt: i ? (NT.balance(i) / 100).toFixed(2) : '' }); };
    A.confirmRec = function () {
      var f = c.state.f, errs = [], i = NT.inv(f.rinv), amt = pesewas(f.ramt);
      if (!i) errs.push({ f: 'rinv', m: 'Choose an invoice.' });
      else if (isNaN(amt) || amt <= 0) errs.push({ f: 'ramt', m: 'Enter an amount above zero.' });
      else if (amt > NT.balance(i)) errs.push({ f: 'ramt', m: 'The amount is more than the balance of ' + F.m(NT.balance(i)) + '.' });
      if (errs.length) return set({ errs: errs });
      NT.payN++;
      NT.payments.unshift({ id: 'PAY-2026-0' + NT.payN, inv: i.id, cid: i.cid, amt: amt, method: f.rmethod || 'Cash', status: 'Completed', at: NT.NOW });
      i.paid += amt; i.status = i.paid >= NT.totals(i).total ? 'Paid' : 'Partially paid';
      set({ dlg: null, f: {} }); A.flash('Payment of GHS ' + F.m(amt) + ' recorded on ' + i.id); A.rebuild();
    };
    A.hasDrawer = !!s.drawer;
    if (s.drawer) {
      var cu = NT.cust(s.drawer);
      A.dr = { name: cu.name, phone: cu.phone, email: cu.email || '—', area: cu.area || '—', fleet: cu.fleet,
        vehicles: NT.vehicles.filter(function (v) { return v.cid === cu.id; }).map(function (v) { return { t: NT.vname(v), plate: v.plate, km: F.n(v.km) + ' km' }; }),
        jobs: NT.jobs.filter(function (j) { return j.cid === cu.id; }).map(function (j) { return { id: j.id, title: j.title, status: j.status, pill: 'pill ' + NT.pill(j.status), go: function () { A.closeDrawer(); A.go('job', j.id); } }; }) };
      A.dr.hasJobs = A.dr.jobs.length > 0; A.dr.noJobs = !A.dr.hasJobs;
    }
    if (s.dlg && s.dlg.type === 'rec') {
      var cur = NT.inv(s.f.rinv);
      A.dx = A.dx || {};
      A.dx.rec = { fixed: !!s.dlg.fixed, free: !s.dlg.fixed, inv: cur ? cur.id : '', hasInv: !!cur, bal: cur ? F.m(NT.balance(cur)) : '', invoices: NT.invoices.filter(openInv).map(function (i) { return { v: i.id, l: i.id + ' · ' + NT.cust(i.cid).name + ' · ' + F.m(NT.balance(i)) }; }), methods: opts(['Cash', 'Card', 'Bank transfer', 'Mobile money', 'Online']), pick: A.pickRecInv, amt: cur && !isNaN(pesewas(s.f.ramt)) && pesewas(s.f.ramt) > 0 ? F.m(pesewas(s.f.ramt)) : '—' };
    }
  });

  NT.vm.customers = function (A, c, s) {
    var q = norm((s.f || {}).cq);
    var rows = NT.customers.filter(function (x) { return !q || norm(x.name + x.phone + x.email).indexOf(q) >= 0; }).map(function (x) {
      var vs = NT.vehicles.filter(function (v) { return v.cid === x.id; });
      return { name: x.name, area: x.area || '—', phone: x.phone, email: x.email || '—', fleet: x.fleet, vs: vs.map(function (v) { return v.plate; }).join(', ') || '—', open: A.openDrawer(x.id) };
    });
    return { rows: rows, has: rows.length > 0, none: rows.length === 0, add: A.openDlg('cust'), filtered: !!(s.f || {}).cq };
  };

  var QTAB = ['Draft', 'Sent', 'Approved', 'Rejected', 'Expired'];
  NT.vm.quotes = function (A, c, s) {
    var tab = A.curTab('Sent');
    var tabs = QTAB.map(function (k) { var n = NT.quotes.filter(function (q) { return q.status === k; }).length; return { k: k, n: n, hasN: n > 0, sel: tab === k ? 'true' : 'false', go: A.setTab(k) }; });
    var rows = NT.quotes.filter(function (q) { return q.status === tab; }).map(function (q) {
      var j = NT.job(q.job);
      return { id: q.id, job: q.job, who: NT.cust(j.cid).name, total: F.m(NT.totals(q).total), valid: F.d(q.valid), status: q.status, pill: 'pill ' + NT.pill(q.status), go: A.to('quote', q.id) };
    });
    return { tabs: tabs, rows: rows, has: rows.length > 0, none: rows.length === 0, tab: tab };
  };

  NT.vm.quote = function (A, c, s) {
    var q = NT.quote(s.param) || NT.quotes[0], j = NT.job(q.job), t = totals(q);
    return { id: q.id, status: q.status, pill: 'pill ' + NT.pill(q.status), job: q.job, jobGo: A.to('job', q.job), who: NT.cust(j.cid).name, veh: NT.vname(NT.veh(j.vid)), lines: lineRows(q), t: t, valid: F.d(q.valid), notes: q.notes || '—', reason: q.reason,
      isDraft: q.status === 'Draft', isSent: q.status === 'Sent', isRej: q.status === 'Rejected', isApp: q.status === 'Approved', isExp: q.status === 'Expired', send: A.sendQuote(q), back: A.to('quotes') };
  };

  var ITAB = ['All', 'Sent', 'Partially paid', 'Overdue', 'Paid', 'Draft'];
  NT.vm.invoices = function (A, c, s) {
    var tab = A.curTab('All');
    var tabs = ITAB.map(function (k) { var n = k === 'All' ? 0 : NT.invoices.filter(function (i) { return i.status === k; }).length; return { k: k, n: n, hasN: n > 0, sel: tab === k ? 'true' : 'false', go: A.setTab(k) }; }).filter(function (t) { return t.k === 'All' || t.n > 0; });
    var rows = NT.invoices.filter(function (i) { return tab === 'All' || i.status === tab; }).map(function (i) {
      var tot = NT.totals(i).total, bal = NT.balance(i);
      return { id: i.id, who: NT.cust(i.cid).name, due: F.d(i.due), total: F.m(tot), paid: F.m(i.paid), paidZero: i.paid === 0, bal: F.m(bal), balZero: bal === 0, status: i.status, pill: 'pill ' + NT.pill(i.status), go: A.to('invoice', i.id) };
    });
    return { tabs: tabs, rows: rows, has: rows.length > 0, none: rows.length === 0 };
  };

  NT.vm.invoice = function (A, c, s) {
    var i = NT.inv(s.param) || NT.invoices[0], t = totals(i), bal = NT.balance(i), days = NT.overdueDays(i);
    return { id: i.id, status: i.status, pill: 'pill ' + NT.pill(i.status), who: NT.cust(i.cid).name, job: i.job, hasJob: !!i.job, jobGo: A.to('job', i.job), lines: lineRows(i), t: t, paid: F.m(i.paid), bal: F.m(bal), due: F.d(i.due),
      overdue: i.status === 'Overdue', days: days, canSend: i.status === 'Draft', canPay: openInv(i), rec: A.openRec(i.id), send: A.sendInvoice(i), back: A.to('invoices') };
  };

  NT.vm.payments = function (A, c, s) {
    var rows = NT.payments.map(function (p) { return { id: p.id, inv: p.inv, who: NT.cust(p.cid).name, amt: F.m(p.amt), method: p.method, status: p.status, pill: 'pill ' + NT.pill(p.status), at: F.dt(p.at) }; });
    return { rows: rows, rec: A.openRec('') };
  };
})(window.NT);
