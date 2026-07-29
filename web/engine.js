// A life, ported from the Python in this repository.
// live.py's loops are reproduced faithfully: checking a condition costs a
// minute, which is what makes them terminate.

const MIN_DAY = 1440, DAYS_YEAR = 365;

// the lines of live.py that are instrumented; one of these with no count
// never ran, which is worth seeing
const TRACED = [5, 6, 7, 8, 10, 11, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26,
                29, 30, 31, 32, 33, 35, 38, 39, 41, 42, 43, 44, 46, 47, 48, 49,
                51, 52, 53, 54, 56, 57, 59];

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const CAN_DO = {
  infant: [["sleeping",120],["being carried",40],["crying",20],["staring at the lamp",30],
           ["eating",35],["putting it in your mouth",25],["laughing at nothing",20],
           ["being put down again",30]],
  child: [["running",60],["asking why",30],["drawing a house",45],["breaking something",20],
          ["watching cartoons",90],["riding a bike",75],["collecting stones",50],
          ["lying about homework",15],["playing until it is dark",150],["being bored",80]],
  teenager: [["staying up too late",180],["arguing",40],["listening to the same song",60],
             ["being embarrassed",30],["studying the night before",200],["slamming a door",5],
             ["looking in the mirror",25],["loving someone who does not know",90],
             ["saying nothing at dinner",45]],
  young: [["working",430],["moving out",120],["falling in love",90],["going somewhere cheap",240],
          ["drinking too much",200],["starting something",120],["quitting something",30],
          ["applying",60],["waiting for an answer",45],["calling home, briefly",12]],
  middle: [["working",450],["fixing the same thing again",70],["worrying about money",40],
           ["driving somewhere",65],["answering messages",55],["carrying something heavy",30],
           ["cancelling",10],["being needed",120],["seeing fewer friends",90],["sleeping badly",60]],
  later: [["working, still",430],["looking after someone",130],["going to funerals",180],
          ["fixing the same thing again",70],["walking for the sake of it",55],
          ["reading the news too closely",60],["having the same argument",35],
          ["sleeping badly",60],["putting something aside",20],
          ["standing in the doorway of a room",15]],
  old: [["walking slowly",60],["reading the same page twice",50],["watering the plants",25],
        ["watching the news",90],["waiting for the phone",120],["telling the story again",35],
        ["sitting in the sun",80],["going to the doctor",110]],
  late: [["sitting",130],["being visited",90],["waiting",150],["sleeping in the afternoon",95],
         ["telling the story again",35],["not recognising the street",40],
         ["looking at photographs",45],["going to the doctor",110]],
};

const MUST_DO = {
  infant: ["being fed"],
  child: ["going to school","doing the homework"],
  teenager: ["going to school","handing it in","explaining yourself"],
  young: ["going to work","paying the bill","answering the message","renewing the documents"],
  middle: ["going to work","paying the bill","taking the bins out","answering the message",
           "getting it repaired"],
  later: ["going to work","paying the bill","taking the pills","answering the message",
          "getting it repaired"],
  old: ["taking the pills","going to the check-up","paying the bill"],
  late: ["taking the pills","going to the check-up"],
};

const NEVER_DO = ["checking the phone at three in the morning","saying it out loud","comparing",
  "keeping score","reading the comments","replying immediately","looking back too long",
  "having one more","bringing it up again"];

const SHOULD_DO = ["call your mother","sleep more","get it looked at",
  "learn the other language properly","write it down","forgive him","throw out the boxes",
  "say it while there is time","go outside","read the book you bought","fix the tap",
  "apologise properly","find out what happened to Marko","stand up straight"];

const THOUGHTS = {
  infant: [["the ceiling","home"],["that face again","love"],["hunger","body"],["warm","body"],
           ["the sound of the door","home"],["being put down","home"]],
  child: [["what is under the bed","fear"],["why the sky","time"],["Saturday","time"],
          ["the smell of the hallway","home"],["whether they saw","shame"],
          ["what they said about you","shame"],["being allowed to stay out","time"]],
  teenager: [["what you said in the corridor","shame"],["whether they meant it","love"],
             ["the same song","love"],["getting out of here","time"],["your own face","body"],
             ["nothing, loudly","time"]],
  young: [["the rent","money"],["they said 'sure', not 'yes'","love"],
          ["whether this is the job","work"],["it is August already","time"],
          ["what you said in 2009","shame"],["calling home","home"],
          ["the noise the knee makes","body"]],
  middle: [["the bill due on the eleventh","money"],["that meeting could have been an email","work"],
           ["the noise the knee makes","body"],["everyone in this photograph is older now","death"],
           ["it is August already","time"],["what you said in 2009","shame"],
           ["whether they are all right","love"],["the smell of the hallway","home"]],
  later: [["who is left","death"],["the noise the knee makes","body"],
          ["the bill due on the eleventh","money"],["whether they are all right","love"],
          ["what it used to cost","money"],["it is August already","time"],
          ["what you said in 2009","shame"]],
  old: [["everyone in this photograph is older now","death"],["the smell of the hallway","home"],
        ["whether they will call","love"],["the stairs","body"],["Saturday","time"],
        ["what you said in 2009","shame"]],
  late: [["who is left","death"],["the smell of the hallway","home"],
         ["whether they will call","love"],["the stairs","body"],
         ["being the last one collected","shame"]],
};

const DEEP = [["the stairs in the dark","fear",0],["being the last one collected","shame",0],
  ["water, further out than you thought","fear",0],
  ["a door you cannot find in a house you know","home",16],
  ["your own name, said wrong","shame",16],["the light in a hospital corridor","death",27]];

const SEASON = {
  winter: [["keeping warm",90],["waiting for it to get light",40],["staying in",120]],
  spring: [["opening the windows",25],["being outside again",80]],
  summer: [["sitting in the shade",90],["going to the water",240],["lying awake in the heat",60]],
  autumn: [["going back to it",60],["watching it get dark early",40]],
};
const HOLIDAY = [["being at the sea",320],["doing nothing, on purpose",190],
                 ["reading half a book",110],["eating outside",95]];
const WORK = new Set(["working","working, still","answering messages","how to look busy",
  "looking for work","driving somewhere","going back to it"]);
const SCHOOL = new Set(["going to school","doing the homework","handing it in"]);
const TERM_ONLY = new Set(["lying about homework","studying the night before"]);
// what a regret is actually about, so that the subconscious is not all shame
const REGRET = {"checking the phone at three in the morning":"time","saying it out loud":"shame",
  "comparing":"shame","keeping score":"love","reading the comments":"shame",
  "replying immediately":"work","looking back too long":"time","having one more":"body",
  "bringing it up again":"love"};

const SEASONS = ["winter","winter","spring","spring","spring","summer",
                 "summer","summer","autumn","autumn","autumn","winter"];
const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

const BASE = {"moving out":0.18,"falling in love":0.25,"quitting something":0.3,
  "starting something":0.45,"going somewhere cheap":0.4,"going to funerals":0.35,
  "breaking something":0.6,"slamming a door":0.7,"not recognising the street":0.4,
  "looking for work":0.6,"going to look at it":0.25,"boarding up the windows":0.5,
  "sleeping in the car":0.5,"carrying things upstairs":0.5,"drying it out":0.4,
  "leaving for a while":0.25,"going to the doctor":0.7,"working":2.0,"working, still":2.0,
  "sleeping":1.6,"eating":1.6,"watching the news":1.3,"sitting":1.5,"waiting":1.3,
  "queueing":1.2,"staying indoors":1.4};

const WORLD = [
  {t:"the government falls",kind:"politics",years:1,w:10,rep:1,
   does:[["listening for news",40],["queueing",60]],
   thinks:[["whether it makes any difference","politics"]]},
  {t:"a new government, much like the last",kind:"politics",years:2,w:9,rep:1,
   does:[["listening for news",30]],thinks:[["whether it makes any difference","politics"]]},
  {t:"the currency is reformed",kind:"money",years:2,w:6,
   does:[["counting it again",30],["queueing",90]],thinks:[["what it used to cost","money"]]},
  {t:"prices double, and then double",kind:"money",years:3,w:7,rep:1,
   does:[["going without",45],["counting it again",25]],thinks:[["what it used to cost","money"]]},
  {t:"the factory closes",kind:"money",years:4,w:6,
   does:[["looking for work",180],["waiting for an answer",60]],
   thinks:[["whether this is the job","work"]],costs:"find out what happened to Marko"},
  {t:"the border closes",kind:"politics",years:6,w:4,does:[["staying put",30]],
   thinks:[["getting out of here","time"]]},
  {t:"the border opens",kind:"politics",years:1,w:4,does:[["going to look at it",240]],
   thinks:[["getting out of here","time"]]},
  {t:"war, somewhere else",kind:"war",years:3,w:7,rep:1,
   does:[["watching the news",90],["sending what you can",20]],
   thinks:[["everyone in this photograph is older now","death"]]},
  {t:"war, here",kind:"war",years:4,w:4,risk:0.07,
   does:[["queueing",120],["listening for the all-clear",60],["boarding up the windows",45]],
   thinks:[["the light in a hospital corridor","death"],["whether they are all right","love"]],
   costs:"find out what happened to Marko"},
  {t:"the river takes the lower streets",kind:"nature",years:1,w:5,risk:0.02,
   does:[["carrying things upstairs",90],["drying it out",120]],
   thinks:[["water, further out than you thought","fear"]]},
  {t:"an earthquake, in the night",kind:"nature",years:1,w:4,risk:0.035,
   does:[["sleeping in the car",300],["queueing",60]],
   thinks:[["the stairs in the dark","fear"]],costs:"get it looked at"},
  {t:"the summer that would not end",kind:"nature",years:1,w:6,risk:0.018,rep:1,
   does:[["sitting in the dark with the shutters closed",140]],
   thinks:[["it is August already","time"]]},
  {t:"a winter with no coal",kind:"nature",years:1,w:5,risk:0.025,rep:1,
   does:[["keeping one room warm",150]],thinks:[["the smell of the hallway","home"]]},
  {t:"everyone stays indoors for a year",kind:"plague",years:2,w:4,risk:0.03,
   does:[["staying indoors",300],["waiting for the phone",60]],
   thinks:[["whether they are all right","love"]]},
  {t:"a bridge is built",kind:"progress",years:1,w:5,rep:1,does:[["going the new way",40]]},
  {t:"the mill is turned into flats",kind:"progress",years:1,w:5,
   thinks:[["what it used to be","home"]]},
  {t:"the trams stop running",kind:"progress",years:2,w:4,does:[["walking it instead",70]]},
];

const SMALL_THINGS = ["being laughed at by the whole table","the door closing",
  "not being believed","coming last, in front of everyone","the word he used",
  "a promise about Saturday","the silence after the question","being told you were fine"];

const SUBJECTS = {
  arithmetic:3, geography:3, history:3, biology:3,
  "the other language":2, chemistry:2, physics:2, literature:2,
};
const WORTH_KEEPING = ["long division","the other language, badly","how to look busy",
  "the word for window","how to sit through things"];

function stageAt(age) {
  if (age >= 76) return "late";
  if (age >= 65) return "old";
  if (age >= 50) return "later";
  if (age >= 35) return "middle";
  if (age >= 20) return "young";
  if (age >= 13) return "teenager";
  if (age >= 3) return "child";
  return "infant";
}

function energyAt(age) {
  if (age < 3) return 4;
  if (age < 13) return 6 + ((age / 5) | 0);
  if (age < 20) return 9;
  if (age < 36) return 10;
  if (age < 56) return 9;
  if (age < 66) return 8;
  if (age < 76) return 6;
  if (age < 86) return 4;
  return 3;
}

function frailty(age) {
  if (age < 5) return 1.6;
  if (age < 15) return 0.5;
  if (age < 45) return 0.8;
  if (age < 65) return 1.4;
  if (age < 80) return 2.5;
  return 4.0;
}

// ---------------------------------------------------------------- the life

export class Life {
  constructor(opts) {
    this.opts = opts;
    this.rng = mulberry32(opts.seed >>> 0);
    this.names = []; this.nameIndex = new Map();
    this.thoughtNames = []; this.thoughtIndex = new Map();

    this.minute = 6 * 60 + 14;
    this.alive = true;
    this.grogginess = 0; this.eveningLeft = 60; this.idle = 0;
    this.lying = false; this.tempted = false; this.reminded = false;
    this.sleepAttempts = 0; this.insomniaNoted = false;
    this.dayIndex = 0; this.yearSeen = -1; this.monthSeen = -1;
    this.stage = null; this.choices = []; this.skillsKept = [];
    this.holidayFrom = -1; this.holidayTo = -1;
    this.salience = new Map(); this.scars = []; this.circumstances = [];
    this.pending = []; this.noLonger = new Set(); this.preoccupation = null;
    this.cause = null; this.diedAt = null;

    this.canDo = []; this.mustDo = []; this.shouldDo = []; this.neverDo = [];
    this.conscious = []; this.subconscious = []; this.byTheme = new Map();

    this.mornings = 0; this.alarms = 0; this.gotRoundTo = 0;
    this.insomniaNights = 0; this.worstNight = [0, 0, ""];
    this.totalDone = 0; this.totalThoughts = 0;
    this.neverTotal = 0; this.rememberedTotal = 0;
    this.doneCount = new Map(); this.doneMinutes = new Map();
    this.thoughtCount = new Map(); this.themeCount = new Map();
    this.deepCount = 0; this.deepTexts = new Set();

    // how often each line of live.py ran, and how often it was true
    this.hits = new Array(64).fill(0);
    this.trues = new Array(64).fill(0);
    this.conds = new Set();
    this.tracing = null;

    this.days = [];            // one record per day lived
    this.events = [];          // {age, month, text, kind}
    this.worldEvents = [];
    this.seenEvents = new Set();

    this.inherit();
    this.raiseChildhood();
    this.goToSchool();
    this.timeline = this.unfoldHistory();
    this.schedule = this.buildSchedule();
  }

  hit(line, note) {
    this.hits[line]++;
    if (this.tracing) this.tracing.push([line, note === undefined ? "" : note]);
  }

  hitIf(line, truth, note) {
    this.hits[line]++;
    this.conds.add(line);
    if (truth) this.trues[line]++;
    if (this.tracing) {
      this.tracing.push([line, (truth ? "True" : "False") + (note ? " · " + note : "")]);
    }
  }

  rnd() { return this.rng(); }
  rint(n) { return Math.floor(this.rng() * n); }
  rrange(a, b) { return a + Math.floor(this.rng() * (b - a)); }
  pick(list) { return list[Math.floor(this.rng() * list.length)]; }
  gauss() {
    let u = 0, v = 0;
    while (u === 0) u = this.rng();
    while (v === 0) v = this.rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  nameId(s) {
    let i = this.nameIndex.get(s);
    if (i === undefined) { i = this.names.length; this.names.push(s); this.nameIndex.set(s, i); }
    return i;
  }
  thoughtId(s) {
    let i = this.thoughtIndex.get(s);
    if (i === undefined) {
      i = this.thoughtNames.length; this.thoughtNames.push(s); this.thoughtIndex.set(s, i);
    }
    return i;
  }

  get day() { return Math.floor(this.minute / MIN_DAY); }
  get hour() { return Math.floor((this.minute % MIN_DAY) / 60); }
  get age() { return Math.floor(this.day / DAYS_YEAR); }
  get month() { return Math.min(11, Math.floor((this.day % DAYS_YEAR) * 12 / DAYS_YEAR)); }
  clockTime() {
    const r = this.minute % MIN_DAY;
    return String(Math.floor(r / 60)).padStart(2, "0") + ":" + String(r % 60).padStart(2, "0");
  }
  tick(m) { this.minute += (m === undefined ? 1 : m); }

  // genes: multiple inheritance, resolved in the usual order
  inherit() {
    const MRO = [
      ["You", {}],
      ["Mother", { worry: 1, eyes: "green", everything_else: "hers" }],
      ["Father", { posture: "bad", eyes: "grey" }],
      ["Grandmother", { stubbornness: 1, recipe: "never written down" }],
      ["Grandfather", { silence: "long" }],
      ["Ancestor", { hope: 1, fear_of_the_dark: 1, eyes: "brown" }],
    ];
    const traits = ["hope","fear_of_the_dark","stubbornness","worry","posture","silence",
                    "recipe","eyes","patience","a way with people"];
    this.given = {}; this.fromWhom = {};
    for (const trait of traits) {
      const dominant = this.rint(3) > 0;
      if (!dominant && this.rint(2) !== 0) continue;
      for (let i = 0; i < MRO.length; i++) {
        if (trait in MRO[i][1]) { this.given[trait] = true; break; }
      }
      if (!(trait in this.given)) continue;
      for (let i = MRO.length - 1; i >= 0; i--) {
        if (trait in MRO[i][1]) { this.fromWhom[trait] = MRO[i][0]; break; }
      }
    }
    let span = this.opts.allotted;
    if (!span) {
      span = 68 + this.rrange(-11, 22);
      if (this.given.stubbornness) span += 4;
      if (this.given.worry) span -= 2;
    }
    this.lifespan = span;
  }

  // upbringing: what gets appended, and when it comes back out
  raiseChildhood() {
    this.unresolved = []; this.raised = null;
    for (let age = 0; age < 7; age++) {
      if (this.rint(3) > 0) continue;
      const hurt = this.pick(SMALL_THINGS);
      if (this.rint(3) === 0) this.unresolved.push(hurt);
    }
    let age = 17;
    while (this.unresolved.length > 0) {
      const thing = this.unresolved.pop();
      age += 1;
      if (age > 79) return;
      if (this.rint(10) > 0) this.unresolved.unshift(thing);
      else { this.raised = [age, thing]; return; }
    }
  }

  // education: understanding does not terminate, the bell does
  goToSchool() {
    const subjects = Object.keys(SUBJECTS);
    this.curiousAbout = [this.pick(subjects), this.pick(subjects)];
    this.questions = 0; this.notUnderstood = new Set(); this.skills = [];
    let grades = 0, taken = 0;
    const understand = (subject) => {
      if (!this.curiousAbout.includes(subject)) { this.notUnderstood.add(subject); return; }
      let open = 1, guard = 0;
      while (open > 0 && guard++ < 4000) {
        if (this.rint(45) === 0) break;
        open += this.rrange(2, 4) - 1;
      }
      this.questions += open;
    };
    for (let year = 0; year < 12; year++) {
      for (let k = 0; k < 3; k++) {
        const subject = this.pick(subjects);
        const facts = SUBJECTS[subject];
        let right = 0;
        for (let f = 0; f < facts; f++) if (this.rint(3) === 0) right++;
        grades += Math.round(1 + 4 * right / facts); taken++;
      }
      if (this.rint(3) === 0) understand(this.pick(subjects));
      if (this.rint(4) === 0) understand(this.pick(this.curiousAbout));
    }
    this.average = taken ? grades / taken : 0;
    for (const skill of WORTH_KEEPING) if (this.rint(3) > 0) this.skills.push(skill);
  }

  unfoldHistory() {
    const out = [], spent = new Set();
    const rate = this.opts.turbulence;
    let age = 2;
    while (age < 101) {
      if (this.rnd() < rate) {
        const candidates = WORLD.filter((e) => e.rep || !spent.has(e.t));
        if (!candidates.length) break;
        let total = 0;
        for (const e of candidates) total += e.w;
        let cut = this.rnd() * total, chosen = candidates[candidates.length - 1];
        for (const e of candidates) { cut -= e.w; if (cut <= 0) { chosen = e; break; } }
        out.push([age, chosen]);
        spent.add(chosen.t);
        age += Math.max(1, chosen.years);
      } else age += 1;
    }
    return out;
  }

  buildSchedule() {
    const plan = new Map();
    const add = (age, text, effect) => {
      if (!plan.has(age)) plan.set(age, []);
      plan.get(age).push([text, effect || null]);
    };
    add(1, "says a word, on purpose");
    add(6, "starts school");
    add(18, "leaves school with a certificate stating that you can be taught");
    add(18, "average mark: " + this.average.toFixed(1));
    add(this.rrange(15, 20), "falls in love, silently");
    add(this.rrange(19, 26), "first job");
    add(this.rrange(20, 29), "moves out for good");
    if (this.rint(3) > 0) add(this.rrange(26, 39), "becomes a parent, and promises not to", "parent");
    if (this.rint(2) === 0) add(this.rrange(30, 55), "stops speaking to someone");
    const buriesFather = this.rrange(37, 72);
    add(buriesFather, "your father dies", "father");
    add(Math.min(96, buriesFather + this.rrange(0, 15)), "your mother dies", "mother");
    add(66, "stops going to work");
    if (this.raised) add(this.raised[0],
      "raises it — " + this.raised[1] + " — at someone who was not there");
    return plan;
  }

  // ------------------------------------------------------------ the machinery

  refreshMind() {
    const age = this.age;
    let thoughts = THOUGHTS[stageAt(age)].slice();
    for (const c of this.circumstances) if (c.thinks) thoughts = thoughts.concat(c.thinks);
    if (!this.preoccupation || this.preoccupation[1] <= age) {
      this.preoccupation = [this.pick(thoughts), age + this.rrange(2, 8), age];
    }
    thoughts = thoughts.concat([this.preoccupation[0], this.preoccupation[0], this.preoccupation[0]]);
    this.conscious = thoughts.map((t) => ({ text: t[0], theme: t[1], deep: false }));
    this.subconscious = DEEP.filter((d) => age >= d[2])
      .map((d) => ({ text: d[0], theme: d[1], deep: true })).concat(this.scars);
    this.neverDo = age >= 13
      ? NEVER_DO.map((n) => ({ name: n, kind: 3, minutes: this.rrange(5, 40) })) : [];
    this.byTheme = new Map();
    for (const t of this.conscious.concat(this.subconscious)) {
      if (!this.byTheme.has(t.theme)) this.byTheme.set(t.theme, []);
      this.byTheme.get(t.theme).push(t);
    }
  }

  remember(text, theme) {
    if (this.scars.length >= 8) return;
    if (this.scars.some((s) => s.text === text)) return;
    const t = { text, theme, deep: true };
    this.scars.push(t); this.subconscious.push(t);
    if (!this.byTheme.has(theme)) this.byTheme.set(theme, []);
    this.byTheme.get(theme).push(t);
  }

  restock() {
    let choices = CAN_DO[this.stage].slice();
    for (const s of this.skillsKept) choices.push([s, 45]);
    for (const c of this.circumstances) if (c.does) choices = choices.concat(c.does);
    choices = choices.concat(SEASON[SEASONS[this.month]]);
    const already = new Set(), distinct = [];
    for (const [name, minutes] of choices) {
      if (!already.has(name)) { already.add(name); distinct.push([name, minutes]); }
    }
    this.choices = distinct;
  }

  drift() {
    for (const [name] of this.choices) {
      if (!this.salience.has(name)) this.salience.set(name, BASE[name] || 1.0);
    }
    for (const [name, value] of this.salience) {
      const anchor = Math.log(BASE[name] || 1.0);
      const moved = anchor + 0.96 * (Math.log(value) - anchor) + this.gauss() * 0.14;
      this.salience.set(name, Math.min(4.0, Math.max(0.15, Math.exp(moved))));
    }
  }

  weightedPick(choices, wanted) {
    const scored = [];
    for (let i = 0; i < choices.length; i++) {
      const [name, minutes] = choices[i];
      const w = this.salience.get(name) || 1.0;
      scored.push([Math.pow(this.rnd(), 1.0 / w), name, minutes]);
    }
    scored.sort((a, b) => b[0] - a[0]);
    return scored.slice(0, wanted).map((s) => [s[1], s[2]]);
  }

  note(text, kind) {
    if (this.seenEvents.has(text)) return;
    this.seenEvents.add(text);
    this.events.push({ age: this.age, month: this.month, day: this.day, text, kind });
  }

  takePlace(event) {
    const age = this.age, month = this.rint(12);
    this.circumstances.push({
      text: event.t, until: age + event.years, risk: (event.risk || 0) * this.opts.lethality,
      does: event.does || [], thinks: event.thinks || [],
    });
    this.worldEvents.push({ age, month, text: event.t, kind: event.kind });
    this.events.push({ age, month, day: this.day, text: event.t, kind: "world" });
    if (event.costs) this.owe(event.costs);
  }

  owe(name) {
    if (this.noLonger.has(name)) return;
    if (this.shouldDo.some((d) => d.name === name)) return;
    this.shouldDo.push({ name, kind: 2, minutes: this.rrange(20, 120) });
  }

  takeEffect(key) {
    const age = this.age;
    if (key === "parent") {
      this.circumstances.push({
        text: "a child", until: age + 18, risk: 0,
        does: [["carrying someone who is asleep", 60], ["reading the same book aloud", 30],
               ["worrying about someone else", 45]],
        thinks: [["whether they are all right", "love"]],
      });
    } else if (key === "father") {
      this.remember("the silence at the table", "death");
    } else if (key === "mother") {
      this.remember("the hallway, empty", "death");
      this.noLonger.add("call your mother");
      this.shouldDo = this.shouldDo.filter((d) => d.name !== "call your mother");
      this.motherDied = age;
    }
  }

  die(cause) {
    this.alive = false;
    this.diedAt = [this.age, this.clockTime()];
    this.cause = cause;
    this.pending = [];
    this.events.push({ age: this.age, month: this.month, day: this.day,
                       text: "does not get up", kind: "end" });
    this.canDo = [];
  }

  birthday(age) {
    this.circumstances = this.circumstances.filter((c) => c.until > age);
    for (const [start, event] of this.timeline) if (start === age) this.takePlace(event);
    if (age > this.lifespan) { this.die(null); return; }
    for (const c of this.circumstances) {
      const chance = c.risk * frailty(age);
      if (chance && this.rnd() < chance) { this.die(c.text); return; }
    }
    this.pending = (this.schedule.get(age) || []).map((e) => [this.rint(12), e[0], e[1]]);
    this.schedule.delete(age);
    this.offerSomething(age);
    this.stage = stageAt(age);
    const keeping = (52 - age) / 32.0;
    this.skillsKept = this.skills.filter(() => age >= 20 && age < 52 && this.rnd() < keeping);
    this.monthSeen = -1;
    if (age >= 5 && age < 66) {
      this.holidayFrom = this.rrange(176, 232);
      this.holidayTo = this.holidayFrom + this.rrange(12, 25);
    } else { this.holidayFrom = this.holidayTo = -1; }
    this.refreshMind();
  }

  offerSomething(age) {
    if (age < 5 || this.rint(4) > 0) return;
    if (this.shouldDo.length >= 9) return;
    const onList = this.shouldDo.map((d) => d.name);
    const left = SHOULD_DO.filter((s) => !onList.includes(s) && !this.noLonger.has(s));
    if (left.length) this.owe(this.pick(left));
  }

  firePending() {
    const later = [];
    for (const [month, text, effect] of this.pending) {
      if (month !== this.month) { later.push([month, text, effect]); continue; }
      this.note(text, effect === "father" || effect === "mother" ? "loss" : "milestone");
      if (effect) this.takeEffect(effect);
    }
    this.pending = later;
  }

  newMonth() { this.monthSeen = this.month; this.firePending(); this.restock(); this.drift(); }

  morningOf(full) {
    this.mornings++;
    this.dayIndex = this.day;
    this.sleepAttempts = 0; this.insomniaNoted = false; this.lying = false;
    this.eveningLeft = this.rrange(30, 150);
    const age = this.age;
    if (age !== this.yearSeen) { this.yearSeen = age; this.birthday(age); }
    if (!this.alive) { this.canDo = []; return; }
    if (this.month !== this.monthSeen) this.newMonth();
    const energy = energyAt(age) - (full ? 0 : 1);
    const doy = this.day % DAYS_YEAR;
    const away = doy >= this.holidayFrom && doy < this.holidayTo;
    let pool = this.choices;
    if (away) {
      pool = pool.filter((c) => !WORK.has(c[0]) && !TERM_ONLY.has(c[0])).concat(HOLIDAY);
    } else if (age < 20 && doy >= 172 && doy < 244) {
      pool = pool.filter((c) => !TERM_ONLY.has(c[0]));
    }
    this.canDo = this.weightedPick(pool, Math.max(1, energy)).map(
      ([name, minutes]) => ({ name, kind: 0, minutes }));
    if (!away && this.mustDo.length < 9 && this.rint(2) === 0) {
      let owed = MUST_DO[this.stage];
      if (doy >= 172 && doy < 244) owed = owed.filter((o) => !SCHOOL.has(o));
      if (owed.length) {
        this.mustDo.push({ name: this.pick(owed), kind: 1, minutes: this.rrange(20, 90) });
      }
    }
    this.tempted = this.rint(this.opts.temptation) === 0;
    this.reminded = false;
  }

  doThing(thing) {
    this.tick(thing.minutes);
    this.record.acts.push(thing.kind, this.nameId(thing.name), thing.minutes);
    this.record.busy += thing.minutes;
    this.totalDone++;
    this.doneCount.set(thing.name, (this.doneCount.get(thing.name) || 0) + 1);
    this.doneMinutes.set(thing.name,
      (this.doneMinutes.get(thing.name) || 0) + thing.minutes);
    if (thing.kind === 3) {
      this.record.never++; this.neverTotal++;
      if (this.rint(9) === 0) {
        this.remember(thing.name + ", again", REGRET[thing.name] || "shame");
      }
    } else {
      if (thing.kind === 2) {
        this.reminded = false; this.gotRoundTo++; this.record.should++;
        this.events.push({ age: this.age, month: this.month, day: this.day,
                           text: "gets round to it — " + thing.name, kind: "kept" });
      }
      for (const pool of [this.canDo, this.mustDo, this.shouldDo]) {
        const at = pool.indexOf(thing);
        if (at >= 0) { pool.splice(at, 1); break; }
      }
    }
    this.idle += this.rint(3);
    this.tempted = this.rint(this.opts.temptation) === 0;
    if (!this.reminded && this.rnd() < this.opts.conscience) {
      this.reminded = true; this.record.remembered++; this.rememberedTotal++;
    }
  }

  think(thought) {
    this.tick(this.rrange(1, 4));
    this.idle--;
    this.totalThoughts++;
    this.record.thoughts.push(this.thoughtId(thought.text));
    this.thoughtCount.set(thought.text, (this.thoughtCount.get(thought.text) || 0) + 1);
    this.themeCount.set(thought.theme, (this.themeCount.get(thought.theme) || 0) + 1);
    if (thought.deep) { this.deepCount++; this.deepTexts.add(thought.text); }
  }

  related(thought) { return this.byTheme.get(thought.theme) || this.conscious; }

  thinkAboutStuff() {
    const all = this.subconscious.concat(this.conscious);
    if (!all.length) return;
    let thought = this.pick(all);
    this.hit(29, thought.text);
    let guard = 0;
    for (;;) {
      const idle = this.idle > 0;
      this.hitIf(30, idle, idle ? "" : "something to do");
      if (!idle || guard++ >= 400) break;
      this.hit(31, thought.text);
      this.think(thought);
      const near = this.rint(10) > 0;
      this.hitIf(32, near);
      if (near) { thought = this.pick(this.related(thought)); this.hit(33, thought.text); }
      else { thought = this.pick(all); this.hit(35, thought.text); }
    }
  }

  // live.py, faithfully: a condition costs a minute to check
  stillSleepy() { this.tick(); if (this.grogginess <= 0) return false; this.grogginess--; return true; }
  mustWakeUp() {
    this.tick();
    const age = this.age;
    if (age < 6 || age >= 66 || !this.alive) return false;
    const d = this.day % 7;
    return d !== 5 && d !== 6;
  }
  lyingDown() {
    this.tick();
    if (this.lying) return true;
    this.eveningLeft--;
    if (this.eveningLeft <= 0) { this.lying = true; this.idle += this.rrange(2, 9); return true; }
    return false;
  }
  isMorning() {
    this.tick();
    if (this.hour >= 3 && this.hour < 7) {
      if (!this.insomniaNoted) { this.insomniaNoted = true; this.insomniaNights++; }
      return true;
    }
    return false;
  }

  getUp() { this.grogginess = 0; this.morningOf(true); }
  doWhateverItTakes() {
    this.tick(this.rrange(5, 25)); this.grogginess = 0; this.alarms++;
    this.record.alarm = true; this.morningOf(false);
  }

  fallAsleep() {
    if (!this.alive) { this.night(); return true; }
    this.tick(this.rrange(1, 5));
    this.sleepAttempts++;
    this.idle += this.rint(2);
    const chance = this.opts.sleepBase + 0.012 * this.sleepAttempts;
    if (this.rnd() < chance) { this.night(); return true; }
    return false;
  }

  night() {
    if (this.insomniaNoted && this.sleepAttempts > this.worstNight[0]) {
      this.worstNight = [this.sleepAttempts, this.age, this.clockTime()];
    }
    this.record.attempts = this.sleepAttempts;
    this.record.asleep = this.minute % MIN_DAY;
    this.record.insomnia = this.insomniaNoted;
    const wake = 6 * 60 + this.rint(150);
    const target = (this.dayIndex + 1) * MIN_DAY + wake;
    this.minute = Math.max(target, this.minute + 45);
    this.grogginess = this.rint(45);
    this.lying = false;
  }

  wakeUp() {
    let guard = 0;
    for (;;) {
      const sleepy = this.stillSleepy();
      this.hitIf(5, sleepy, sleepy ? "grogginess " + this.grogginess : "");
      if (!sleepy || guard++ >= 600) break;
      const must = this.mustWakeUp();
      this.hitIf(6, must);
      if (must) {
        this.hit(7); this.doWhateverItTakes();
        this.hit(8, "to an alarm, at " + this.clockTime());
        return;
      }
      this.hit(10);
    }
    this.getUp();
    this.hit(11, this.canDo.length + " things you can do today");
  }

  liveADay() {
    let guard = 0;
    for (;;) {
      const more = this.canDo.length > 0;
      this.hitIf(38, more, more ? this.canDo.length + " left" : "the day is spent");
      if (!more || guard++ >= 200) break;
      this.hit(39); this.thinkAboutStuff();

      const must = this.mustDo.length > 0;
      this.hitIf(41, must, must ? this.mustDo.length : "");
      if (must) {
        const now = this.rint(2) === 0;
        this.hitIf(42, now);
        if (now) {
          const thing = this.pick(this.mustDo);
          this.hit(43, thing.name); this.hit(44, thing.minutes + " min");
          this.doThing(thing);
        }
      }

      const should = this.reminded && this.shouldDo.length > 0;
      this.hitIf(46, should, should ? "in view" : "len() is 0");
      if (should) {
        const now = this.rint(3) === 0;
        this.hitIf(47, now);
        if (now) {
          const thing = this.pick(this.shouldDo);
          this.hit(48, thing.name); this.hit(49, thing.minutes + " min");
          this.doThing(thing);
        }
      }

      const never = this.tempted && this.neverDo.length > 0;
      this.hitIf(51, never, never ? "tempted" : "len() is 0");
      if (never) {
        const now = this.rint(4) === 0;
        this.hitIf(52, now);
        if (now) {
          const thing = this.pick(this.neverDo);
          this.hit(53, thing.name); this.hit(54, thing.minutes + " min");
          this.doThing(thing);
        }
      }

      if (!this.canDo.length) break;
      const thing = this.pick(this.canDo);
      this.hit(56, thing.name); this.hit(57, thing.minutes + " min");
      this.doThing(thing);
      this.hit(59); this.thinkAboutStuff();
    }
  }

  sleepNow() {
    let guard = 0;
    for (;;) {
      const down = this.lyingDown();
      this.hitIf(14, !down, down ? "lying down at " + this.clockTime() : "");
      if (down || guard++ >= 400) break;
      this.hit(15);
    }
    let attempts = 0;
    this.hit(16, "0");
    guard = 0;
    for (;;) {
      const asleep = this.fallAsleep();
      this.hitIf(17, !asleep, asleep ? "asleep at " + this.clockTime() : "not yet");
      if (asleep || guard++ >= 300) break;
      this.hit(18); this.thinkAboutStuff();
      attempts++; this.hit(20, String(attempts));
      this.hitIf(21, attempts === 50);
      if (attempts === 50) { this.hit(22); this.tick(this.rrange(2, 10)); }
      this.hitIf(23, attempts > 50);
      if (attempts > 50) { this.hit(24); this.tick(1); }
      const dawn = this.isMorning();
      this.hitIf(25, dawn, dawn ? "still awake at " + this.clockTime() : "");
      if (dawn) this.hit(26, "True");
    }
  }

  // one full day, recorded
  step() {
    if (!this.alive) return false;
    this.record = { age: 0, month: 0, wake: 0, busy: 0, acts: [], thoughts: [],
                    attempts: 0, asleep: 0, insomnia: false, never: 0, should: 0,
                    remembered: 0, alarm: false };
    const startedAt = this.minute;
    this.wakeUp();
    this.record.age = this.age; this.record.month = this.month;
    this.record.wake = startedAt % MIN_DAY;
    this.record.dayOfLife = this.dayIndex;
    if (this.alive) { this.liveADay(); this.sleepNow(); }
    else { this.record.asleep = this.minute % MIN_DAY; }
    this.days.push(this.record);
    return true;
  }

  traceOneDay(age) {
    const twin = new Life(this.opts);
    let guard = 0;
    while (twin.alive && twin.age < age && guard++ < 200) twin.stepYear();
    twin.tracing = [];
    twin.step();
    return twin.tracing;
  }

  stepYear() {
    const target = this.age + 1;
    let guard = 0;
    while (this.alive && this.age < target && guard++ < 500) this.step();
    if (!this.alive && this.days.length && !this.finished) this.finished = true;
    return this.alive;
  }
}

export { MONTHS, SEASONS, NEVER_DO, SHOULD_DO, stageAt };
