/* Core — helpers, routes, access, shell, dialogs, search. Each batch below is marked, so later screens can be appended the same way. */
(function (NT) {
  /* Helpers */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var F = NT.fmt = {
    m: function (p) { var s = (Math.abs(p) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (p < 0 ? '-' : '') + s; },
    d: function (s) { if (!s) return '—'; var a = s.slice(0, 10).split('-'); return +a[2] + ' ' + MON[+a[1] - 1] + ' ' + a[0]; },
    dt: function (s) { if (!s) return '—'; return F.d(s) + ' at ' + s.slice(11, 16); },
    n: function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); },
    ini: function (n) { return n.split(' ').map(function (x) { return x[0]; }).slice(0, 2).join(''); }
  };
  var by = function (arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; };
  NT.by = by;
  NT.cust = function (id) { return by(NT.customers, id); };
  NT.veh = function (id) { return by(NT.vehicles, id); };
  NT.svc = function (id) { return by(NT.services, id); };
  NT.job = function (id) { return by(NT.jobs, id); };
  NT.quote = function (id) { return by(NT.quotes, id); };
  NT.inv = function (id) { return by(NT.invoices, id); };
  NT.user = function (id) { return by(NT.users, id); };
  NT.vname = function (v) { return v ? v.year + ' ' + v.make + ' ' + v.model : '—'; };
  NT.totals = function (d) { var s = 0; d.lines.forEach(function (l) { s += l.q * l.u; }); return { sub: s, total: s + (d.tax || 0) - (d.disc || 0) }; };
  NT.PILL = { 'Completed': 'ok', 'Paid': 'ok', 'Approved': 'ok', 'Confirmed': 'ok', 'Published': 'ok', 'Ready for pickup': 'ok', 'Quote approved': 'ok', 'Pending': 'warn', 'Overdue': 'warn', 'Partially paid': 'warn', 'Cancelled': 'bad', 'Quote rejected': 'bad', 'Rejected': 'bad', 'Failed': 'bad', 'No show': 'bad', 'In progress': 'brand', 'Diagnosing': 'brand', 'Quality check': 'brand', 'Quote sent': 'brand', 'Sent': 'brand', 'Refunded': '', 'Expired': '', 'Draft': '', 'Intake': '', 'Archived': '' };
  NT.pill = function (s) { return NT.PILL[s] || ''; };
  NT.activeJob = function (j) { return ['Completed', 'Cancelled', 'Quote rejected'].indexOf(j.status) < 0; };
  NT.balance = function (i) { return NT.totals(i).total - i.paid; };
  NT.overdueDays = function (i) { var a = new Date(i.due), b = new Date(NT.NOW.slice(0, 10)); return Math.max(0, Math.round((b - a) / 864e5)); };

  /* Routes */
  var T = 'dashboard bookings jobs job job-new'.split(' ');
  NT.ROUTES = {
    home: 'pub', services: 'pub', book: 'pub', track: 'pub', 'track-job': 'pub', blog: 'pub', article: 'pub',
    signin: 'auth', register: 'auth', forgot: 'auth', reset: 'auth', denied: 'auth',
    dashboard: 'ws', bookings: 'ws', jobs: 'ws', 'job-new': 'ws', job: 'ws', customers: 'ws', quotes: 'ws', quote: 'ws', invoices: 'ws', invoice: 'ws', payments: 'ws', 'services-admin': 'ws', fleet: 'ws', 'fleet-account': 'ws', 'blog-admin': 'ws', 'blog-edit': 'ws', analytics: 'ws', users: 'ws',
    portal: 'cu', 'my-jobs': 'cu', 'my-job': 'cu', vehicles: 'cu', 'my-quotes': 'cu', 'my-quote': 'cu', 'my-invoices': 'cu', 'my-invoice': 'cu', notifications: 'cu', profile: 'cu'
  };
  NT.TECH = { bookings: 1, jobs: 1, job: 1, 'job-new': 1 };
  NT.NAV_AS = { job: 'jobs', 'job-new': 'jobs', quote: 'quotes', invoice: 'invoices', 'fleet-account': 'fleet', 'blog-edit': 'blog-admin', 'my-job': 'my-jobs', 'my-quote': 'my-quotes', 'my-invoice': 'my-invoices' };
  NT.PARENT_LBL = { job: 'Jobs', 'job-new': 'Jobs', quote: 'Quotes', invoice: 'Invoices', 'fleet-account': 'Fleet', 'blog-edit': 'Blog', 'my-job': 'My jobs', 'my-quote': 'Quotes', 'my-invoice': 'Invoices' };
  var I = {
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z', cal: 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4', wrench: 'M14 6a4 4 0 0 0 5 5l-9 9a2 2 0 0 1-3-3l9-9z', users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 3-5 6-5s6 2 6 5M17 11a3 3 0 0 0 0-6M21 20c0-2-1-4-3-5', file: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7', cash: 'M3 7h18v10H3zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z', tag: 'M3 12V3h9l9 9-9 9z', truck: 'M2 6h11v10H2zM13 9h5l3 3v4h-8zM6 19a1.5 1.5 0 1 0 0-3M17 19a1.5 1.5 0 1 0 0-3', pen: 'M4 20l4-1L19 8l-3-3L5 16z', chart: 'M4 20V10M10 20V4M16 20v-8M22 20H2', shield: 'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z', car: 'M3 13l2-6h14l2 6v5H3zM3 13h18M7 16h.01M17 16h.01', bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6'
  };
  NT.IC = I;
  NT.WS_MENU = [
    ['Overview', [['Dashboard', 'dashboard', 'grid']]],
    ['Operations', [['Bookings', 'bookings', 'cal'], ['Jobs', 'jobs', 'wrench'], ['Customers', 'customers', 'users']]],
    ['Finance', [['Quotes', 'quotes', 'file'], ['Invoices', 'invoices', 'file'], ['Payments', 'payments', 'cash']]],
    ['Catalogue', [['Services', 'services-admin', 'tag'], ['Fleet', 'fleet', 'truck']]],
    ['Content', [['Blog', 'blog-admin', 'pen']]],
    ['Insights', [['Analytics', 'analytics', 'chart']]],
    ['System', [['Users', 'users', 'shield']]]
  ];
  NT.CU_MENU = [
    ['Overview', [['Dashboard', 'portal', 'grid']]],
    ['My vehicle', [['My jobs', 'my-jobs', 'wrench'], ['My vehicles', 'vehicles', 'car'], ['Quotes', 'my-quotes', 'file'], ['Invoices', 'my-invoices', 'cash']]],
    ['Account', [['Notifications', 'notifications', 'bell'], ['Profile', 'profile', 'user']]]
  ];
  NT.TITLES = { dashboard: 'Dashboard', bookings: 'Bookings', jobs: 'Jobs', 'job-new': 'New job', job: 'Job', customers: 'Customers', quotes: 'Quotes', quote: 'Quote', invoices: 'Invoices', invoice: 'Invoice', payments: 'Payments', 'services-admin': 'Services', fleet: 'Fleet', 'fleet-account': 'Fleet account', 'blog-admin': 'Blog', 'blog-edit': 'Post', analytics: 'Analytics', users: 'Users', portal: 'Dashboard', 'my-jobs': 'My jobs', 'my-job': 'Job', vehicles: 'My vehicles', 'my-quotes': 'Quotes', 'my-quote': 'Quote', 'my-invoices': 'Invoices', 'my-invoice': 'Invoice', notifications: 'Notifications', profile: 'Profile' };
  NT.ACCOUNTS = {
    efua: { uid: 'u1', role: 'admin', name: 'Efua Darko', title: 'Workshop manager', land: 'dashboard' },
    kwame: { uid: 'u2', role: 'technician', name: 'Kwame Boateng', title: 'Technician', land: 'jobs' },
    ama: { uid: 'c1', role: 'customer', name: 'Ama Mensah', title: 'Customer', land: 'portal' }
  };
  NT.SKEL = { dashboard: 'dash', analytics: 'dash', bookings: 'list', jobs: 'list', customers: 'list', quotes: 'list', invoices: 'list', payments: 'list', 'services-admin': 'list', fleet: 'list', 'blog-admin': 'list', users: 'list', 'my-jobs': 'list', 'my-quotes': 'list', 'my-invoices': 'list', notifications: 'list', vehicles: 'cards', portal: 'cards', job: 'detail', quote: 'detail', invoice: 'detail', 'fleet-account': 'detail', 'my-job': 'detail', 'my-quote': 'detail', 'my-invoice': 'detail', profile: 'form', 'job-new': 'form', 'blog-edit': 'form' };
  NT.seen = NT.seen || {};
  NT.ASYNC = { submitSignin: ['submit', 600], submitRegister: ['submit', 800], submitForgot: ['submit', 800], submitReset: ['submit', 800], confirmBooking: ['confirm', 900], createJob: ['create', 900], confirmStatus: ['confirmStatus', 800], saveDiag: ['save', 700], saveSvc: ['save', 700], saveCust: ['save', 700], saveSched: ['save', 700], saveFleetVeh: ['save', 700], saveInvite: ['save', 800], savePost: ['save', 700], confirmRec: ['confirmRec', 900], confirmPay: ['confirmPay', 1200], approve: ['approve', 900], reject: ['reject', 900], saveProfile: ['saveProfile', 800], saveVehicle: ['save', 700] };
  NT.ASYNC_F = { sendQuote: ['send', 900], sendInvoice: ['send', 800] };
  /* Progress bar: start() on any async work, done() when it settles. Calls are counted, so overlapping work keeps the bar moving. */
  NT.prog = {
    start: function (c) { c._pc = (c._pc || 0) + 1; if (c._pc > 1) return; clearInterval(c._pi); c._pw = 8; c.setState({ prog: { w: 8, o: 1 } }); c._pi = setInterval(function () { c._pw += (88 - c._pw) * 0.14; c.setState({ prog: { w: Math.round(c._pw), o: 1 } }); }, 200); },
    done: function (c) { c._pc = Math.max(0, (c._pc || 1) - 1); if (c._pc > 0) return; clearInterval(c._pi); c.setState({ prog: { w: 100, o: 1 } }); setTimeout(function () { c.setState({ prog: { w: 100, o: 0 } }); setTimeout(function () { if (!c._pc) c.setState({ prog: { w: 0, o: 0 } }); }, 320); }, 220); }
  };
  /* Page load: first visit to a data screen shows its skeleton. Later visits keep the data and only show the progress bar. */
  NT.beginLoad = function (c, name) {
    var k = NT.ROUTES[name], shell = k === 'ws' || k === 'cu';
    var first = shell && !!NT.SKEL[name] && !NT.seen[name];
    NT.prog.start(c); clearTimeout(c._pl);
    c.setState({ loadingPage: first });
    c._pl = setTimeout(function () { NT.seen[name] = 1; c.setState({ loadingPage: false }); NT.prog.done(c); }, first ? 750 : 380);
  };
  NT.vm = NT.vm || {};
  NT.act = NT.act || [];

  /* Core: builds the app object that every screen reads */
  NT.core = function (c) {
    var s = c.state, db = NT;
    var A = {};
    var set = function (o) { c.setState(o); };
    var store = function (k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { } };
    A.rebuild = function () { c.forceUpdate(); };
    A.flash = function (msg) { set({ toast: msg }); clearTimeout(c._tt); c._tt = setTimeout(function () { set({ toast: '' }); }, 2600); };
    A.set = set; A.c = c;
    /* access */
    var kindOf = function (r) { return NT.ROUTES[r] || ''; };
    var allowed = function (r) {
      var k = kindOf(r); if (!k) return false;
      if (k === 'pub' || k === 'auth') return true;
      if (k === 'ws') return s.role === 'admin' || (s.role === 'technician' && !!NT.TECH[r]);
      if (k === 'cu') return s.role === 'customer';
      return false;
    };
    var eff = allowed(s.route) ? s.route : 'denied';
    A.route = eff; A.param = s.param; A.kind = kindOf(eff);
    A.shell = A.kind === 'ws' || A.kind === 'cu';
    A.isPub = A.kind === 'pub'; A.isAuth = A.kind === 'auth';
    A.role = s.role; A.f = new Proxy(s.f || {}, { get: function (t, k) { return t[k] === undefined ? (NT.fdef && NT.fdef[k] !== undefined ? NT.fdef[k] : '') : t[k]; } });
    A.errs = s.errs || []; A.hasErrs = A.errs.length > 0;
    A.ec = {}; A.eh = {}; A.errs.forEach(function (e) { A.ec[e.f] = 'err'; A.eh[e.f] = e.m; });
    A.ecp = new Proxy(A.ec, { get: function (t, k) { return t[k] || ''; } });
    A.ehp = new Proxy(A.eh, { get: function (t, k) { return t[k] || ''; } });
    A.toast = s.toast; A.hasToast = !!s.toast;
    A.me = s.role ? { name: (NT.ACCOUNTS[s.acct] || {}).name || '', title: (NT.ACCOUNTS[s.acct] || {}).title || '' } : { name: '', title: '' };
    A.me.ini = F.ini(A.me.name || ' ');
    A.signedIn = !!s.role; A.signedOut = !s.role;
    A.isCustomer = s.role === 'customer';
    A.cid = 'c1';
    /* navigation */
    A.go = function (name, param) {
      var h = name + (param ? '/' + encodeURIComponent(param) : '');
      set({ route: name, param: param || '', pop: '', mob: false, ask: '', dlg: null, drawer: null, errs: [], pubmenu: false, loading: false });
      c._hashSet = h;
      try { if (location.hash.slice(1) !== h) location.hash = h; } catch (e) { }
      try { window.scrollTo(0, 0); } catch (e) { }
      NT.beginLoad(c, name);
    };
    A.nav = {};
    Object.keys(NT.ROUTES).forEach(function (r) { A.nav[r] = function () { A.go(r); }; });
    A.to = function (r, p) { return function () { A.go(r, p); }; };
    A.back = function () { try { history.back(); } catch (e) { } };
    A.signinAs = function (key) {
      var a = NT.ACCOUNTS[key]; store('nt-acct', key);
      set({ role: a.role, acct: key, f: {}, errs: [] }); setTimeout(function () { A.go(a.land); }, 0);
    };
    A.signinAsEfua = function () { A.signinAs('efua'); };
    A.signinAsKwame = function () { A.signinAs('kwame'); };
    A.signinAsAma = function () { A.signinAs('ama'); };
    A.signout = function () { store('nt-acct', null); set({ role: '', acct: '', pop: '' }); setTimeout(function () { A.go('signin'); }, 0); };
    A.submitSignin = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      var em = (s.f.email || '').toLowerCase(), errs = [];
      if (!em) errs.push({ f: 'email', m: 'Enter your email.' });
      if (!s.f.password) errs.push({ f: 'password', m: 'Enter your password.' });
      if (errs.length) return set({ errs: errs });
      A.signinAs(em.indexOf('efua') >= 0 ? 'efua' : em.indexOf('kwame') >= 0 ? 'kwame' : 'ama');
    };
    /* forms */
    A.inp = function (e) { var t = e.target, f = Object.assign({}, c.state.f); f[t.name] = t.type === 'checkbox' ? t.checked : t.value; set({ f: f }); };
    A.setF = function (o) { set({ f: Object.assign({}, c.state.f, o) }); };
    A.tab = s.tab || {};
    A.setTab = function (k) { return function () { set({ tab: Object.assign({}, c.state.tab, { [A.route]: k }) }); }; };
    A.curTab = function (def) { return (s.tab || {})[A.route] || def; };
    A.skeleton = function () { set({ loading: true }); clearTimeout(c._sk); c._sk = setTimeout(function () { set({ loading: false }); }, 900); };
    A.loading = !!s.loading;
    /* row questions */
    A.askRow = function (id) { return function () { set({ ask: id, f: Object.assign({}, c.state.f, { reason: '' }), errs: [] }); }; };
    A.cancelAsk = function () { set({ ask: '', errs: [] }); };
    A.asking = s.ask;
    /* dialogs */
    A.openDlg = function (type, data) {
      return function () { c._opener = document.activeElement; set({ dlg: Object.assign({ type: type }, data || {}), errs: [], pop: '' }); };
    };
    A.closeDlg = function () {
      set({ dlg: null, errs: [] });
      setTimeout(function () { try { if (c._opener && c._opener.focus) c._opener.focus(); } catch (e) { } }, 0);
    };
    A.dlgKey = function (e) { if (e.key === 'Escape') { e.stopPropagation(); A.closeDlg(); } };
    A.noop = function (e) { e.stopPropagation(); };
    A.dlg = s.dlg || {}; A.hasDlg = !!s.dlg;
    A.dlgIs = new Proxy({}, { get: function (t, k) { return !!(s.dlg && s.dlg.type === k); } });
    A.openDrawer = function (id) { return function () { c._opener = document.activeElement; set({ drawer: id, pop: '' }); }; };
    A.closeDrawer = function () { set({ drawer: null }); setTimeout(function () { try { c._opener && c._opener.focus(); } catch (e) { } }, 0); };
    A.drawerKey = function (e) { if (e.key === 'Escape') A.closeDrawer(); };
    /* popovers */
    A.pop = s.pop;
    A.popIs = new Proxy({}, { get: function (t, k) { return s.pop === k; } });
    A.openPop = function (k) { return function () { set({ pop: c.state.pop === k ? '' : k }); }; };
    A.closePop = function () { set({ pop: '' }); };
    A.popKey = function (e) { if (e.key === 'Escape') set({ pop: '' }); };
    A.mobOpen = !!s.mob; A.sideCls = 'sidebar' + (s.collapsed ? ' collapsed' : '') + (s.mob ? ' open' : '');
    A.collapsed = !!s.collapsed; A.collExp = s.collapsed ? 'false' : 'true'; A.collLabel = s.collapsed ? 'Expand menu' : 'Collapse menu'; A.collPath = s.collapsed ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6';
    A.toggleCollapse = function () { var v = !c.state.collapsed; set({ collapsed: v }); store('nt-coll', v ? '1' : null); };
    A.prog = s.prog || { w: 0, o: 0 }; A.progStyle = 'width:' + A.prog.w + '%;opacity:' + A.prog.o;
    A.showSkel = (A.kind === 'ws' || A.kind === 'cu') && !!s.loadingPage; A.skelKind = NT.SKEL[eff] || 'list';
    A.toggleMob = function () { set({ mob: !c.state.mob }); };
    A.pubMenuCls = 'pubnav' + (s.pubmenu ? ' open' : '');
    A.togglePubMenu = function () { set({ pubmenu: !c.state.pubmenu }); };
    /* shell: menu, crumbs, bell, search */
    var navAs = NT.NAV_AS[eff] || eff;
    var counts = {
      bookings: db.bookings.filter(function (b) { return b.status === 'Pending'; }).length,
      jobs: db.jobs.filter(NT.activeJob).length
    };
    A.menu = [];
    if (A.shell) {
      var src = A.kind === 'ws' ? NT.WS_MENU : NT.CU_MENU;
      src.forEach(function (g) {
        var items = g[1].filter(function (it) { return A.kind === 'cu' || s.role === 'admin' || NT.TECH[it[1]]; }).map(function (it) {
          var cnt = A.kind === 'ws' ? counts[it[1]] || 0 : 0;
          return { label: it[0], route: it[1], ic: I[it[2]], cls: cnt > 0 ? 'has' : '', current: navAs === it[1] ? 'page' : 'false', count: cnt, hasCount: cnt > 0, go: function () { A.go(it[1]); } };
        });
        if (items.length) A.menu.push({ group: g[0], items: items });
      });
    }
    A.wsMode = A.kind === 'ws'; A.cuMode = A.kind === 'cu';
    A.modeWs = A.kind === 'ws' ? 'true' : 'false'; A.modeCu = A.kind === 'cu' ? 'true' : 'false';
    var lbl = NT.TITLES[eff] || '';
    A.title = lbl;
    A.crumbs = [];
    if (A.shell) {
      A.crumbs.push({ t: A.kind === 'ws' ? 'Workshop' : 'Customer', go: function () { A.go(A.kind === 'ws' ? (s.role === 'admin' ? 'dashboard' : 'jobs') : 'portal'); }, link: true });
      if (NT.NAV_AS[eff]) {
        var pr = NT.NAV_AS[eff];
        A.crumbs.push({ t: NT.PARENT_LBL[eff], go: function () { A.go(pr); }, link: true });
        A.crumbs.push({ t: s.param ? decodeURIComponent(s.param) : lbl, link: false });
      } else A.crumbs.push({ t: lbl, link: false });
    }
    var unread = db.notifs.filter(function (n) { return !n.read; });
    A.bellCount = unread.length; A.hasBell = unread.length > 0;
    A.bell = unread.map(function (n) { return { text: n.text, sub: n.sub, go: function () { n.read = true; A.go(n.to, n.p); } }; });
    A.noBell = unread.length === 0;
    A.qv = s.q || '';
    A.onSearch = function (e) { set({ q: e.target.value, pop: 'search' }); };
    var res = [], q = (s.q || '').toLowerCase().replace(/\s+/g, '');
    if (q.length > 1 && A.shell) {
      db.customers.forEach(function (x) { if ((x.name + x.phone).toLowerCase().replace(/\s+/g, '').indexOf(q) >= 0) res.push({ t: x.name, sub: 'Customer · ' + x.phone, go: function () { set({ q: '' }); A.go('customers'); setTimeout(A.openDrawer(x.id), 0); } }); });
      db.vehicles.forEach(function (v) { if (v.plate.toLowerCase().replace(/\s+/g, '').indexOf(q) >= 0) res.push({ t: v.plate, sub: NT.vname(v) + ' · ' + NT.cust(v.cid).name, go: function () { set({ q: '' }); A.go(A.kind === 'ws' ? 'jobs' : 'vehicles'); } }); });
      db.jobs.forEach(function (j) { if (j.id.toLowerCase().replace(/\s+/g, '').indexOf(q) >= 0 || (j.title || '').toLowerCase().replace(/\s+/g, '').indexOf(q) >= 0) { if (A.kind === 'cu' && j.cid !== 'c1') return; res.push({ t: j.id, sub: j.title + ' · ' + j.status, go: function () { set({ q: '' }); A.go(A.kind === 'ws' ? 'job' : 'my-job', j.id); } }); } });
    }
    A.results = res.slice(0, 7); A.hasResults = res.length > 0; A.noResults = res.length === 0 && q.length > 1;
    A.showSearch = s.pop === 'search' && q.length > 1;
    /* batches: each module adds its own view model and actions */
    A.v = {};
    NT.act.forEach(function (fn) { fn(A, c, s); });
    /* async actions: spinner on the button, progress bar on top, result after the delay */
    var busy = s.busy || {};
    A.bz = new Proxy({}, { get: function (t, k) { return busy[k] ? 'loading' : ''; } });
    var wrap = function (fn, key, ms) {
      return function (e) {
        if (e && e.preventDefault) e.preventDefault();
        if (c.state.busy && c.state.busy[key]) return;
        var b = Object.assign({}, c.state.busy); b[key] = true; set({ busy: b }); NT.prog.start(c);
        setTimeout(function () { try { fn(); } finally { var b2 = Object.assign({}, c.state.busy); b2[key] = false; set({ busy: b2 }); NT.prog.done(c); } }, ms);
      };
    };
    Object.keys(NT.ASYNC).forEach(function (n) { if (A[n]) A[n] = wrap(A[n], NT.ASYNC[n][0], NT.ASYNC[n][1]); });
    Object.keys(NT.ASYNC_F).forEach(function (n) { var o = A[n]; if (o) A[n] = function (x) { return wrap(o(x), NT.ASYNC_F[n][0], NT.ASYNC_F[n][1]); }; });
    var vm = NT.vm[eff]; if (vm) A.v = vm(A, c, s) || {};
    return A;
  };

  /* Public */
  /* Workshop */
  /* Portal */
})(window.NT);
