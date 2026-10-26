/* Workshop: catalogue, fleet, content, insights, users */
(function (NT) {
  var F = NT.fmt, opts = NT.opts, pesewas = NT.pesewas;
  var cats = function () { var k = []; NT.services.forEach(function (x) { if (k.indexOf(x.cat) < 0) k.push(x.cat); }); return k; };

  NT.act.push(function (A, c, s) {
    var set = A.set;
    /* services */
    A.openSvc = function (id) {
      return function () {
        c._opener = document.activeElement; var x = id ? NT.svc(id) : null;
        set({ dlg: { type: 'svc', id: id || '' }, errs: [], f: Object.assign({}, c.state.f, { vname: x ? x.name : '', vcat: x ? x.cat : 'Routine', vprice: x ? (x.price / 100).toFixed(2) : '', vmins: x ? String(x.mins) : '', vdesc: x ? x.desc : '' }) });
      };
    };
    A.saveSvc = function () {
      var f = c.state.f, errs = [], price = pesewas(f.vprice), mins = parseInt(f.vmins, 10);
      if (!(f.vname || '').trim()) errs.push({ f: 'vname', m: 'Enter the service name.' });
      if (isNaN(price) || price <= 0) errs.push({ f: 'vprice', m: 'Enter a price above zero.' });
      if (isNaN(mins) || mins <= 0) errs.push({ f: 'vmins', m: 'Enter the duration in minutes.' });
      if (errs.length) return set({ errs: errs });
      var id = c.state.dlg.id, x = id ? NT.svc(id) : null;
      if (x) { x.name = f.vname; x.cat = f.vcat; x.price = price; x.mins = mins; x.desc = f.vdesc || x.desc; }
      else NT.services.push({ id: 's' + (NT.services.length + 1), name: f.vname, cat: f.vcat, desc: f.vdesc || '', price: price, mins: mins, active: true });
      set({ dlg: null }); A.flash(x ? 'Service saved' : 'Service added');
    };
    A.deactivateSvc = function (x) { return function () { x.active = false; set({ ask: '' }); A.flash(x.name + ' deactivated'); }; };
    A.activateSvc = function (x) { return function () { x.active = true; A.flash(x.name + ' is active again'); A.rebuild(); }; };
    /* fleet */
    A.saveFleetVeh = function () {
      var f = c.state.f, errs = [];
      if (!(f.fplate || '').trim()) errs.push({ f: 'fplate', m: 'Enter the plate.' });
      if (!(f.fmodel || '').trim()) errs.push({ f: 'fmodel', m: 'Enter the make and model.' });
      if (errs.length) return set({ errs: errs });
      var mm = f.fmodel.split(' ');
      NT.vehicles.push({ id: 'v' + (NT.vehicles.length + 1), cid: 'c4', make: mm[0], model: mm.slice(1).join(' ') || '—', year: 2024, colour: 'White', plate: f.fplate, km: 0, driver: f.fdriver || '—', dphone: f.fdphone || '—' });
      set({ dlg: null, f: {} }); A.flash(f.fplate + ' added to the fleet');
    };
    A.saveSched = function () {
      var f = c.state.f, errs = [];
      if (!(f.sservice || '').trim()) errs.push({ f: 'sservice', m: 'Enter the service.' });
      if (!f.skm && !f.sdays) errs.push({ f: 'skm', m: 'Set an interval in km or days.' });
      if (errs.length) return set({ errs: errs });
      NT.schedules.push({ id: 'sc' + (NT.schedules.length + 1), vid: f.svid || 'v4', sv: f.sservice, km: parseInt(f.skm, 10) || 0, days: parseInt(f.sdays, 10) || 0, last: '—', due: 'Not yet done' });
      set({ dlg: null, f: {} }); A.flash('Schedule added');
    };
    /* blog */
    A.newPost = function () { A.setF({ ptitle: '', pcat: 'Routine', pbody: '', pstatus: 'Draft' }); A.go('blog-edit', 'new'); };
    A.editPost = function (p) { return function () { A.setF({ ptitle: p.title, pcat: p.cat, pbody: p.body.join('\n\n'), pstatus: p.status }); A.go('blog-edit', p.id); }; };
    A.savePost = function () {
      var f = c.state.f;
      if (!(f.ptitle || '').trim()) return set({ errs: [{ f: 'ptitle', m: 'Give the post a title.' }] });
      var p = NT.by(NT.posts, c.state.param), body = (f.pbody || 'Draft.').split(/\n\n+/);
      if (p) { p.title = f.ptitle; p.cat = f.pcat; p.status = f.pstatus; p.body = body; }
      else NT.posts.unshift({ id: 'p' + (NT.posts.length + 1), title: f.ptitle, cat: f.pcat, status: f.pstatus, at: NT.NOW.slice(0, 10), body: body, feat: false });
      A.go('blog-admin'); A.flash('Post saved as ' + f.pstatus);
    };
    /* users */
    A.saveInvite = function () {
      var f = c.state.f, errs = [];
      if (!(f.iname || '').trim()) errs.push({ f: 'iname', m: 'Enter the name.' });
      if (!f.iemail || f.iemail.indexOf('@') < 1) errs.push({ f: 'iemail', m: 'Enter a valid email.' });
      if (errs.length) return set({ errs: errs });
      NT.users.push({ id: 'u' + (NT.users.length + 1), name: f.iname, title: f.irole === 'admin' ? 'Admin' : 'Technician', email: f.iemail, role: f.irole || 'technician', active: true });
      set({ dlg: null, f: {} }); A.flash('Invitation sent to ' + f.iemail);
    };
    A.deactivateUser = function (u) { return function () { u.active = false; set({ ask: '' }); A.flash(u.name + ' deactivated'); }; };
    A.reactivateUser = function (u) { return function () { u.active = true; A.flash(u.name + ' reactivated'); A.rebuild(); }; };
    A.dx = A.dx || {};
    if (s.dlg && s.dlg.type === 'svc') A.dx.svc = { edit: !!s.dlg.id, add: !s.dlg.id, cats: opts(cats().concat(['Other'])) };
    if (s.dlg && (s.dlg.type === 'fveh' || s.dlg.type === 'fsched')) A.dx.fleet = { vans: NT.vehicles.filter(function (v) { return v.cid === 'c4'; }).map(function (v) { return { v: v.id, l: v.plate }; }) };
    if (s.dlg && s.dlg.type === 'invite') A.dx.invite = { roles: [{ v: 'technician', l: 'Technician' }, { v: 'admin', l: 'Admin' }] };
    A.postCats = opts(['Brakes', 'Routine', 'Climate', 'Tyres', 'Diagnostics']);
    A.postStatuses = opts(['Draft', 'Published', 'Archived']);
  });

  NT.vm['services-admin'] = function (A, c, s) {
    var rows = NT.services.map(function (x) { return { name: x.name, cat: x.cat, price: F.m(x.price), mins: x.mins, active: x.active, inactive: !x.active, pill: x.active ? 'pill ok' : 'pill', label: x.active ? 'Active' : 'Inactive', rowCls: s.ask === x.id ? 'ask' : '', asking: s.ask === x.id, normal: s.ask !== x.id && x.active, off: s.ask !== x.id && !x.active, edit: A.openSvc(x.id), ask: A.askRow(x.id), doOff: A.deactivateSvc(x), on: A.activateSvc(x) }; });
    var cs = cats().map(function (k) { return { k: k, n: NT.services.filter(function (x) { return x.cat === k; }).length }; });
    return { rows: rows, cats: cs, add: A.openSvc('') };
  };

  NT.vm.fleet = function (A, c, s) {
    var rows = [{ company: 'Mensah Logistics', contact: 'Esi Mensah', phone: '024 700 3318', limit: F.m(2000000), out: F.m(485000), active: true, go: A.to('fleet-account', 'Mensah Logistics') }];
    return { rows: rows };
  };

  NT.vm['fleet-account'] = function (A, c, s) {
    var vans = NT.vehicles.filter(function (v) { return v.cid === 'c4'; }).map(function (v) { return { plate: v.plate, t: NT.vname(v), driver: v.driver || '—', dphone: v.dphone || '—' }; });
    var sch = NT.schedules.map(function (x) { var v = NT.veh(x.vid); return { plate: v.plate, sv: x.sv, every: (x.km ? F.n(x.km) + ' km' : '') + (x.km && x.days ? ' or ' : '') + (x.days ? x.days + ' days' : ''), last: x.last === '—' ? '—' : F.d(x.last), due: x.due, isDue: x.due === 'Due now', pill: x.due === 'Due now' ? 'pill warn' : 'pill' }; });
    return { vans: vans, sch: sch, limit: F.m(2000000), out: F.m(485000), left: F.m(1515000), addVeh: A.openDlg('fveh'), addSched: A.openDlg('fsched'), back: A.to('fleet') };
  };

  NT.vm['blog-admin'] = function (A, c, s) {
    return { rows: NT.posts.map(function (p) { return { t: p.title, cat: p.cat, d: F.d(p.at), status: p.status, pill: 'pill ' + NT.pill(p.status), edit: A.editPost(p) }; }), add: A.newPost };
  };
  NT.vm['blog-edit'] = function (A, c, s) { return { isNew: s.param === 'new', back: A.to('blog-admin'), ttl: s.param === 'new' ? 'New post' : 'Edit post' }; };

  NT.vm.analytics = function (A, c, s) {
    var per = A.curTab('month'), data = NT.revenue[per], max = 0;
    data.forEach(function (d) { if (d[1] > max) max = d[1]; });
    var cols = data.map(function (d) { return { l: d[0], v: F.m(d[1] * 100), h: max ? Math.max(2, Math.round(d[1] / max * 150)) + 'px' : '2px' }; });
    var counts = NT.JOB_FLOW.concat(['Quote rejected', 'Cancelled']).map(function (st) { return { st: st, n: NT.jobs.filter(function (j) { return j.status === st; }).length }; });
    var wk = per === 'week', m = function (g) { return F.m(g * 100); };
    var kpis = wk ? [
      { l: 'Revenue this week (GHS)', v: m(17950), d: '+8%', pill: 'pill ok', note: 'on 16,620 last week' },
      { l: 'Jobs completed', v: '14', d: '+2', pill: 'pill ok', note: 'on 12 last week' },
      { l: 'Average job value (GHS)', v: m(1282), d: '+3%', pill: 'pill ok', note: 'on 1,245 last week' },
      { l: 'Average turnaround', v: '2.6 days', d: '-0.3', pill: 'pill ok', note: 'days faster' }
    ] : [
      { l: 'Revenue this month (GHS)', v: m(18450), d: '+14%', pill: 'pill ok', note: 'on 16,200 last month' },
      { l: 'Jobs completed', v: '57', d: '+6', pill: 'pill ok', note: 'on 51 last month' },
      { l: 'Average job value (GHS)', v: m(324), d: '+5%', pill: 'pill ok', note: 'on 309 last month' },
      { l: 'Average turnaround', v: '2.9 days', d: '+0.2', pill: 'pill warn', note: 'days slower' }
    ];
    var fun = wk ? [['Quotes sent', 11], ['Quotes approved', 9], ['Jobs completed', 8]] : [['Quotes sent', 46], ['Quotes approved', 35], ['Jobs completed', 32]];
    var funnel = fun.map(function (x) { return { l: x[0], n: x[1], p: Math.round(x[1] / fun[0][1] * 100) + '%', w: Math.round(x[1] / fun[0][1] * 100) + '%' }; });
    var methods = wk ? [['Mobile money', 51], ['Cash', 24], ['Card', 15], ['Bank transfer', 10]] : [['Mobile money', 48], ['Cash', 27], ['Card', 15], ['Bank transfer', 10]].map(function (x) { return x; });
    var owed = wk ? [['Paid', 'pill ok', 14, 14350], ['Part paid', 'pill warn', 3, 1900], ['Unpaid', 'pill', 2, 1700]] : [['Paid', 'pill ok', 49, 14200], ['Part paid', 'pill warn', 6, 2350], ['Unpaid', 'pill', 5, 1900]];
    var mix = wk ? [['New customers', '4'], ['Returning customers', '17'], ['Fleet accounts served', '2'], ['Repeat rate', '81%']] : [['New customers', '6'], ['Returning customers', '34'], ['Fleet accounts served', '3'], ['Repeat rate', '85%']];
    return { kpis: kpis, funnel: funnel,
      methods: methods.map(function (x) { return { l: x[0], p: x[1] + '%' }; }),
      owed: owed.map(function (x) { return { l: x[0], pill: x[1], n: x[2], v: m(x[3]) }; }),
      mix: mix.map(function (x) { return { l: x[0], v: x[1] }; }),
      per: per, isMonth: per === 'month', isWeek: per === 'week', setWeek: A.setTab('week'), setMonth: A.setTab('month'), cols: cols,
      counts: counts.map(function (x) { return { st: x.st, n: x.n, zero: x.n === 0 }; }),
      top: NT.topServices.map(function (x) { return { n: x[0], v: F.m(x[1] * 100) }; }),
      techs: NT.techStats.filter(function (x) { var q = s.f && s.f.atech; return !q || q === 'all' || q === x[0]; }).map(function (x) { return { n: x[0], jobs: x[1], hrs: x[2].toFixed(1) }; }),
      techOpts: [{ v: 'all', l: 'All technicians' }].concat(NT.techStats.map(function (x) { return { v: x[0], l: x[0] }; })),
      exportAll: A.exportCsv('Analytics report'), exportTech: A.exportCsv('Technician performance') };
  };

  NT.vm.users = function (A, c, s) {
    return { rows: NT.users.map(function (u) {
      var me = (NT.ACCOUNTS[s.acct] || {}).uid === u.id, asking = s.ask === u.id;
      return { name: u.name, title: u.title, email: u.email, role: u.role === 'admin' ? 'Admin' : 'Technician', active: u.active, pill: u.active ? 'pill ok' : 'pill', label: u.active ? 'Active' : 'Inactive', rowCls: asking ? 'ask' : '', asking: asking, canOff: u.active && !me && !asking, isMe: me, canOn: !u.active, ask: A.askRow(u.id), doOff: A.deactivateUser(u), on: A.reactivateUser(u) };
    }), invite: A.openDlg('invite') };
  };
})(window.NT);
