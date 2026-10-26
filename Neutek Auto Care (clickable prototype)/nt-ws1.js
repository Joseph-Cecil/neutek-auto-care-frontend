/* Workshop: operations (dashboard, bookings, jobs, new job, job detail) */
(function (NT) {
  var F = NT.fmt, P = NT.P;
  var uname = function (id) { var u = NT.user(id); return u ? u.name : ''; };
  var who = function (c) { var a = NT.ACCOUNTS[c.state.acct]; return a ? a.name : 'Workshop'; };
  var opts = function (arr) { return arr.map(function (x) { return { v: x, l: x }; }); };
  NT.opts = opts;
  NT.PRIO = ['Low', 'Normal', 'High', 'Urgent'];
  NT.BK_STATUS = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'No show'];
  var norm = function (x) { return String(x || '').toLowerCase().replace(/\s+/g, ''); };
  var bkCust = function (b) { return b.cid ? NT.cust(b.cid).name : b.guest; };
  var bkVeh = function (b) { return b.vid ? NT.vname(NT.veh(b.vid)) : (b.note || '—'); };

  NT.act.push(function (A, c, s) {
    var set = A.set, f = s.f || {};
    /* bookings actions */
    A.confirmBk = function (b) { return function () { b.status = 'Confirmed'; A.flash(b.id + ' confirmed'); A.rebuild(); }; };
    A.cancelBk = function (b) {
      return function () {
        if (!(c.state.f.reason || '').trim()) return set({ errs: [{ f: 'reason', m: 'Give a reason for cancelling.' }] });
        b.status = 'Cancelled'; b.reason = c.state.f.reason; set({ ask: '', errs: [] }); A.flash(b.id + ' cancelled');
      };
    };
    A.clearFilters = function () { set({ f: Object.assign({}, c.state.f, { fq: '', fstatus: '', fprio: '', ftech: '', ffrom: '', fto: '' }) }); };
    /* job status */
    A.chooseStatus = function (to) { return function () { A.openDlg('status', { to: to })(); }; };
    A.confirmStatus = function () {
      var j = NT.job(c.state.param), to = c.state.dlg.to;
      if (!j || NT.MOVES[j.status].indexOf(to) < 0) return A.closeDlg();
      j.hist.push({ who: who(c), from: j.status, to: to, note: c.state.f.snote || '', at: NT.NOW });
      j.status = to; j.upd = NT.NOW;
      if (to === 'Quote approved' || to === 'Quote rejected') { var q = NT.quote(j.quote); if (q && q.status === 'Sent') q.status = to === 'Quote approved' ? 'Approved' : 'Rejected'; }
      set({ dlg: null, f: Object.assign({}, c.state.f, { snote: '' }) });
      A.flash('Job moved to ' + to); A.rebuild();
    };
    A.assignTech = function (e) { var j = NT.job(c.state.param); j.tech = e.target.value; A.flash('Technician saved'); A.rebuild(); };
    A.saveDiag = function () {
      var j = NT.job(c.state.param), f2 = c.state.f;
      if (!(f2.dsum || '').trim()) return set({ errs: [{ f: 'dsum', m: 'Add a short summary.' }] });
      j.dx = { summary: f2.dsum, findings: f2.dfind || '—', recs: f2.drec || '—', photos: [f2.dp1 || 'Photo 1', f2.dp2 || 'Photo 2'] };
      set({ dlg: null }); A.flash('Diagnostic added'); A.rebuild();
    };
    A.openDiag = A.openDlg('diag');
    A.pickCust = function (id) { return function () { A.setF({ ncid: id, nvid: '' }); }; };
    A.toggleNsv = function (id) { return function () { var cur = (c.state.f.nsv || []).slice(), i = cur.indexOf(id); if (i < 0) cur.push(id); else cur.splice(i, 1); A.setF({ nsv: cur }); }; };
    A.createJob = function () {
      var f2 = c.state.f, errs = [];
      if (!f2.ncid) errs.push({ f: 'ncid', m: 'Choose a customer.' });
      if (f2.ncid && !f2.nvid) errs.push({ f: 'nvid', m: 'Choose a vehicle.' });
      if (!(f2.ntitle || '').trim()) errs.push({ f: 'ntitle', m: 'Give the job a title.' });
      if (errs.length) return set({ errs: errs });
      NT.jobs = NT.jobs.filter(function (x) { return x.id !== 'JOB-2026-091'; });
      NT.jobs.unshift({ id: 'JOB-2026-091', cid: f2.ncid, vid: f2.nvid, title: f2.ntitle, status: 'Intake', priority: f2.nprio || 'Normal', tech: '', upd: NT.NOW, sv: (f2.nsv || []).slice(), intake: f2.nnotes || '', note: '', est: f2.nest || '', dx: null, hist: [{ who: who(c), from: '', to: 'Intake', note: 'Job created.', at: NT.NOW }] });
      set({ f: {} }); A.go('job', 'JOB-2026-091'); A.flash('Job JOB-2026-091 created');
    };
    A.dx = A.dx || {};
    if (s.dlg && s.dlg.type === 'status') { var jj = NT.job(s.param); A.dx.status = { to: s.dlg.to, from: jj ? jj.status : '', danger: s.dlg.to === 'Cancelled' || s.dlg.to === 'Quote rejected', safe: !(s.dlg.to === 'Cancelled' || s.dlg.to === 'Quote rejected') }; }
  });

  /* dashboard */
  NT.vm.dashboard = function (A, c, s) {
    var rev = 1845000, prev = 1620000, pct = ((rev - prev) / prev * 100).toFixed(1);
    var today = NT.bookings.filter(function (b) { return b.at.slice(0, 10) === '2026-10-24'; }).map(function (b) { return { id: b.id, who: bkCust(b), veh: bkVeh(b), at: b.at.slice(11), pill: 'pill ' + NT.pill(b.status), status: b.status, go: A.nav.bookings }; });
    var need = NT.jobs.filter(function (j) { return j.status === 'Diagnosing' || j.status === 'Intake'; }).map(function (j) { return { id: j.id, title: j.title, who: NT.cust(j.cid).name, status: j.status, pill: 'pill ' + NT.pill(j.status), go: A.to('job', j.id) }; });
    return {
      rev: F.m(rev), prev: F.m(prev), pct: '+' + pct + '%', active: NT.jobs.filter(NT.activeJob).length,
      pending: NT.bookings.filter(function (b) { return b.status === 'Pending'; }).length,
      done: 31, avg: '5.4 h', today: today, hasToday: today.length > 0, need: need, hasNeed: need.length > 0
    };
  };

  /* bookings */
  NT.vm.bookings = function (A, c, s) {
    var f = s.f || {}, tab = A.curTab('Pending');
    var groups = { Pending: ['Pending'], Confirmed: ['Confirmed'], Closed: ['Completed', 'Cancelled', 'No show'] };
    var cnt = NT.bookings.filter(function (b) { return b.status === 'Pending'; }).length;
    var tabs = ['Pending', 'Confirmed', 'Closed'].map(function (k) { var n = k === 'Pending' ? cnt : 0; return { k: k, n: n, hasN: n > 0, sel: tab === k ? 'true' : 'false', go: A.setTab(k) }; });
    var q = norm(f.fq);
    var rows = NT.bookings.filter(function (b) {
      if (groups[tab].indexOf(b.status) < 0) return false;
      if (f.fstatus && b.status !== f.fstatus) return false;
      if (f.ffrom && b.at.slice(0, 10) < f.ffrom) return false;
      if (f.fto && b.at.slice(0, 10) > f.fto) return false;
      if (q && norm(b.id + bkCust(b) + bkVeh(b) + (b.phone || '')).indexOf(q) < 0) return false;
      return true;
    }).map(function (b) {
      var asking = s.ask === b.id, pend = b.status === 'Pending';
      return { id: b.id, who: bkCust(b), sub: b.cid ? NT.cust(b.cid).phone : 'Walk-in · ' + b.phone, veh: bkVeh(b), sv: b.sv.map(function (i) { return NT.svc(i).name; }).join(', '), at: F.dt(b.at), status: b.status, pill: 'pill ' + NT.pill(b.status), rowCls: asking ? 'ask' : '', pend: pend && !asking, asking: asking, confirm: A.confirmBk(b), ask: A.askRow(b.id), doCancel: A.cancelBk(b), reason: b.reason || '' };
    });
    var filtered = !!(f.fq || f.fstatus || f.ffrom || f.fto);
    return { tabs: tabs, rows: rows, has: rows.length > 0, none: rows.length === 0, filtered: filtered, statuses: opts(NT.BK_STATUS), tab: tab, search: A.skeleton, skel: A.loading, notSkel: !A.loading, skRows: [1, 2, 3, 4] };
  };

  /* jobs */
  NT.vm.jobs = function (A, c, s) {
    var f = s.f || {}, q = norm(f.fq);
    var techs = NT.users.filter(function (u) { return u.role === 'technician'; }).map(function (u) { return { v: u.id, l: u.name }; });
    var rows = NT.jobs.filter(function (j) {
      if (f.fstatus && j.status !== f.fstatus) return false;
      if (f.fprio && j.priority !== f.fprio) return false;
      if (f.ftech && j.tech !== f.ftech) return false;
      var v = NT.veh(j.vid);
      if (q && norm(j.id + j.title + NT.cust(j.cid).name + v.plate).indexOf(q) < 0) return false;
      return true;
    }).map(function (j) {
      var v = NT.veh(j.vid);
      return { id: j.id, title: j.title, who: NT.cust(j.cid).name, veh: NT.vname(v) + ' · ' + v.plate, tech: uname(j.tech) || '—', prio: j.priority, ppill: 'pill' + (j.priority === 'Urgent' ? ' bad' : (j.priority === 'High' ? ' warn' : '')), status: j.status, pill: 'pill ' + NT.pill(j.status), upd: F.d(j.upd), go: A.to('job', j.id) };
    });
    return { rows: rows, has: rows.length > 0, none: rows.length === 0, statuses: opts(NT.JOB_FLOW.concat(['Quote rejected', 'Cancelled'])), prios: opts(NT.PRIO), techs: techs, filtered: !!(f.fq || f.fstatus || f.fprio || f.ftech), newJob: A.nav['job-new'] };
  };

  /* job-new */
  NT.vm['job-new'] = function (A, c, s) {
    var f = s.f || {}, q = norm(f.ncq);
    var cs = NT.customers.filter(function (x) { return !q || norm(x.name + x.phone).indexOf(q) >= 0; }).map(function (x) { var on = f.ncid === x.id; return { name: x.name, sub: x.phone, cls: 'chk' + (on ? ' on' : ''), pressed: on ? 'true' : 'false', pick: A.pickCust(x.id) }; });
    var vs = f.ncid ? NT.vehicles.filter(function (v) { return v.cid === f.ncid; }).map(function (v) { return { v: v.id, l: NT.vname(v) + ' · ' + v.plate }; }) : [];
    var sv = NT.services.filter(function (x) { return x.active; }).map(function (x) { var on = (f.nsv || []).indexOf(x.id) >= 0; return { name: x.name, price: F.m(x.price), cls: 'chk' + (on ? ' on' : ''), pressed: on ? 'true' : 'false', toggle: A.toggleNsv(x.id) }; });
    return { custs: cs, vehs: vs, noVeh: !f.ncid, svcs: sv, prios: opts(NT.PRIO), back: A.to('jobs') };
  };

  /* job detail */
  NT.vm.job = function (A, c, s) {
    var j = NT.job(s.param) || NT.jobs[0], v = NT.veh(j.vid), cu = NT.cust(j.cid);
    var next = NT.MOVES[j.status].map(function (to) { return { to: to, bad: to === 'Cancelled' || to === 'Quote rejected', pick: A.chooseStatus(to) }; });
    var tot = 0;
    var sv = j.sv.map(function (id) { var x = NT.svc(id); tot += x.price; return { name: x.name, price: F.m(x.price) }; });
    var q = NT.quotes.filter(function (x) { return x.job === j.id; })[0], inv = NT.invoices.filter(function (x) { return x.job === j.id; })[0];
    var techs = NT.users.filter(function (u) { return u.role === 'technician' && u.active; }).map(function (u) { return { v: u.id, l: u.name }; });
    return {
      id: j.id, title: j.title, status: j.status, pill: 'pill ' + NT.pill(j.status), prio: j.priority, ppill: 'pill' + (j.priority === 'Urgent' ? ' bad' : (j.priority === 'High' ? ' warn' : '')),
      cust: cu.name, phone: cu.phone, veh: NT.vname(v), plate: v.plate, km: F.n(v.km) + ' km', colour: v.colour,
      intake: j.intake || '—', note: j.note || '—', est: F.d(j.est), next: next, hasNext: next.length > 0, noNext: next.length === 0,
      statusOpen: s.pop === 'jstatus', toggleStatus: A.openPop('jstatus'),
      sv: sv, hasSv: sv.length > 0, noSv: sv.length === 0, svTotal: F.m(tot),
      hist: j.hist.slice().reverse().map(function (h) { return { who: h.who, from: h.from || '—', to: h.to, note: h.note || '—', at: F.dt(h.at) }; }),
      dx: j.dx ? { summary: j.dx.summary, findings: j.dx.findings, recs: j.dx.recs, p1: j.dx.photos[0], p2: j.dx.photos[1] } : null,
      hasDx: !!j.dx, noDx: !j.dx, canDx: j.status === 'Diagnosing',
      quote: q ? { id: q.id, go: A.to('quote', q.id) } : null, inv: inv ? { id: inv.id, go: A.to('invoice', inv.id) } : null,
      hasQuote: !!q, hasInv: !!inv, noLinks: !q && !inv,
      techs: techs, tech: j.tech, inspect: A.to('inspection', j.id), back: A.to('jobs'), isAdmin: s.role === 'admin', isTech: s.role === 'technician'
    };
  };
})(window.NT);
