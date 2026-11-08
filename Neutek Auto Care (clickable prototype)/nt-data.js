/* Data — invented sample workshop. Money is stored in pesewas. */
window.NT = window.NT || {};
(function (NT) {
  var P = function (c) { return Math.round(c * 100); };
  NT.P = P;
  NT.NOW = '2026-10-24T09:42';
  NT.users = [
    { id: 'u1', name: 'Efua Darko', title: 'Workshop manager', email: 'efua.darko@neutek.example', role: 'admin', active: true },
    { id: 'u2', name: 'Kwame Boateng', title: 'Technician', email: 'kwame.boateng@neutek.example', role: 'technician', active: true },
    { id: 'u3', name: 'Akosua Mensah', title: 'Technician', email: 'akosua.mensah@neutek.example', role: 'technician', active: true },
    { id: 'u4', name: 'Nana Yeboah', title: 'Owner', email: 'nana.yeboah@neutek.example', role: 'admin', active: true },
    { id: 'u5', name: 'Joe Quaye', title: 'Technician', email: 'joe.quaye@neutek.example', role: 'technician', active: false }
  ];
  NT.customers = [
    { id: 'c1', name: 'Ama Mensah', phone: '024 411 2201', email: 'ama.mensah@example.com', area: 'East Legon', fleet: false },
    { id: 'c2', name: 'Kofi Asare', phone: '020 555 0188', email: 'kofi.asare@example.com', area: '', fleet: false },
    { id: 'c3', name: 'Abena Owusu', phone: '027 300 4412', email: '', area: '', fleet: false },
    { id: 'c4', name: 'Esi Mensah', phone: '024 700 3318', email: 'fleet@mensahlogistics.example', area: 'Tema', fleet: true }
  ];
  NT.vehicles = [
    { id: 'v1', cid: 'c1', make: 'Toyota', model: 'Corolla', year: 2019, colour: 'Silver', plate: 'GR 4521-22', km: 84200 },
    { id: 'v2', cid: 'c2', make: 'Honda', model: 'CR-V', year: 2021, colour: 'White', plate: 'GT 2208-21', km: 41600 },
    { id: 'v3', cid: 'c3', make: 'Mercedes-Benz', model: 'C200', year: 2016, colour: 'Black', plate: 'GW 1184-16', km: 126400 },
    { id: 'v4', cid: 'c4', make: 'Toyota', model: 'HiAce', year: 2023, colour: 'White', plate: 'GS 9001-23', km: 52100, driver: 'Kojo Antwi', dphone: '054 300 1121' },
    { id: 'v5', cid: 'c4', make: 'Toyota', model: 'HiAce', year: 2023, colour: 'White', plate: 'GS 9002-23', km: 47800, driver: 'Sam Tetteh', dphone: '020 811 4402' },
    { id: 'v6', cid: 'c4', make: 'Nissan', model: 'NV350', year: 2024, colour: 'White', plate: 'GS 9004-24', km: 18900, driver: 'Nii Lamptey', dphone: '055 400 9023' }
  ];
  NT.services = [
    { id: 's1', name: 'Oil and filter', cat: 'Routine', desc: 'Engine oil and filter change, with a fluid top-up and a quick safety look.', price: P(350), mins: 45, active: true },
    { id: 's2', name: 'Brake pads', cat: 'Brakes', desc: 'New pads fitted front or rear, discs checked and brake fluid tested.', price: P(680), mins: 90, active: true },
    { id: 's3', name: 'Full diagnostics', cat: 'Diagnostics', desc: 'Scanner read-out and a road test, with a written report of what we found.', price: P(200), mins: 60, active: true },
    { id: 's4', name: 'Wheel alignment', cat: 'Tyres', desc: 'Four-wheel alignment on the rig, with a printed before-and-after.', price: P(180), mins: 40, active: true },
    { id: 's5', name: 'AC regas', cat: 'Climate', desc: 'Recover, vacuum and refill the system, with a leak check.', price: P(450), mins: 75, active: true },
    { id: 's6', name: 'Major service', cat: 'Routine', desc: 'Oil, filters, plugs, brakes, suspension and fluids, all checked in one visit.', price: P(1250), mins: 180, active: true }
  ];
  NT.JOB_FLOW = ['Intake', 'Diagnosing', 'Quote sent', 'Quote approved', 'In progress', 'Quality check', 'Ready for pickup', 'Completed'];
  NT.MOVES = {
    'Intake': ['Diagnosing', 'Cancelled'],
    'Diagnosing': ['Quote sent', 'In progress', 'Cancelled'],
    'Quote sent': ['Quote approved', 'Quote rejected'],
    'Quote approved': ['In progress', 'Cancelled'],
    'Quote rejected': ['Diagnosing', 'Cancelled'],
    'In progress': ['Quality check', 'Cancelled'],
    'Quality check': ['Ready for pickup', 'In progress'],
    'Ready for pickup': ['Completed'],
    'Completed': [], 'Cancelled': []
  };
  var H = function (who, from, to, note, at) { return { who: who, from: from, to: to, note: note, at: at }; };
  NT.jobs = [
    { id: 'JOB-2026-088', cid: 'c1', vid: 'v1', title: 'Front suspension knock', status: 'Quote sent', priority: 'High', tech: 'u2', upd: '2026-10-23T16:20', sv: [], intake: 'Knocking over speed bumps on the front left. Started two weeks ago.', note: 'We found worn lower arm bushes on both sides. A quote is waiting for you.', est: '2026-10-28',
      dx: { summary: 'Both front lower arm bushes are worn through.', findings: 'Play at the front left and right lower arms. Tyres wearing on the inner edges.', recs: 'Replace both bush kits, then align the wheels.', photos: ['Front left bush, cracked rubber', 'Inner tyre edge wear'] },
      hist: [H('Efua Darko', '', 'Intake', 'Car received at 08:50.', '2026-10-21T08:50'), H('Kwame Boateng', 'Intake', 'Diagnosing', '', '2026-10-21T10:05'), H('Kwame Boateng', 'Diagnosing', 'Quote sent', 'Quote QT-2026-041 sent.', '2026-10-23T16:20')], quote: 'QT-2026-041' },
    { id: 'JOB-2026-087', cid: 'c2', vid: 'v2', title: 'AC regas and service check', status: 'Quality check', priority: 'Normal', tech: 'u3', upd: '2026-10-24T08:30', sv: ['s5'], intake: 'AC blowing warm air since last week.', note: 'Your CR-V is in quality check.', est: '2026-10-24',
      dx: { summary: 'Low refrigerant. No leak found after dye test.', findings: 'Pressure low on both sides. Compressor engages normally.', recs: 'Regas and recheck in 30 days.', photos: ['Gauge reading before regas', 'Dye test under UV'] },
      hist: [H('Efua Darko', '', 'Intake', '', '2026-10-22T09:10'), H('Akosua Mensah', 'Intake', 'Diagnosing', '', '2026-10-22T11:00'), H('Akosua Mensah', 'Diagnosing', 'In progress', 'Customer approved by phone.', '2026-10-23T09:15'), H('Akosua Mensah', 'In progress', 'Quality check', 'Regas done, vents at 4 °C.', '2026-10-24T08:30')], quote: 'QT-2026-040' },
    { id: 'JOB-2026-085', cid: 'c3', vid: 'v3', title: 'Brake pads and fluid change', status: 'Ready for pickup', priority: 'Normal', tech: 'u2', upd: '2026-10-23T14:00', sv: ['s2'], intake: 'Squeal when braking.', note: 'Your C200 is ready for pickup. The invoice is paid.', est: '2026-10-23',
      dx: { summary: 'Front pads at 1 mm.', findings: 'Discs within limits. Fluid dark.', recs: 'Pads and fluid.', photos: ['Worn front pads', 'Brake fluid sample'] },
      hist: [H('Efua Darko', '', 'Intake', '', '2026-10-20T08:40'), H('Kwame Boateng', 'Intake', 'Diagnosing', '', '2026-10-20T09:30'), H('Kwame Boateng', 'Diagnosing', 'In progress', '', '2026-10-21T10:00'), H('Kwame Boateng', 'In progress', 'Quality check', '', '2026-10-22T15:20'), H('Efua Darko', 'Quality check', 'Ready for pickup', 'Road test passed.', '2026-10-23T14:00')], invoice: 'INV-2026-036' },
    { id: 'JOB-2026-089', cid: 'c4', vid: 'v4', title: 'Van pulls to the left', status: 'Diagnosing', priority: 'Urgent', tech: 'u3', upd: '2026-10-24T09:05', sv: ['s3'], intake: 'Driver reports pulling under braking.', note: '', est: '2026-10-27', dx: null,
      hist: [H('Efua Darko', '', 'Intake', '', '2026-10-24T07:55'), H('Akosua Mensah', 'Intake', 'Diagnosing', '', '2026-10-24T09:05')], quote: 'QT-2026-042' },
    { id: 'JOB-2026-090', cid: 'c4', vid: 'v6', title: 'First service', status: 'Intake', priority: 'Low', tech: '', upd: '2026-10-24T09:20', sv: ['s6'], intake: 'Due at 20,000 km.', note: '', est: '2026-10-29', dx: null,
      hist: [H('Efua Darko', '', 'Intake', '', '2026-10-24T09:20')] },
    { id: 'JOB-2026-086', cid: 'c4', vid: 'v5', title: 'Major service', status: 'In progress', priority: 'Normal', tech: 'u2', upd: '2026-10-24T08:10', sv: ['s6'], intake: 'Scheduled major service.', note: 'Work started on the van this morning.', est: '2026-10-25', dx: null,
      hist: [H('Efua Darko', '', 'Intake', '', '2026-10-23T08:00'), H('Kwame Boateng', 'Intake', 'Diagnosing', '', '2026-10-23T08:30'), H('Kwame Boateng', 'Diagnosing', 'In progress', '', '2026-10-24T08:10')] },
    { id: 'JOB-2026-082', cid: 'c2', vid: 'v2', title: 'Wheel alignment', status: 'Quote approved', priority: 'Normal', tech: 'u3', upd: '2026-10-22T17:00', sv: ['s4'], intake: 'Steering off centre.', note: 'Quote approved. Booked in for tomorrow.', est: '2026-10-25', dx: null,
      hist: [H('Efua Darko', '', 'Intake', '', '2026-10-20T12:00'), H('Akosua Mensah', 'Intake', 'Diagnosing', '', '2026-10-21T08:00'), H('Akosua Mensah', 'Diagnosing', 'Quote sent', '', '2026-10-21T14:00'), H('Efua Darko', 'Quote sent', 'Quote approved', 'Approved by the customer online.', '2026-10-22T17:00')] },
    { id: 'JOB-2026-084', cid: 'c2', vid: 'v2', title: 'Rear shock absorbers', status: 'Quote rejected', priority: 'Low', tech: 'u2', upd: '2026-10-19T11:00', sv: [], intake: 'Bouncy rear end.', note: 'You turned down the quote, so no work was done.', est: '', dx: null,
      hist: [H('Efua Darko', '', 'Intake', '', '2026-10-17T09:00'), H('Kwame Boateng', 'Intake', 'Diagnosing', '', '2026-10-17T10:00'), H('Kwame Boateng', 'Diagnosing', 'Quote sent', '', '2026-10-18T15:00'), H('Efua Darko', 'Quote sent', 'Quote rejected', 'Customer found it too high.', '2026-10-19T11:00')], quote: 'QT-2026-039' },
    { id: 'JOB-2026-081', cid: 'c4', vid: 'v5', title: 'Clutch inspection', status: 'Cancelled', priority: 'Normal', tech: '', upd: '2026-10-15T13:00', sv: [], intake: 'Slipping clutch reported.', note: 'This job was cancelled.', est: '', dx: null,
      hist: [H('Efua Darko', '', 'Intake', '', '2026-10-14T09:00'), H('Efua Darko', 'Intake', 'Cancelled', 'Van sold. Job no longer needed.', '2026-10-15T13:00')] },
    { id: 'JOB-2026-079', cid: 'c1', vid: 'v1', title: 'Brake pads', status: 'Completed', priority: 'Normal', tech: 'u2', upd: '2026-09-26T16:00', sv: ['s2'], intake: 'Grinding noise from the front.', note: 'Brake job completed.', est: '2026-09-26', dx: null,
      hist: [H('Efua Darko', '', 'Intake', '', '2026-09-25T08:30'), H('Efua Darko', 'Ready for pickup', 'Completed', '', '2026-09-26T16:00')], invoice: 'INV-2026-033' }
  ];
  var L = function (d, q, u) { return { d: d, q: q, u: P(u) }; };
  NT.quotes = [
    { id: 'QT-2026-041', job: 'JOB-2026-088', status: 'Sent', valid: '2026-10-31', lines: [L('Lower control arm bush kit', 1, 640), L('Suspension labour (hours)', 3, 180), L('Wheel alignment', 1, 180), L('Shop consumables', 1, 40)], tax: P(80), disc: 0, notes: 'Parts carry a 12-month warranty.', reason: '' },
    { id: 'QT-2026-040', job: 'JOB-2026-087', status: 'Approved', valid: '2026-10-30', lines: [L('AC regas', 1, 450)], tax: 0, disc: 0, notes: '', reason: '' },
    { id: 'QT-2026-039', job: 'JOB-2026-084', status: 'Rejected', valid: '2026-10-25', lines: [L('Rear shock absorbers (pair)', 1, 1450), L('Fitting labour (hours)', 2, 180)], tax: P(90), disc: 0, notes: '', reason: 'Too high. I will get a second opinion first.' },
    { id: 'QT-2026-042', job: 'JOB-2026-089', status: 'Draft', valid: '2026-11-03', lines: [L('Brake caliper service', 2, 220), L('Front tyre swap', 1, 120)], tax: P(30), disc: 0, notes: 'Pending diagnostic result.', reason: '' },
    { id: 'QT-2026-036', job: 'JOB-2026-082', status: 'Approved', valid: '2026-10-28', lines: [L('Wheel alignment', 1, 180)], tax: 0, disc: 0, notes: '', reason: '' },
    { id: 'QT-2026-031', job: 'JOB-2026-079', status: 'Expired', valid: '2026-09-20', lines: [L('Brake pads', 1, 680)], tax: 0, disc: 0, notes: '', reason: '' }
  ];
  NT.invoices = [
    { id: 'INV-2026-033', cid: 'c1', job: 'JOB-2026-079', status: 'Overdue', due: '2026-10-10', lines: [L('Brake pads', 1, 680)], tax: 0, disc: 0, paid: 0 },
    { id: 'INV-2026-034', cid: 'c4', job: '', status: 'Sent', due: '2026-11-05', lines: [L('Fleet servicing, October', 1, 4850)], tax: 0, disc: 0, paid: 0 },
    { id: 'INV-2026-035', cid: 'c2', job: '', status: 'Partially paid', due: '2026-11-01', lines: [L('Oil and filter', 1, 350), L('Cabin filter', 1, 900)], tax: 0, disc: 0, paid: P(500) },
    { id: 'INV-2026-036', cid: 'c3', job: 'JOB-2026-085', status: 'Paid', due: '2026-10-30', lines: [L('Brake pads', 1, 680), L('Brake fluid change', 1, 220), L('Labour (hours)', 3, 180)], tax: P(910), disc: 0, paid: P(2350) }
  ];
  NT.payments = [
    { id: 'PAY-2026-029', inv: 'INV-2026-036', cid: 'c3', amt: P(2350), method: 'Mobile money', status: 'Completed', at: '2026-10-23T14:12' },
    { id: 'PAY-2026-028', inv: 'INV-2026-033', cid: 'c1', amt: P(680), method: 'Card', status: 'Failed', at: '2026-10-22T19:40' },
    { id: 'PAY-2026-027', inv: 'INV-2026-035', cid: 'c2', amt: P(500), method: 'Cash', status: 'Completed', at: '2026-10-20T11:05' },
    { id: 'PAY-2026-026', inv: 'INV-2026-030', cid: 'c3', amt: P(120), method: 'Bank transfer', status: 'Refunded', at: '2026-10-12T10:00' }
  ];
  NT.bookings = [
    { id: 'BK-2026-011', cid: 'c2', vid: 'v2', sv: ['s1'], at: '2026-10-27T09:00', status: 'Pending' },
    { id: 'BK-2026-012', cid: '', guest: 'Yaw Boateng', phone: '055 200 1190', note: '2014 Nissan Sentra', sv: ['s3'], at: '2026-10-26T14:00', status: 'Pending' },
    { id: 'BK-2026-013', cid: 'c3', vid: 'v3', sv: ['s5'], at: '2026-10-28T10:30', status: 'Pending' },
    { id: 'BK-2026-014', cid: 'c1', vid: 'v1', sv: ['s6'], at: '2026-10-25T08:00', status: 'Confirmed' },
    { id: 'BK-2026-010', cid: 'c4', vid: 'v4', sv: ['s1'], at: '2026-10-24T13:00', status: 'Confirmed' },
    { id: 'BK-2026-009', cid: 'c2', vid: 'v2', sv: ['s4'], at: '2026-10-20T09:00', status: 'Completed' },
    { id: 'BK-2026-008', cid: 'c3', vid: 'v3', sv: ['s3'], at: '2026-10-18T11:00', status: 'Cancelled', reason: 'Customer travelling.' },
    { id: 'BK-2026-007', cid: 'c1', vid: 'v1', sv: ['s1'], at: '2026-10-14T08:30', status: 'No show' }
  ];
  NT.notifs = [
    { id: 'n1', text: 'Quote QT-2026-041 is waiting for your answer.', sub: 'Front suspension knock', at: '2026-10-23T16:20', read: false, to: 'my-quote', p: 'QT-2026-041' },
    { id: 'n2', text: 'Invoice INV-2026-033 is 14 days overdue.', sub: '680.00 GHS', at: '2026-10-24T07:00', read: false, to: 'my-invoice', p: 'INV-2026-033' },
    { id: 'n3', text: 'Your Corolla is in diagnosing.', sub: 'JOB-2026-088', at: '2026-10-21T10:05', read: true, to: 'my-job', p: 'JOB-2026-088' }
  ];
  NT.posts = [
    { id: 'p1', title: 'Why your brakes squeal after the first rain', cat: 'Brakes', status: 'Published', at: '2026-10-12', body: ['Accra rain does odd things to brakes. A thin film of rust forms on the discs overnight, and the first few stops the next morning scrape it off with a squeal.', 'That noise is normal if it fades after a minute. If it stays, or you feel it in the pedal, the pads are probably worn to the metal.', 'We see the same pattern every rainy season. Cars that sit outside all week squeal more than cars that are driven daily.', 'Book a quick brake check before the heavy rains. It takes twenty minutes and costs far less than new discs.'], feat: true },
    { id: 'p2', title: 'Reading the oil dipstick without guessing', cat: 'Routine', status: 'Published', at: '2026-09-28', body: ['Park on level ground and wait five minutes.'], feat: false },
    { id: 'p3', title: 'Four signs your AC needs attention', cat: 'Climate', status: 'Published', at: '2026-09-05', body: ['Warm air at idle is the first one.'], feat: false },
    { id: 'p4', title: 'Harmattan dust and your air filter', cat: 'Routine', status: 'Draft', at: '2026-10-20', body: ['Draft.'], feat: false }
  ];
  NT.schedules = [
    { id: 'sc1', vid: 'v4', sv: 'Oil and filter', km: 5000, days: 90, last: '2026-07-20', due: 'Due now' },
    { id: 'sc2', vid: 'v5', sv: 'Oil and filter', km: 5000, days: 90, last: '2026-09-12', due: 'In 3 weeks' },
    { id: 'sc3', vid: 'v6', sv: 'First service', km: 20000, days: 0, last: '—', due: 'In 1,100 km' },
    { id: 'sc4', vid: 'v4', sv: 'Wheel alignment', km: 20000, days: 180, last: '2026-05-02', due: 'In 6 weeks' }
  ];
  NT.revenue = { week: [['Mon', 2100], ['Tue', 3350], ['Wed', 1800], ['Thu', 4200], ['Fri', 3900], ['Sat', 2600], ['Sun', 0]], month: [['May', 12400], ['Jun', 14100], ['Jul', 13600], ['Aug', 15200], ['Sep', 16200], ['Oct', 18450]] };
  NT.topServices = [['Major service', 7500], ['Brake pads', 4760], ['AC regas', 2700], ['Oil and filter', 2100], ['Wheel alignment', 1260]];
  NT.techStats = [['Kwame Boateng', 14, 4.8], ['Akosua Mensah', 11, 5.2], ['Joe Quaye', 3, 6.9]];
  NT.makes = ['Toyota', 'Mercedes-Benz', 'BMW', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Ford', 'Volkswagen', 'Other'];
})(window.NT);
