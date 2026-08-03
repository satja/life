// One row, at every scale. A life is a tree: years contain months contain
// days contain the things you did contain the thoughts you had on the way.
// A year also contains the six numbers the loop was reading that year, and
// each of those contains its working — what you were given, what was done to
// you, and what happened to be going on.
//
// Nothing here knows how deep it is. Every level uses the same rule:
// show the children something happened in, and count the rest.

const $ = (s, r) => (r || document).querySelector(s);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmt = (n) => n.toLocaleString("en-US");

// what the knobs are set to, in the units the engine wants
const PRESETS = {
  century: [{ turbulence: 0.030, lethality: 0.4 }, { turbulence: 0.075, lethality: 1.0 },
            { turbulence: 0.130, lethality: 1.8 }, { turbulence: 0.200, lethality: 3.0 }],
  conscience: [1 / 60000, 1 / 26000, 1 / 8000, 1 / 1500],
  temptation: [30, 12, 6, 3],
  sleep: [0.02, 0.05, 0.12],
};

const state = {
  life: null, years: null,
  lang: (navigator.language || "en").startsWith("hr") ? "hr" : "en",
  seed: Math.floor(Math.random() * 1e6),
  set: { century: 1, conscience: 1, temptation: 1, sleep: 1 },
  showSetup: true,           // the conditions are only in the way afterwards
  path: null,                // the way down to one minute, while it opens
  open: new Set(),           // which rows are unfolded
  more: new Set(),           // which "… n more" rows have been asked for
  nodes: new Map(),          // what is on screen, so a click can be answered
};
const t = (k) => UI[state.lang][k];

const CAP = 12;              // more children than this and the quiet ones fold away

// which line of live.py reads which dial. The lines are not shown any more,
// but a number is worth less if you cannot say where it is read.
const READS_AT = { sleep: 17, restless: 30, conscience: 46, temptation: 51 };
const SHOW = { sleep: 4, restless: 3, conscience: 6, temptation: 4,
               persistence: 3, frailty: 3 };

// ------------------------------------------------------------------ the life

const clock = (m) =>
  String(Math.floor((m % 1440) / 60)).padStart(2, "0") + ":" +
  String(m % 60).padStart(2, "0");

const CLS = { world: "ev world", loss: "ev loss", kept: "ev kept",
              milestone: "ev", end: "ev dead" };

// one pass over every day lived, which is the only pass there is: months and
// years are what the days add up to, and are not stored anywhere else
function indexLife(life) {
  const years = [], byDay = new Map();
  for (const rec of life.days) {
    let y = years[rec.age];
    if (!y) y = years[rec.age] = { age: rec.age, months: [], events: [], mins: new Map() };
    let mo = y.months[rec.month];
    if (!mo) mo = y.months[rec.month] = { age: rec.age, m: rec.month, days: [],
                                          events: [], mins: new Map() };
    rec.mo = mo; rec.events = [];
    mo.days.push(rec);
    byDay.set(rec.dayOfLife, rec);
    for (let i = 0; i < rec.acts.length; i += 5) {
      const name = life.names[rec.acts[i + 1]];
      mo.mins.set(name, (mo.mins.get(name) || 0) + rec.acts[i + 2]);
    }
  }
  for (const y of years) {
    for (const mo of y.months) {
      if (!mo) continue;
      for (const [k, v] of mo.mins) y.mins.set(k, (y.mins.get(k) || 0) + v);
    }
    y.months = y.months.filter(Boolean);
  }
  // What a year was is not what there was most of — forty years running that
  // all say "mostly working" say nothing at all. What a year was is what
  // arrived in it, what left it, or what it drifted towards; and a year that
  // was none of those is a year you can only say what you spent it thinking
  // about. A share that moves two or three points is the random walk in
  // salience, not a change in a life, so it is not reported as one.
  // a trade changing renames the work, and a rename is not a thing arriving
  // and another thing leaving — the change of trade is an event already
  const same = (name) => (name.indexOf("working") === 0 ? "working" : name);
  const shares = years.map((y) => {
    let total = 0;
    for (const v of y.mins.values()) total += v;
    const share = new Map();
    for (const [k, v] of y.mins) {
      share.set(same(k), (share.get(same(k)) || 0) + v / (total || 1));
    }
    return share;
  });
  const named = years.map((y) => {
    let best = "", bv = -1;
    for (const [k, v] of y.mins) if (v > bv) { bv = v; best = k; }
    return best;
  });
  years.forEach(function (y, i) {
    if (!i) return;
    const now = shares[i], was = shares[i - 1];
    let took = null, gone = null;
    for (const [k, v] of now) {
      if (v >= 0.02 && !(was.get(k) > 0.002) && (!took || v > now.get(took))) took = k;
    }
    for (const [k, v] of was) {
      if (v >= 0.03 && !(now.get(k) > 0.002) && (!gone || v > was.get(gone))) gone = k;
    }
    const say = (k) => (k === "working" ? named[i] || k : k);
    if (took) { y.change = ["tookUp", say(took)]; return; }
    if (gone) { y.change = ["noMore", say(gone)]; return; }
    // a slow drift only counts once it has been drifting for a while
    const back = shares.slice(Math.max(0, i - 3), i);
    let best = null, by = 0;
    for (const [k, v] of now) {
      let mean = 0;
      for (const s of back) mean += s.get(k) || 0;
      mean /= back.length;
      if (Math.abs(v - mean) > Math.abs(by)) { by = v - mean; best = k; }
    }
    if (best && Math.abs(by) >= 0.05) {
      y.change = [by > 0 ? "moreOf" : "less", say(best)]; return;
    }
    const on = life.mindAt[y.age];
    if (on && on !== life.mindAt[y.age - 1]) y.change = ["thinkingOf", on];
  });
  // and a year that would say exactly what last year said says the other
  // thing it can say instead, which is what it was spent thinking about
  let said = null;
  for (const y of years) {
    if (y.events.length) { said = null; continue; }
    const text = y.change ? t(y.change[0]) + " " + y.change[1] : mostly(y.mins);
    if (text === said && life.mindAt[y.age]) y.change = ["thinkingOf", life.mindAt[y.age]];
    said = y.change ? t(y.change[0]) + " " + y.change[1] : mostly(y.mins);
  }

  const lastDay = life.days.length ? life.days[life.days.length - 1].dayOfLife : 0;
  for (const e of life.events) {
    const rec = byDay.get(Math.min(e.day, lastDay));
    if (!rec) continue;
    rec.events.push(e); rec.mo.events.push(e); years[rec.age].events.push(e);
  }
  return years;
}

function mostly(mins) {
  let best = "", bv = -1;
  for (const [k, v] of mins) if (v > bv) { bv = v; best = k; }
  return best ? t("mostly") + " " + best : "";
}

function said(events) {
  return { what: events.map((e) => e.text).join(" · "),
           cls: CLS[events[0].kind] || "ev" };
}

function hours(mins) {
  let total = 0;
  for (const v of mins.values()) total += v;
  return fmt(Math.round(total / 60)) + " h";
}

function dayLabel(rec) {
  const mins = new Map(), names = state.life.names;
  for (let i = 0; i < rec.acts.length; i += 5) {
    const name = names[rec.acts[i + 1]];
    mins.set(name, (mins.get(name) || 0) + rec.acts[i + 2]);
  }
  return mostly(mins);
}

// ------------------------------------------------------------------ nodes

function node(id, kind, o) { return Object.assign({ id: id, kind: kind }, o); }

function roots() {
  const life = state.life;
  if (!life) return [];
  return [
    node("life", "life", { cls: "head", what: t("aLife"), leaf: false,
                           tail: life.diedAt[0] + " " + t("years") }),
    node("acct", "acct", { cls: "head", what: t("account"), leaf: false }),
  ];
}

// where a dial starts before anything has leaned on it, which is what the
// knobs above set
function baseOf(dial) {
  const o = state.life.opts;
  return dial === "conscience" ? o.conscience
       : dial === "temptation" ? 1 / o.temptation
       : dial === "sleep" ? o.sleepBase : DIALS[dial];
}

// the dials as they stood in a given year, which is where they are turned
function dialsAt(age) {
  const life = state.life;
  let at = age;
  while (at >= 0 && !life.dialsAt[at]) at--;
  return at < 0 ? null : life.dialsAt[at];
}

function thoughtNodes(rec, from, to, prefix) {
  const out = [];
  for (let i = from; i < to; i++) {
    out.push(node(prefix + "/t" + i, "thought", {
      cls: "thought", what: state.life.thoughtNames[rec.thoughts[i]],
      leaf: true, notable: true,
    }));
  }
  return out;
}

function childrenOf(n) {
  const life = state.life;
  switch (n.kind) {
    case "life":
      return state.years.map(function (y) {
        const ev = y.events.length ? said(y.events)
          : y.change ? { what: t(y.change[0]) + " " + y.change[1], cls: "quiet" }
          : { what: mostly(y.mins), cls: "quiet" };
        return node("life/y" + y.age, "year", {
          when: String(y.age), what: ev.what, cls: ev.cls, y: y,
          tail: stageAt(y.age), notable: y.events.length > 0, leaf: false,
        });
      });

    case "year": {
      const out = n.y.months.map(function (mo) {
        const ev = mo.events.length ? said(mo.events)
                                    : { what: mostly(mo.mins), cls: "quiet" };
        return node(n.id + "/m" + mo.m, "month", {
          when: MONTHS[mo.m], what: ev.what, cls: ev.cls, mo: mo,
          tail: hours(mo.mins), notable: mo.events.length > 0, leaf: !mo.days.length,
        });
      });
      // twelve months and the six numbers the loop read while they passed
      out.push(node(n.id + "/dials", "dials", {
        what: t("theDials"), cls: "ev world", tail: "world.py:wind_up",
        age: n.y.age, leaf: false, notable: true,
      }));
      return out;
    }

    case "month":
      return n.mo.days.map(function (rec) {
        const ev = rec.events.length ? said(rec.events)
                                     : { what: dayLabel(rec), cls: "quiet" };
        const dom = (rec.dayOfLife % 365) - Math.floor(rec.month * 365 / 12) + 1;
        return node(n.id + "/d" + rec.dayOfLife, "day", {
          when: dom + " " + MONTHS[rec.month], what: ev.what, cls: ev.cls, rec: rec,
          tail: clock(rec.wake) + "–" + clock(rec.asleep),
          notable: rec.events.length > 0 || rec.insomnia,
          leaf: !rec.acts.length && !rec.thoughts.length,
        });
      });

    case "day": {
      const rec = n.rec, out = [];
      let seen = 0;
      for (let i = 0; i < rec.acts.length; i += 5) {
        const kind = rec.acts[i], upTo = rec.acts[i + 4];
        out.push(node(n.id + "/a" + i, "act", {
          when: clock(rec.acts[i + 3]), what: life.names[rec.acts[i + 1]],
          tail: rec.acts[i + 2] + " min",
          cls: kind === 3 ? "ev loss" : kind === 2 ? "ev kept" : kind === 1 ? "quiet" : "",
          rec: rec, at: seen, upTo: upTo, leaf: upTo <= seen, notable: kind !== 0,
        }));
        seen = upTo;
      }
      // whatever was still being thought after the last thing done belongs to
      // the night, which is where the loop spends what it cannot spend awake
      if (rec.thoughts.length > seen) {
        out.push(node(n.id + "/night", "night", {
          when: clock(rec.asleep), rec: rec, at: seen,
          cls: rec.insomnia ? "ev loss" : "quiet",
          what: rec.insomnia ? t("stillAwake") : t("asleep"),
          tail: rec.attempts ? t("attempts").replace("%", fmt(rec.attempts)) : "",
          leaf: false, notable: rec.insomnia,
        }));
      }
      return out;
    }

    case "act": return thoughtNodes(n.rec, n.at, n.upTo, n.id);
    case "night": return thoughtNodes(n.rec, n.at, n.rec.thoughts.length, n.id);

    case "dials": {
      const at = dialsAt(n.age);
      if (!at) return [];
      return Object.keys(at.dials).map((dial) => node(n.id + "/" + dial, "dial", {
        what: dial + " = " + at.dials[dial].toFixed(SHOW[dial]),
        tail: t("readBy") + " " + (READS_AT[dial] ? "live.py:" + READS_AT[dial]
                                                  : "world.py"),
        working: at.working[dial] || [], value: at.dials[dial], dial: dial,
        cls: "ev", leaf: false, notable: true,
      }));
    }
    case "dial": {
      const dp = SHOW[n.dial];
      let sum = baseOf(n.dial);
      const out = [node(n.id + "/base", "leafrow", {
        when: sum.toFixed(dp), what: t("base"), cls: "quiet", leaf: true,
      })];
      n.working.forEach(function (w, i) {
        const how = w[1], amount = w[2];
        sum = how === "+" ? sum + amount : sum * amount;
        out.push(node(n.id + "/w" + i, "leafrow", {
          when: how === "+" ? (amount > 0 ? "+" : "") + amount.toFixed(dp)
                            : "×" + amount.toFixed(2),
          what: w[0], cls: "", leaf: true,
        }));
      });
      // the working does not always get the last word; two of the dials are
      // held at a limit, and it is worth saying so where it happens
      if (Math.abs(sum - n.value) > Math.pow(10, -dp) / 2) {
        out.push(node(n.id + "/held", "leafrow", {
          when: n.value.toFixed(dp), what: t("asFar"), cls: "ev world", leaf: true,
        }));
      }
      return out;
    }

    // ---- what it came to
    case "acct": return account();
    case "trait":
      return Object.keys(FROM_GENES[n.trait] || {}).map(function (dial) {
        const how = FROM_GENES[n.trait][dial][0], amount = FROM_GENES[n.trait][dial][1];
        return node(n.id + "/" + dial, "leafrow", {
          when: how === "+" ? (amount > 0 ? "+" : "") + amount.toFixed(SHOW[dial])
                            : "×" + amount.toFixed(2),
          what: dial, cls: "ev",
          tail: t("readBy") + " " + (READS_AT[dial] ? "live.py:" + READS_AT[dial]
                                                    : "world.py"),
          leaf: true, notable: true,
        });
      });
    case "list":
      return n.items.map((s, i) => node(n.id + "/i" + i, "leafrow",
                                        { what: s, cls: "quiet", leaf: true }));
    case "goto": {
      const y = state.years[n.age];
      if (!y) return [];
      return [node(n.id + "/y", "year", {
        when: String(y.age), what: mostly(y.mins), cls: "quiet", y: y,
        tail: stageAt(y.age), leaf: false,
      })];
    }
    default: return [];
  }
}

// ------------------------------------------------------------------ account

function account() {
  const life = state.life, out = [];
  const plain = (when, what, cls) =>
    node("acct/r" + out.length, "leafrow",
         { when: when, what: what, cls: cls || "quiet", leaf: true });

  out.push(node("acct/genes", "held", {
    what: "You(" + (life.takeAfter === "Mother" ? "Mother, Father" : "Father, Mother") + ")",
    cls: "ev", tail: t("inOrder"), leaf: false,
    kids: Object.keys(life.fromWhom).map((trait) => node("acct/genes/" + trait, "trait", {
      what: trait, trait: trait, cls: FROM_GENES[trait] ? "ev kept" : "quiet",
      tail: life.inheritedFrom[trait] +
            (life.inheritedFrom[trait] === life.fromWhom[trait]
              ? "" : " ← " + life.fromWhom[trait]),
      leaf: !FROM_GENES[trait], notable: true,
    })),
  }));

  const last = life.days[life.days.length - 1];
  out.push(node("acct/died", "held", {
    when: String(life.diedAt[0]),
    what: t("died") + " " + life.diedAt[1] +
          (life.cause ? ", " + t("inTheYearOf") + " " + life.cause : ""),
    cls: "ev dead", leaf: !last,
    kids: last ? [node("acct/died/d", "day", {
      when: clock(last.wake) + "–" + clock(last.asleep), what: dayLabel(last),
      cls: "quiet", rec: last, leaf: !last.acts.length,
    })] : [],
  }));

  out.push(node("acct/carried", "held", {
    when: pc(life.health), what: t("carried"), cls: "ev world", leaf: false,
    tail: life.job ? t("worked") + " " + life.job : t("noJob"),
    kids: [
      node("acct/carried/h", "leafrow",
           { when: pc(life.health), what: t("healthLeft"), cls: "quiet", leaf: true }),
      node("acct/carried/m", "leafrow",
           { when: pc(life.money), what: t("moneyLeft"), cls: "quiet", leaf: true }),
    ],
  }));

  out.push(plain(fmt(life.mornings), t("mornings")));
  out.push(plain(fmt(life.thoughtCount.size), t("different")));
  out.push(node("acct/mind", "held", {
    when: pc(life.wandering / life.waking), what: t("elsewhere"),
    cls: "ev", tail: t("measuredAt"), leaf: false,
    kids: mindRows(),
  }));
  out.push(node("acct/cast", "held", {
    when: String(life.people.length + life.things.length + life.places.length),
    what: t("whoAbout"), cls: "ev world", leaf: false, kids: castRows(),
  }));

  let worst = "", wn = 0;
  for (const [k, v] of life.doneCount) {
    if (v > wn && REGRET[k]) { wn = v; worst = k; }
  }
  out.push(plain(fmt(life.neverTotal), t("knewBetter") +
                 (worst ? " — " + t("mostlyThat") + " " + worst : "")));
  out.push(plain(fmt(life.gotRoundTo), t("gotRoundTo"), "ev kept"));
  out.push(plain(fmt(life.insomniaNights), t("nightsAwake")));
  out.push(plain(fmt(life.questions), t("questions")));

  const left = life.shouldDo.map((d) => d.name);
  out.push(node("acct/left", "list", {
    when: String(left.length), what: left.length ? t("meaningTo") : t("nothingLeft"),
    cls: left.length ? "ev loss" : "ev kept", items: left, leaf: !left.length,
  }));

  if (life.motherDied !== undefined) {
    out.push(plain(String(life.motherDied), t("leftTheList"), "quiet"));
  }
  if (life.worldEvents.length) {
    out.push(node("acct/world", "held", {
      when: String(life.worldEvents.length), what: t("outside"), cls: "ev world",
      leaf: false,
      kids: life.worldEvents.map((e, i) => node("acct/world/" + i, "goto", {
        when: e.age + " " + MONTHS[e.month], what: e.text, cls: "ev world",
        age: e.age, leaf: false, notable: true,
      })),
    }));
  }
  return out;
}

const pc = (x) => (100 * x).toFixed(0) + "%";

// where the thinking pointed and how it felt, which are the two things
// about it anybody has actually measured
function mindRows() {
  const life = state.life, out = [];
  let total = 0;
  for (const v of life.points.values()) total += v;
  const say = (key, count, label, cls) => out.push(node("acct/mind/" + key, "leafrow",
    { when: pc(count / total), what: label, cls: cls, leaf: true }));
  say("ahead", life.points.get("ahead") || 0, t("ptAhead"), "ev kept");
  say("behind", life.points.get("behind") || 0, t("ptBehind"), "ev loss");
  say("good", life.tone.get(1) || 0, t("tonePlus"), "ev kept");
  say("bad", life.tone.get(-1) || 0, t("toneMinus"), "ev loss");
  return out;
}

// the particulars this life had to think about, which is where the words
// in every thought came from
function castRows() {
  const life = state.life, out = [];
  const row = (w, tail, cls) => out.push(node("acct/cast/" + out.length, "leafrow",
    { what: w.word, when: w.since ? String(w.since) : "", tail: tail, cls: cls,
      leaf: true }));
  for (const p of life.people) {
    row(p, p.gone !== null ? t("goneAt") + " " + p.gone
           : p.estranged ? t("notSpeaking") : "", "ev");
  }
  for (const w of life.things) row(w, "", "quiet");
  for (const w of life.places) row(w, "", "quiet");
  for (const w of life.aches) row(w, t("achesFrom"), "ev loss");
  for (const w of life.years) row(w, "", "quiet");
  return out;
}

// ------------------------------------------------------------------ drawing

// the one rule, applied at every scale: if there are few enough, show them
// all; otherwise show the ones something happened in, and count the rest
function shown(n) {
  const kids = n.kids || childrenOf(n);
  // every year is there and every year opens, including the ones with
  // nothing in them; a year nothing happened in was still lived through
  if (n.kind === "life" || n.kind === "year") return kids;
  if (kids.length <= CAP || state.more.has(n.id)) return kids;
  const worth = kids.filter((k) => k.notable);
  // if nothing happened in any of them there is nothing to fold away, and a
  // stretch in which nothing happened is still the thing you asked for
  if (!worth.length || worth.length === kids.length) return kids;
  return worth.concat([node(n.id + "/+", "more", {
    what: t("more").replace("%", fmt(kids.length - worth.length)), cls: "more",
    leaf: true, of: n.id,
  })]);
}

function row(n, depth, open) {
  const cls = "node d" + depth + " " + (n.cls || "") +
              (open ? " open" : "") + (n.leaf ? " leaf" : "") +
              (state.path && state.path.indexOf(n.id) >= 0 ? " here" : "");
  return '<button class="' + cls + '" style="--d:' + depth + '" data-id="' +
    esc(n.id) + '" type="button">' +
    '<span class="mark">' + (n.leaf ? "" : open ? "▾" : "▸") + "</span>" +
    '<span class="when">' + esc(n.when || "") + "</span>" +
    '<span class="what">' + esc(n.what || "") + "</span>" +
    '<span class="tail">' + esc(n.tail || "") + "</span></button>";
}

function emit(out, nodes, depth) {
  for (const n of nodes) {
    state.nodes.set(n.id, n);
    const open = !n.leaf && state.open.has(n.id);
    out.push(row(n, depth, open));
    if (open) emit(out, shown(n), depth + 1);
  }
}

function draw() {
  const out = [];
  state.nodes = new Map();
  emit(out, roots(), 0);
  $("#tree").innerHTML = out.join("");
}

function drawAll() { draw(); drawBar(); }

function clicked(id) {
  const n = state.nodes.get(id);
  if (!n) return;
  if (n.kind === "more") { state.more.add(n.of); drawAll(); return; }
  if (n.leaf) return;
  if (state.open.has(id)) state.open.delete(id); else state.open.add(id);
  state.path = null;
  drawAll();
}

// ------------------------------------------------------------------ the life bar

// The page's premise is that everything is a row and any row can be opened.
// This row is the life: one tick a year, and what it was is its colour.
function drawBar() {
  const bar = $("#bar");
  if (!state.years) { bar.hidden = true; return; }
  bar.hidden = false;
  bar.innerHTML = state.years.map(function (y) {
    const kind = y.events.length ? (CLS[y.events[0].kind] || "ev") : "";
    const cls = kind.replace("ev ", "") || (y.events.length ? "ev" : "");
    const said = y.events.length ? y.events.map((e) => e.text).join(" · ")
                                 : mostly(y.mins);
    return '<button type="button" data-age="' + y.age + '" class="' +
      (kind ? cls + (kind.indexOf("ev") === 0 ? " ev" : "") : "") +
      '" title="' + esc(y.age + " — " + said) + '"></button>';
  }).join("");
  for (const b of bar.querySelectorAll("button")) {
    if (state.open.has("life/y" + b.dataset.age)) b.classList.add("open");
  }
}

// ------------------------------------------------------------------ a moment

// A life here is about twenty-six million minutes that were actually lived.
// This opens the way down to one of them, a level at a time, because the
// point of the thing is that any one of them is reachable.
function aMoment() {
  const life = state.life;
  if (!life || !life.days.length) return;
  let rec = null, tries = 0;
  while (tries++ < 60) {
    const pick = life.days[Math.floor(Math.random() * life.days.length)];
    if (pick.acts.length) { rec = pick; break; }
  }
  if (!rec) return;
  const acts = rec.acts.length / 5;
  const which = Math.floor(Math.random() * acts) * 5;
  const y = state.years[rec.age];
  if (!y) return;
  const path = ["life", "life/y" + rec.age, "life/y" + rec.age + "/m" + rec.month,
                "life/y" + rec.age + "/m" + rec.month + "/d" + rec.dayOfLife];
  path.push(path[3] + "/a" + which);
  const from = which ? rec.acts[which - 1] : 0, to = rec.acts[which + 4];
  if (to > from) {
    path.push(path[4] + "/t" + (from + Math.floor(Math.random() * (to - from))));
  }
  // the day may be one of the ones a month is not showing
  state.more.add(path[2]);
  state.open = new Set();
  state.path = path;
  let step = 0;
  (function down() {
    if (step >= path.length) { state.path = path; draw(); drawBar(); return; }
    state.open.add(path[step]);
    step++;
    draw(); drawBar();
    const last = $('.node[data-id="' + path[step - 1] + '"]');
    if (last) last.scrollIntoView({ block: "center", behavior: "smooth" });
    setTimeout(down, 240);
  })();
}

// ------------------------------------------------------------------ the knobs

function segment(key, count) {
  const box = document.createElement("div");
  box.className = "seg";
  box.setAttribute("role", "group");
  for (let i = 0; i < count; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = t(key + "Set")[i];
    b.setAttribute("aria-pressed", String(i === state.set[key]));
    b.addEventListener("click", function () {
      state.set[key] = i;
      for (const other of box.children) {
        other.setAttribute("aria-pressed", String(other === b));
      }
    });
    box.appendChild(b);
  }
  return box;
}

function buildKnobs() {
  const knobs = $("#knobs");
  knobs.innerHTML = "";
  const make = (title, why, body) => {
    const k = document.createElement("div");
    k.className = "knob";
    const h = document.createElement("h3"); h.textContent = title;
    const p = document.createElement("p"); p.className = "why"; p.textContent = why;
    k.append(h, p, body);
    knobs.appendChild(k);
  };
  for (const [key, count] of [["century", 4], ["conscience", 4],
                              ["temptation", 4], ["sleep", 3]]) {
    make(t(key), t(key + "Why"), segment(key, count));
  }

  const seedbox = document.createElement("div");
  seedbox.className = "seg";
  const input = document.createElement("input");
  input.type = "number"; input.inputMode = "numeric"; input.value = state.seed;
  input.setAttribute("aria-label", t("seed"));
  input.addEventListener("input", function () {
    state.seed = Number(input.value) || 0;
  });
  const roll = document.createElement("button");
  roll.type = "button"; roll.className = "ghost"; roll.textContent = t("roll");
  roll.addEventListener("click", function () {
    state.seed = Math.floor(Math.random() * 1e6); input.value = state.seed;
  });
  seedbox.append(input, roll);
  make(t("seed"), t("seedWhy"), seedbox);
}

// ------------------------------------------------------------------ running

// a life is a second or so of work now; say so, and let the browser paint
// before it starts, or the click looks like it did nothing
// "run another" does not run another; it puts the conditions back, because
// changing them is the only reason to want them
function run() {
  if (state.life && !state.showSetup) {
    state.showSetup = true;
    chrome();
    $("#knobs").scrollIntoView({ block: "nearest", behavior: "smooth" });
    return;
  }
  $("#run").textContent = t("running");
  $("#run").disabled = true;
  setTimeout(live, 20);
}

function live() {
  const century = PRESETS.century[state.set.century];
  state.life = new Life({
    seed: state.seed,
    turbulence: century.turbulence, lethality: century.lethality,
    conscience: PRESETS.conscience[state.set.conscience],
    temptation: PRESETS.temptation[state.set.temptation],
    sleepBase: PRESETS.sleep[state.set.sleep],
    allotted: 0,
  });
  let guard = 0;
  while (state.life.alive && guard++ < 130) state.life.stepYear();
  state.years = indexLife(state.life);
  state.open = new Set(["life", "acct"]);
  state.more = new Set();
  state.path = null;
  state.showSetup = false;
  $("#run").disabled = false;
  chrome();
  drawAll();
}

function chrome() {
  document.documentElement.lang = state.lang;
  $("#lang").textContent = t("lang");
  $("#blurb").textContent = t("blurb");
  $("#hint").textContent = t("hint");
  $("#knobs").hidden = !state.showSetup;
  $("#moment").hidden = !state.life;
  $("#moment").textContent = t("moment");
  $("#run").textContent = !state.life ? t("run")
                        : state.showSetup ? t("run") : t("again");
  $("#seedout").textContent = state.life ? t("seed") + " " + state.seed : "";
}

function init() {
  chrome();
  buildKnobs();
  draw();
  $("#tree").addEventListener("click", function (e) {
    const b = e.target.closest ? e.target.closest(".node") : null;
    if (b) clicked(b.dataset.id);
  });
  $("#run").addEventListener("click", run);
  $("#moment").addEventListener("click", aMoment);
  $("#bar").addEventListener("click", function (e) {
    const b = e.target.closest ? e.target.closest("button") : null;
    if (!b) return;
    const id = "life/y" + b.dataset.age;
    state.path = null;
    state.open.add("life");
    if (state.open.has(id)) state.open.delete(id); else state.open.add(id);
    drawAll();
    const row = $('.node[data-id="' + id + '"]');
    if (row) row.scrollIntoView({ block: "center", behavior: "smooth" });
  });
  $("#lang").addEventListener("click", function () {
    state.lang = state.lang === "hr" ? "en" : "hr";
    chrome(); buildKnobs(); drawAll();
  });
}

init();
