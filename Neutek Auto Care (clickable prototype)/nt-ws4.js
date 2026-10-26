/* Workshop: customer care (messages, reminders, feedback), inventory, schedule, inspection */
(function (NT) {
  var F = NT.fmt, by = NT.by, opts = NT.opts;

  /* ---- routes, menu, titles ---- */
  ['messaging', 'reminders', 'inventory', 'schedule', 'feedback', 'inspection'].forEach(function (r) { NT.ROUTES[r] = 'ws'; });
  NT.TECH.schedule = 1; NT.TECH.inspection = 1;
  NT.NAV_AS.inspection = 'jobs'; NT.PARENT_LBL.inspection = 'Jobs';
  NT.IC.chat = 'M4 5h16v11H9l-5 4z'; NT.IC.box = 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10';
  NT.IC.star = 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z';
  NT.WS_MENU.forEach(function (g) {
    if (g[0] === 'Operations') g[1].splice(2, 0, ['Schedule', 'schedule', 'cal']);
    if (g[0] === 'Catalogue') g[1].push(['Inventory', 'inventory', 'box']);
  });
  NT.WS_MENU.splice(3, 0, ['Customer care', [['Messages', 'messaging', 'chat'], ['Reminders', 'reminders', 'bell'], ['Feedback', 'feedback', 'star']]]);
  Object.assign(NT.TITLES, { messaging: 'Messages', reminders: 'Service reminders', inventory: 'Inventory', schedule: 'Schedule', feedback: 'Feedback', inspection: 'Inspection' });
  Object.assign(NT.SKEL, { messaging: 'list', reminders: 'list', inventory: 'list', schedule: 'list', feedback: 'list', inspection: 'form' });
  Object.assign(NT.ASYNC, { saveTpl: ['save', 600], receiveStock: ['receive', 800], saveInsp: ['save', 700], sendInsp: ['sendInsp', 900], submitRating: ['rate', 800], sendReply: ['save', 600] });
  Object.assign(NT.PILL, { Delivered: 'ok', Read: 'ok', 'Due soon': 'warn', 'Reminder sent': 'brand', Booked: 'ok', Upcoming: '', 'Low stock': 'warn', 'Out of stock': 'bad', 'In stock': 'ok' });

  /* ---- sample data ---- */
  NT.msgTpl = [
    { id: 't1', stage: 'Intake', name: 'Car received', body: 'Hi {name}, we have received your {car} (job {job}). We will update you once the diagnosis is done. Track it here: {link}', sms: true, wa: true, on: true },
    { id: 't2', stage: 'Quote sent', name: 'Quote ready', body: 'Hi {name}, your quote for the {car} is ready. Review and approve it here: {link}', sms: true, wa: true, on: true },
    { id: 't3', stage: 'Quote approved', name: 'Work approved', body: 'Thank you {name}. We will start work on your {car} today. Job {job}.', sms: false, wa: true, on: true },
    { id: 't4', stage: 'In progress', name: 'Work started', body: 'Hi {name}, work has started on your {car}. Follow it here: {link}', sms: false, wa: true, on: false },
    { id: 't5', stage: 'Ready for pickup', name: 'Ready for pickup', body: 'Good news {name}! Your {car} is ready for pickup. We are open until 6pm. Job {job}.', sms: true, wa: true, on: true },
    { id: 't6', stage: 'Payment', name: 'Payment received', body: 'Thank you {name}. We received your payment for {job}. Receipt: {link}', sms: true, wa: false, on: true },
    { id: 't7', stage: 'Reminder', name: 'Service reminder', body: 'Hi {name}, your {car} is due for {service}. Book a time here: {link}', sms: true, wa: true, on: true }
  ];
  NT.msgLog = [
    { id: 'm1', to: 'Ama Mensah', phone: '024 411 2201', tpl: 'Quote ready', ch: 'WhatsApp', st: 'Delivered', at: '2026-10-23T16:21' },
    { id: 'm2', to: 'Kofi Asare', phone: '020 555 0188', tpl: 'Car received', ch: 'SMS', st: 'Delivered', at: '2026-10-22T09:11' },
    { id: 'm3', to: 'Abena Owusu', phone: '027 300 4412', tpl: 'Ready for pickup', ch: 'WhatsApp', st: 'Read', at: '2026-10-23T14:01' },
    { id: 'm4', to: 'Esi Mensah', phone: '024 700 3318', tpl: 'Car received', ch: 'WhatsApp', st: 'Delivered', at: '2026-10-24T07:56' },
    { id: 'm5', to: 'Kofi Asare', phone: '020 555 0188', tpl: 'Work approved', ch: 'WhatsApp', st: 'Failed', at: '2026-10-22T17:02' }
  ];
  NT.rem = [
    { id: 'r1', vid: 'v1', svc: 'Major service', basis: 'Every 10,000 km', due: '2026-10-30', st: 'Due soon' },
    { id: 'r2', vid: 'v3', svc: 'Brake fluid change', basis: 'Every 2 years', due: '2026-10-18', st: 'Overdue' },
    { id: 'r3', vid: 'v2', svc: 'Oil and filter change', basis: 'Every 5,000 km', due: '2026-11-12', st: 'Upcoming' },
    { id: 'r4', vid: 'v4', svc: 'Tyre rotation', basis: 'Every 10,000 km', due: '2026-11-05', st: 'Reminder sent' },
    { id: 'r5', vid: 'v6', svc: 'First service', basis: 'At 20,000 km', due: '2026-10-29', st: 'Booked' }
  ];
  NT.remRules = [
    { id: 'a', l: 'Remind 14 days before a service is due', on: true },
    { id: 'b', l: 'Remind again 3 days after if the customer has not booked', on: true },
    { id: 'c', l: 'Send on WhatsApp first, then SMS if it fails', on: true }
  ];
  NT.parts = [
    { id: 'p1', name: 'Brake pads, front (Corolla)', sku: 'BP-F-COR', qty: 6, min: 4, cost: 18000, price: 28000, sup: 'Accra Auto Parts' },
    { id: 'p2', name: 'Brake fluid DOT 4, 1 L', sku: 'BF-DOT4', qty: 14, min: 8, cost: 4500, price: 7500, sup: 'Accra Auto Parts' },
    { id: 'p3', name: 'Engine oil 5W-30, 4 L', sku: 'EO-5W30', qty: 3, min: 6, cost: 22000, price: 32000, sup: 'Tema Lubricants' },
    { id: 'p4', name: 'Oil filter, universal', sku: 'OF-UNI', qty: 22, min: 10, cost: 3000, price: 5500, sup: 'Tema Lubricants' },
    { id: 'p5', name: 'Air filter, CR-V', sku: 'AF-CRV', qty: 2, min: 3, cost: 6000, price: 11000, sup: 'Accra Auto Parts' },
    { id: 'p6', name: 'AC refrigerant R134a, 1 kg', sku: 'AC-R134', qty: 5, min: 4, cost: 12000, price: 20000, sup: 'Kumasi Cooling' },
    { id: 'p7', name: 'Lower arm bush kit', sku: 'SB-LAB', qty: 0, min: 2, cost: 35000, price: 52000, sup: 'Accra Auto Parts' },
    { id: 'p8', name: 'Wiper blades, pair', sku: 'WB-PR', qty: 9, min: 4, cost: 4000, price: 7000, sup: 'Kumasi Cooling' },
    { id: 'p9', name: 'Spark plugs, set of 4', sku: 'SP-4', qty: 11, min: 6, cost: 9000, price: 16000, sup: 'Accra Auto Parts' },
    { id: 'p10', name: 'Battery 12V 65Ah', sku: 'BAT-65', qty: 4, min: 2, cost: 62000, price: 85000, sup: 'Tema Lubricants' }
  ];
  NT.DAYS = [['2026-10-24', 'Sat 24', 5], ['2026-10-26', 'Mon 26', 8], ['2026-10-27', 'Tue 27', 8], ['2026-10-28', 'Wed 28', 8], ['2026-10-29', 'Thu 29', 8], ['2026-10-30', 'Fri 30', 8]];
  NT.slots = [
    { tech: 'u2', day: '2026-10-24', job: 'JOB-2026-086', hrs: 4 }, { tech: 'u2', day: '2026-10-26', job: 'JOB-2026-086', hrs: 3 },
    { tech: 'u2', day: '2026-10-26', job: 'JOB-2026-088', hrs: 4 }, { tech: 'u2', day: '2026-10-27', job: 'JOB-2026-088', hrs: 6 }, { tech: 'u2', day: '2026-10-28', job: 'JOB-2026-088', hrs: 3 },
    { tech: 'u3', day: '2026-10-24', job: 'JOB-2026-087', hrs: 2 }, { tech: 'u3', day: '2026-10-24', job: 'JOB-2026-089', hrs: 3 },
    { tech: 'u3', day: '2026-10-26', job: 'JOB-2026-082', hrs: 3 }, { tech: 'u3', day: '2026-10-26', job: 'JOB-2026-089', hrs: 5 },
    { tech: 'u3', day: '2026-10-27', job: 'JOB-2026-089', hrs: 9 }
  ];
  NT.BAYS = [['Bay 1', 'JOB-2026-086'], ['Bay 2', 'JOB-2026-087'], ['Bay 3', 'JOB-2026-089'], ['Bay 4', '']];
  NT.fb = [
    { id: 'f1', name: 'Abena Owusu', job: 'JOB-2026-085', stars: 5, text: 'They showed me the old pads and explained everything before charging me.', at: '2026-10-23', feat: true, reply: '' },
    { id: 'f2', name: 'Esi Mensah', job: 'JOB-2026-070', stars: 5, text: 'Our vans are back on the road faster. The fleet account saves me hours.', at: '2026-10-12', feat: true, reply: 'Thank you Esi. We are glad the schedule reminders help.' },
    { id: 'f3', name: 'Kofi Asare', job: 'JOB-2026-077', stars: 4, text: 'Good work, but it took a day longer than the estimate.', at: '2026-10-05', feat: false, reply: '' },
    { id: 'f4', name: 'Yaw Boadu', job: 'JOB-2026-068', stars: 5, text: 'Clear quote on my phone and I paid with MoMo. Very easy.', at: '2026-09-30', feat: false, reply: '' },
    { id: 'f5', name: 'Akua Frimpong', job: 'JOB-2026-061', stars: 3, text: 'Car was clean and the work is fine. Waiting area could be better.', at: '2026-09-22', feat: false, reply: '' },
    { id: 'f6', name: 'Nii Armah', job: 'JOB-2026-058', stars: 5, text: 'Honest advice. They told me what could wait.', at: '2026-09-18', feat: false, reply: '' }
  ];
  NT.rated = NT.rated || {};
  NT.INSP = [
    ['Brakes', [['pf', 'Front pads'], ['pr', 'Rear pads or shoes'], ['dc', 'Discs'], ['bf', 'Brake fluid']]],
    ['Tyres and wheels', [['td', 'Tread depth'], ['tp', 'Pressure'], ['al', 'Alignment']]],
    ['Fluids', [['eo', 'Engine oil'], ['cl', 'Coolant'], ['ps', 'Power steering']]],
    ['Electrical', [['bt', 'Battery'], ['li', 'Lights'], ['wp', 'Wipers']]],
    ['Suspension', [['sh', 'Shock absorbers'], ['bu', 'Bushes and joints']]]
  ];
  NT.insp = { 'JOB-2026-088': { r: { pf: 'ok', pr: 'ok', dc: 'ok', bf: 'watch', td: 'watch', tp: 'ok', al: 'fix', eo: 'ok', cl: 'ok', bt: 'ok', li: 'ok', sh: 'ok', bu: 'fix' }, note: 'Both front lower arm bushes are worn. Inner tyre edges are wearing from poor alignment.', photos: 2, sent: false } };
  NT.INSP_ALL = []; NT.INSP.forEach(function (g) { g[1].forEach(function (i) { NT.INSP_ALL.push(i); }); });
  var inspOf = function (id) { return NT.insp[id] || (NT.insp[id] = { r: {}, note: '', photos: 0, sent: false }); };
  var SAMPLE = { name: 'Ama', car: '2019 Toyota Corolla', job: 'JOB-2026-088', link: 'neutek.example/t/088', service: 'a major service' };
  var fill = function (b) { return b.replace(/\{(\w+)\}/g, function (m, k) { return SAMPLE[k] || m; }); };
  var nextId = function (p, arr) { return p + (arr.length + 1) + Math.floor(Math.random() * 90 + 10); };

  /* shared with the customer job page */
  NT.myJobExtra = function (A, c, s, j) {
    var out = {}, ins = NT.insp[j.id], st = (c.state.f || {}).rstars;
    var canRate = (j.status === 'Completed' || j.status === 'Ready for pickup') && !NT.rated[j.id];
    var n = parseInt(st, 10) || 0;
    out.canRate = canRate; out.rated = !!NT.rated[j.id];
    out.stars = [1, 2, 3, 4, 5].map(function (i) { return { n: i, mark: i <= n ? '★' : '☆', label: i + ' star' + (i > 1 ? 's' : ''), pressed: i === n ? 'true' : 'false', cls: i <= n ? 'btn sm primary' : 'btn sm', pick: function () { A.setF({ rstars: String(i) }); } }; });
    out.submitRate = A.submitRating;
    var hasInsp = !!(ins && ins.sent), items = [];
    if (hasInsp) NT.INSP_ALL.forEach(function (i) { var v = ins.r[i[0]]; if (v === 'watch' || v === 'fix') items.push({ l: i[1], pill: v === 'fix' ? 'pill bad' : 'pill warn', t: v === 'fix' ? 'Needs repair' : 'Keep an eye on it' }); });
    out.hasInsp = hasInsp; out.inspItems = items; out.inspNote = hasInsp ? ins.note : ''; out.inspOk = hasInsp ? NT.INSP_ALL.filter(function (i) { return ins.r[i[0]] === 'ok'; }).length : 0;
    return out;
  };

  NT.act.push(function (A, c, s) {
    var set = A.set;
    /* messages */
    A.toggleTpl = function (t, k) { return function () { t[k] = !t[k]; A.rebuild(); }; };
    A.editTpl = function (t) { return function () { set({ edit: t.id, f: Object.assign({}, c.state.f, { tplbody: t.body }) }); }; };
    A.cancelEdit = function () { set({ edit: '', errs: [] }); };
    A.saveTpl = function () {
      var t = by(NT.msgTpl, c.state.edit), b = (c.state.f.tplbody || '').trim();
      if (!b) return set({ errs: [{ f: 'tplbody', m: 'Write the message.' }] });
      t.body = b; set({ edit: '', errs: [] }); A.flash(t.name + ' message saved');
    };
    A.sendTest = function (t) { return function () { A.flash('Test of "' + t.name + '" sent to your phone'); }; };
    /* reminders */
    var sendRem = function (r) {
      var v = NT.veh(r.vid), cu = NT.cust(v.cid);
      r.st = 'Reminder sent'; NT.msgLog.unshift({ id: nextId('m', NT.msgLog), to: cu.name, phone: cu.phone, tpl: 'Service reminder', ch: 'WhatsApp', st: 'Sent', at: NT.NOW });
      return cu;
    };
    A.sendRem = function (r) { return function () { var cu = sendRem(r); A.flash('Reminder sent to ' + cu.name + ' on WhatsApp'); A.rebuild(); }; };
    A.sendAllRem = function () {
      var n = 0; NT.rem.forEach(function (r) { if (r.st === 'Due soon' || r.st === 'Overdue') { sendRem(r); n++; } });
      A.flash(n ? n + ' reminder' + (n > 1 ? 's' : '') + ' sent' : 'Nothing due to send'); A.rebuild();
    };
    A.toggleRule = function (r) { return function () { r.on = !r.on; A.rebuild(); }; };
    /* inventory */
    A.restock = function (p, n) { return function () { p.qty += n; A.flash(n + ' added to ' + p.name); A.rebuild(); }; };
    A.restockLow = function () {
      var n = 0; NT.parts.forEach(function (p) { if (p.qty <= p.min) { p.qty = p.min * 3; n++; } });
      A.flash(n + ' low items restocked'); A.rebuild();
    };
    A.receiveStock = function () {
      var f = c.state.f, q = parseInt(f.rqty, 10), id = f.rpart || NT.parts[0].id, p = by(NT.parts, id);
      if (!(q > 0)) return set({ errs: [{ f: 'rqty', m: 'Enter how many arrived, above zero.' }] });
      p.qty += q; set({ errs: [], f: Object.assign({}, f, { rqty: '' }) }); A.flash(q + ' received into ' + p.name);
    };
    /* schedule */
    A.assignTech = function (j, u) {
      return function () {
        j.tech = u.id; var best = NT.DAYS[1], bl = 99;
        NT.DAYS.slice(1).forEach(function (d) { var l = 0; NT.slots.forEach(function (x) { if (x.tech === u.id && x.day === d[0]) l += x.hrs; }); if (l < bl) { bl = l; best = d; } });
        NT.slots.push({ tech: u.id, day: best[0], job: j.id, hrs: 3 });
        A.flash(j.id + ' assigned to ' + u.name + ' on ' + best[1]); A.rebuild();
      };
    };
    /* feedback */
    A.toggleFeat = function (x) { return function () { x.feat = !x.feat; A.flash(x.feat ? 'Shown on the website' : 'Removed from the website'); A.rebuild(); }; };
    A.openReply = function (x) { return function () { set({ replying: x.id, f: Object.assign({}, c.state.f, { freply: x.reply || '' }) }); }; };
    A.cancelReply = function () { set({ replying: '' }); };
    A.sendReply = function () {
      var x = by(NT.fb, c.state.replying), t = (c.state.f.freply || '').trim();
      if (!t) return set({ errs: [{ f: 'freply', m: 'Write a reply first.' }] });
      x.reply = t; set({ replying: '', errs: [] }); A.flash('Reply sent to ' + x.name);
    };
    A.submitRating = function () {
      var j = NT.job(c.state.param), f = c.state.f, n = parseInt(f.rstars, 10) || 0;
      if (n < 1) return set({ errs: [{ f: 'rstars', m: 'Choose a star rating first.' }] });
      var cu = NT.cust(j.cid);
      NT.fb.unshift({ id: nextId('f', NT.fb), name: cu ? cu.name : 'Customer', job: j.id, stars: n, text: (f.rtext || '').trim() || 'No comment.', at: NT.NOW.slice(0, 10), feat: false, reply: '' });
      NT.rated[j.id] = true; set({ errs: [], f: Object.assign({}, f, { rstars: '', rtext: '' }) }); A.flash('Thank you for your feedback');
    };
    /* inspection */
    A.mark = function (id, key, v) { return function () { inspOf(id).r[key] = v; A.rebuild(); }; };
    A.addPhoto = function (id) { return function () { var i = inspOf(id); if (i.photos < 4) { i.photos++; A.flash('Photo ' + i.photos + ' added'); A.rebuild(); } else A.flash('Four photos is the limit here'); }; };
    A.saveInsp = function () { var id = c.state.param; inspOf(id).note = c.state.f.inote === undefined ? inspOf(id).note : c.state.f.inote; A.flash('Inspection saved'); A.rebuild(); };
    A.sendInsp = function () {
      var id = c.state.param, i = inspOf(id), j = NT.job(id);
      if (c.state.f.inote !== undefined) i.note = c.state.f.inote;
      i.sent = true; var cu = NT.cust(j.cid);
      NT.notifs.unshift({ id: nextId('n', NT.notifs), text: 'The inspection report for your ' + NT.vname(NT.veh(j.vid)) + ' is ready.', sub: id, at: NT.NOW, read: false, to: 'my-job', p: id });
      NT.msgLog.unshift({ id: nextId('m', NT.msgLog), to: cu.name, phone: cu.phone, tpl: 'Inspection report', ch: 'WhatsApp', st: 'Sent', at: NT.NOW });
      A.flash('Inspection report sent to ' + cu.name); A.rebuild();
    };
    /* analytics */
    A.exportCsv = function (what) { return function () { A.flash(what + ' exported as a spreadsheet'); }; };
    A.dx = A.dx || {};
  });

  /* ---- view models ---- */
  var stars = function (n) { return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); };

  NT.vm.messaging = function (A, c, s) {
    var tab = A.curTab('templates');
    var tpls = NT.msgTpl.map(function (t) {
      var ed = s.edit === t.id;
      return { id: t.id, stage: t.stage, name: t.name, body: t.body, preview: fill(t.body), sms: t.sms, wa: t.wa, on: t.on, onPill: t.on ? 'pill ok' : 'pill', onLbl: t.on ? 'Automatic' : 'Off',
        tOn: A.toggleTpl(t, 'on'), tSms: A.toggleTpl(t, 'sms'), tWa: A.toggleTpl(t, 'wa'), edit: A.editTpl(t), test: A.sendTest(t), editing: ed, viewing: !ed };
    });
    var log = NT.msgLog.map(function (m) { return { to: m.to, phone: m.phone, tpl: m.tpl, ch: m.ch, st: m.st, pill: 'pill ' + NT.pill(m.st), at: F.dt(m.at) }; });
    var ok = NT.msgLog.filter(function (m) { return m.st === 'Delivered' || m.st === 'Read'; }).length;
    return { isTpl: tab === 'templates', isLog: tab === 'log', toTpl: A.setTab('templates'), toLog: A.setTab('log'), tpls: tpls, log: log,
      sent: NT.msgLog.length, rate: Math.round(ok / NT.msgLog.length * 100) + '%', active: NT.msgTpl.filter(function (t) { return t.on; }).length };
  };

  NT.vm.reminders = function (A, c, s) {
    var rows = NT.rem.map(function (r) {
      var v = NT.veh(r.vid), cu = NT.cust(v.cid), can = r.st === 'Due soon' || r.st === 'Overdue' || r.st === 'Upcoming';
      return { cust: cu.name, phone: cu.phone, car: NT.vname(v), plate: v.plate, svc: r.svc, basis: r.basis, due: F.d(r.due), st: r.st, pill: 'pill ' + NT.pill(r.st), can: can, cant: !can, send: A.sendRem(r), cantTxt: r.st === 'Booked' ? 'Already booked' : 'Sent' };
    });
    var dueN = NT.rem.filter(function (r) { return r.st === 'Due soon' || r.st === 'Overdue'; }).length;
    return { rows: rows, dueN: dueN, hasDue: dueN > 0, sendAll: A.sendAllRem, sentN: 23 + NT.rem.filter(function (r) { return r.st === 'Reminder sent'; }).length, rules: NT.remRules.map(function (r) { return { l: r.l, on: r.on, toggle: A.toggleRule(r) }; }) };
  };

  NT.vm.inventory = function (A, c, s) {
    var tab = A.curTab('all'), st = function (p) { return p.qty === 0 ? 'Out of stock' : p.qty <= p.min ? 'Low stock' : 'In stock'; };
    var low = NT.parts.filter(function (p) { return p.qty <= p.min; });
    var val = 0, rev = 0; NT.parts.forEach(function (p) { val += p.qty * p.cost; rev += p.qty * p.price; });
    var rows = NT.parts.filter(function (p) { return tab === 'all' || p.qty <= p.min; }).map(function (p) {
      return { name: p.name, sku: p.sku, sup: p.sup, qty: p.qty, min: p.min, cost: F.m(p.cost), price: F.m(p.price), margin: Math.round((p.price - p.cost) / p.price * 100) + '%', st: st(p), pill: 'pill ' + NT.pill(st(p)), add5: A.restock(p, 5), add10: A.restock(p, 10) };
    });
    return { isAll: tab === 'all', isLow: tab === 'low', toAll: A.setTab('all'), toLow: A.setTab('low'), rows: rows, empty: !rows.length, items: NT.parts.length, value: F.m(val), margin: Math.round((rev - val) / rev * 100) + '%',
      lowN: low.length, hasLow: low.length > 0, restockLow: A.restockLow, parts: NT.parts.map(function (p) { return { v: p.id, l: p.name }; }) };
  };

  NT.vm.schedule = function (A, c, s) {
    var me = (NT.ACCOUNTS[s.acct] || {}).uid, tech = s.role === 'technician';
    var techs = NT.users.filter(function (u) { return u.role === 'technician' && u.active && (!tech || u.id === me); });
    var rows = techs.map(function (u) {
      var cells = NT.DAYS.map(function (d) {
        var ch = NT.slots.filter(function (x) { return x.tech === u.id && x.day === d[0]; }), hrs = 0; ch.forEach(function (x) { hrs += x.hrs; });
        var pct = Math.round(hrs / d[2] * 100);
        return { hrs: hrs, cap: d[2], pct: pct + '%', pill: pct > 100 ? 'pill bad' : pct >= 80 ? 'pill warn' : hrs ? 'pill ok' : 'pill', lbl: pct > 100 ? 'Over by ' + (hrs - d[2]) + ' h' : hrs ? hrs + ' of ' + d[2] + ' h' : 'Free',
          chips: ch.map(function (x) { return { id: x.job.replace('JOB-2026-', '#'), hrs: x.hrs, go: A.to('job', x.job) }; }) };
      });
      return { name: u.name, cells: cells };
    });
    var un = NT.jobs.filter(function (j) { return NT.activeJob(j) && !j.tech; }).map(function (j) {
      return { id: j.id, title: j.title, assign: techs.length ? NT.users.filter(function (u) { return u.role === 'technician' && u.active; }).map(function (u) { return { n: u.name.split(' ')[0], go: A.assignTech(j, u) }; }) : [] };
    });
    var bays = NT.BAYS.map(function (b) { var j = b[1] ? NT.job(b[1]) : null; return { bay: b[0], free: !j, busy: !!j, job: j ? j.id : '', title: j ? j.title : '', st: j ? j.status : 'Free', pill: j ? 'pill ' + NT.pill(j.status) : 'pill ok', go: j ? A.to('job', j.id) : function () { } }; });
    return { days: NT.DAYS.map(function (d) { return { l: d[1] }; }), rows: rows, un: un, hasUn: un.length > 0, bays: bays, canAssign: !tech };
  };

  NT.vm.feedback = function (A, c, s) {
    var n = NT.fb.length, sum = 0, dist = [0, 0, 0, 0, 0, 0]; NT.fb.forEach(function (x) { sum += x.stars; dist[x.stars]++; });
    return { avg: (sum / n).toFixed(1), n: n, feat: NT.fb.filter(function (x) { return x.feat; }).length,
      dist: [5, 4, 3, 2, 1].map(function (k) { return { k: k + ' star' + (k > 1 ? 's' : ''), n: dist[k], w: Math.round(dist[k] / n * 100) + '%' }; }),
      rows: NT.fb.map(function (x) {
        var rep = s.replying === x.id;
        return { name: x.name, job: x.job, stars: stars(x.stars), starsLbl: x.stars + ' out of 5', text: x.text, at: F.d(x.at), feat: x.feat, toggle: A.toggleFeat(x), hasReply: !!x.reply && !rep, reply: x.reply, replying: rep, notRep: !rep, open: A.openReply(x), btnLbl: x.reply ? 'Edit reply' : 'Reply' };
      }) };
  };

  NT.vm.inspection = function (A, c, s) {
    var j = NT.job(s.param); if (!j) return { missing: true, found: false, back: A.to('jobs') };
    var i = inspOf(j.id), v = NT.veh(j.vid), cu = NT.cust(j.cid), done = 0, ok = 0, watch = 0, fix = 0;
    NT.INSP_ALL.forEach(function (x) { var r = i.r[x[0]]; if (r) { done++; if (r === 'ok') ok++; else if (r === 'watch') watch++; else fix++; } });
    var groups = NT.INSP.map(function (g) {
      return { g: g[0], items: g[1].map(function (x) {
        var r = i.r[x[0]] || '';
        return { l: x[1], okC: r === 'ok' ? 'btn sm primary' : 'btn sm', wC: r === 'watch' ? 'btn sm primary' : 'btn sm', fC: r === 'fix' ? 'btn sm primary' : 'btn sm', okP: r === 'ok' ? 'true' : 'false', wP: r === 'watch' ? 'true' : 'false', fP: r === 'fix' ? 'true' : 'false',
          ok: A.mark(j.id, x[0], 'ok'), watch: A.mark(j.id, x[0], 'watch'), fix: A.mark(j.id, x[0], 'fix') };
      }) };
    });
    var photos = []; for (var k = 1; k <= i.photos; k++) photos.push({ n: 'Photo ' + k });
    return { missing: false, found: true, id: j.id, title: j.title, car: NT.vname(v) + ' · ' + v.plate, cust: cu.name, groups: groups, total: NT.INSP_ALL.length, done: done, ok: ok, watch: watch, fix: fix, photos: photos, hasPhotos: photos.length > 0,
      sent: i.sent, notSent: !i.sent, addPhoto: A.addPhoto(j.id), canAdd: i.photos < 4, back: A.to('job', j.id), noteTxt: c.state.f.inote !== undefined ? c.state.f.inote : i.note };
  };
})(window.NT);
