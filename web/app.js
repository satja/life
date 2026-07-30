// One row, at every scale. A life is a tree: years contain months contain
// days contain the things you did contain the thoughts you had on the way,
// and a thought contains the line of live.py that thought it. The program
// is the same tree read the other way: a line contains the definitions of
// the names on it, and those are lines too.
//
// Nothing here knows how deep it is. Every level uses the same rule:
// show the children that carry an event, and count the rest.

const $ = (s, r) => (r || document).querySelector(s);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmt = (n) => n.toLocaleString("en-US");

const state = {
  life: null, years: null,
  lang: (navigator.language || "en").startsWith("hr") ? "hr" : "en",
  seed: Math.floor(Math.random() * 1e6),
  open: new Set(["prog"]),   // which rows are unfolded
  more: new Set(),           // which "… n more" rows have been asked for
  nodes: new Map(),          // what is on screen, so a click can be answered
};
const t = (k) => UI[state.lang][k];

const CAP = 12;              // more children than this and the quiet ones fold away

// ------------------------------------------------------------------ source

const KEYWORDS = "def|while|if|else|elif|return|import|from|pass|True|False|None|" +
  "not|in|and|or|len|random|class|for|try|except|raise|yield|global|__name__|__all__";
const NAMES = Object.keys(SRC.reveals).sort((a, b) => b.length - a.length);

// one pass, because a second pass would find its own markup: `class` is a
// keyword and every span it had just written has one
const TOKEN = new RegExp("('[^']*')|(#.*$)|\\b(" + NAMES.join("|") + ")\\b|\\b(" +
                         KEYWORDS + ")\\b", "g");

function colour(line) {
  return esc(line).replace(TOKEN, (m, st, cm, nm, kw) =>
    '<span class="' + (st ? "st" : cm ? "cm" : nm ? "n" : "kw") + '">' + m + "</span>");
}

function namesIn(line, except) {
  const found = [];
  for (const name of NAMES) {
    if (name === except) continue;
    if (new RegExp("\\b" + name + "\\b").test(line)) found.push(name);
  }
  return found;
}

// which line of live.py reads which dial, and which dial each line reads
const DIAL_ON = { 17: "sleep", 30: "restless", 46: "conscience", 51: "temptation" };
const READS_AT = { sleep: 17, restless: 30, conscience: 46, temptation: 51 };
const SHOW = { sleep: 4, restless: 3, conscience: 6, temptation: 4,
               persistence: 3, frailty: 3 };
const LIVE_LINES = SRC.live.split("\n");

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
  }
  for (const y of years) y.months = y.months.filter(Boolean);
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

// ------------------------------------------------------------------ nodes

function node(id, kind, o) { return Object.assign({ id: id, kind: kind }, o); }

function roots() {
  const life = state.life;
  const out = [node("prog", "file", {
    cls: "head", what: "live.py", leaf: false,
    tail: LIVE_LINES.length + " " + t("lines"),
  })];
  if (!life) return out;
  out.push(node("life", "life", {
    cls: "head", what: t("aLife"), leaf: false,
    tail: life.diedAt[0] + " " + t("years"),
  }));
  out.push(node("acct", "acct", { cls: "head", what: t("account"), leaf: false }));
  return out;
}

function lineNode(no, prefix) {
  const life = state.life, src = LIVE_LINES[no - 1];
  const kids = namesIn(src).length + (DIAL_ON[no] && life ? 1 : 0);
  let tail = "";
  if (life && life.hits[no]) {
    tail = '<span class="n">' + fmt(life.hits[no]) + "×</span>";
    if (life.conds.has(no)) {
      tail += ' <span class="t">' + t("tru") + " " + fmt(life.trues[no]) + "</span>";
    }
  }
  return node(prefix + "/l" + no, "line", {
    cls: "code" + (life && TRACED.includes(no) && !life.hits[no] ? " dead" : ""),
    when: String(no), html: colour(src) || "&nbsp;", tail: tail, no: no,
    leaf: !kids, notable: true,
  });
}

function nameNode(name, prefix) {
  return node(prefix + "/n:" + name, "name",
              { cls: "src", what: name, name: name, tail: t("isA"), leaf: false });
}

// a definition unfolds as rows, because rows are what everything is here
function codeRows(name, prefix) {
  const out = [];
  SRC.reveals[name].forEach((b, bi) => {
    b.code.split("\n").forEach((line, i) => {
      out.push(node(prefix + "/c" + bi + "." + i, "code", {
        cls: "code", html: colour(line) || "&nbsp;",
        tail: i === 0 ? b.file + ":" + b.line : "", src: line, owner: name,
        leaf: !namesIn(line, name).length, notable: true,
      }));
    });
  });
  return out;
}

// a dial does not have a value; it has a value until something happens
function dialSpans(dial) {
  const life = state.life, out = [];
  for (const age of Object.keys(life.dialsAt).map(Number).sort((a, b) => a - b)) {
    const at = life.dialsAt[age], key = JSON.stringify(at.working[dial]);
    const last = out[out.length - 1];
    if (last && last.key === key) { last.to = age; continue; }
    out.push({ from: age, to: age, key: key,
               working: at.working[dial], value: at.dials[dial] });
  }
  return out;
}

function baseOf(dial) {
  return dial === "conscience" ? 1 / 26000 : dial === "temptation" ? 1 / 12 : DIALS[dial];
}

// what leans on a dial came from somewhere, and somewhere is a module
function leansFrom(source) {
  return source.indexOf(" (") > 0 ? "genes"
       : source === "carried from childhood" ? "upbringing" : "history";
}

function childrenOf(n) {
  const life = state.life;
  switch (n.kind) {
    // ---- the program
    case "file":
      return LIVE_LINES.map(function (_, i) { return lineNode(i + 1, "prog"); });
    case "line": {
      const out = namesIn(LIVE_LINES[n.no - 1]).map((name) => nameNode(name, n.id));
      if (DIAL_ON[n.no] && life) {
        out.push(node(n.id + "/dial", "dial", {
          cls: "ev world", what: DIAL_ON[n.no], dial: DIAL_ON[n.no],
          tail: "world.py:wind_up", leaf: false, notable: true,
        }));
      }
      return out;
    }
    case "name": return codeRows(n.name, n.id);
    case "code": return namesIn(n.src, n.owner).map((name) => nameNode(name, n.id));
    case "dial":
      return dialSpans(n.dial).map((s, i) => node(n.id + "/s" + i, "span", {
        when: s.from === s.to ? String(s.from) : s.from + "–" + s.to,
        what: n.dial + " = " + s.value.toFixed(SHOW[n.dial]),
        cls: "ev", span: s, dial: n.dial, leaf: false, notable: true,
      }));
    case "span": {
      const dp = SHOW[n.dial], out = [];
      out.push(node(n.id + "/base", "leafrow", {
        when: baseOf(n.dial).toFixed(dp), what: t("base"), cls: "quiet", leaf: true,
      }));
      n.span.working.forEach(function (w, i) {
        const how = w[1], amount = w[2];
        out.push(node(n.id + "/w" + i, "lean", {
          when: how === "+" ? (amount > 0 ? "+" : "") + amount.toFixed(dp)
                            : "×" + amount.toFixed(2),
          what: w[0], from: leansFrom(w[0]), leaf: false, notable: true,
        }));
      });
      const at = READS_AT[n.dial];
      out.push(node(n.id + "/read", "read", {
        when: n.span.value.toFixed(dp), cls: "ev kept",
        what: t("readBy") + " " + (at ? "live.py:" + at : "world.py"),
        at: at, leaf: false, notable: true,
      }));
      return out;
    }
    case "lean": return [nameNode(n.from, n.id)];
    case "read": return n.at ? [lineNode(n.at, n.id)] : [nameNode("wind_up", n.id)];

    // ---- the life
    case "life":
      return state.years.map(function (y) {
        const ev = y.events.length ? said(y.events)
                                   : { what: mostly(y.mins), cls: "quiet" };
        return node("life/y" + y.age, "year", {
          when: String(y.age), what: ev.what, cls: ev.cls, y: y,
          tail: stageAt(y.age), notable: y.events.length > 0, leaf: false,
        });
      });
    case "year":
      return n.y.months.map(function (mo) {
        const ev = mo.events.length ? said(mo.events)
                                    : { what: mostly(mo.mins), cls: "quiet" };
        return node(n.id + "/m" + mo.m, "month", {
          when: MONTHS[mo.m], what: ev.what, cls: ev.cls, mo: mo,
          tail: hours(mo.mins), notable: mo.events.length > 0, leaf: !mo.days.length,
        });
      });
    case "month":
      return n.mo.days.map(function (rec) {
        const ev = rec.events.length ? said(rec.events)
                                     : { what: dayLabel(rec), cls: "quiet" };
        const dom = (rec.dayOfLife % 365) - Math.floor(rec.month * 365 / 12) + 1;
        return node(n.id + "/d" + rec.dayOfLife, "day", {
          when: dom + " " + MONTHS[rec.month], what: ev.what, cls: ev.cls, rec: rec,
          tail: clock(rec.wake) + "–" + clock(rec.asleep),
          notable: rec.events.length > 0 || rec.insomnia,
          leaf: !rec.acts.length && !rec.insomnia,
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
      if (rec.insomnia) {
        out.push(node(n.id + "/night", "night", {
          when: clock(rec.asleep), cls: "ev loss", rec: rec,
          what: t("stillAwake"), tail: t("attempts").replace("%", fmt(rec.attempts)),
          leaf: false, notable: true,
        }));
      }
      return out;
    }
    case "act": return thoughtNodes(n.rec, n.at, n.upTo, n.id);
    case "night":
      return [16, 17, 18, 20, 21, 22, 23, 24, 25, 26].map((no) => lineNode(no, n.id));
    case "thought": return [lineNode(31, n.id)];

    // ---- what it came to
    case "acct": return account();
    case "trait":
      return Object.keys(FROM_GENES[n.trait] || {}).map(function (dial) {
        const how = FROM_GENES[n.trait][dial][0], amount = FROM_GENES[n.trait][dial][1];
        return node(n.id + "/" + dial, "read", {
          when: how === "+" ? (amount > 0 ? "+" : "") + amount.toFixed(SHOW[dial])
                            : "×" + amount.toFixed(2),
          what: dial + " — " + (READS_AT[dial] ? "live.py:" + READS_AT[dial] : "world.py"),
          at: READS_AT[dial], cls: "ev", leaf: false, notable: true,
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

function dayLabel(rec) {
  const mins = new Map(), names = state.life.names;
  for (let i = 0; i < rec.acts.length; i += 5) {
    const name = names[rec.acts[i + 1]];
    mins.set(name, (mins.get(name) || 0) + rec.acts[i + 2]);
  }
  return mostly(mins);
}

function thoughtNodes(rec, from, to, prefix) {
  const out = [];
  for (let i = from; i < to; i++) {
    out.push(node(prefix + "/t" + i, "thought", {
      cls: "thought", what: state.life.thoughtNames[rec.thoughts[i]],
      leaf: false, notable: true,
    }));
  }
  return out;
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

  out.push(plain(fmt(life.mornings), t("mornings")));
  out.push(plain(fmt(life.totalDone), t("thingsDone")));
  out.push(plain(fmt(life.totalThoughts), t("thoughts") + ", " +
                 fmt(life.thoughtCount.size) + " " + t("different")));
  out.push(plain(fmt(life.neverTotal), t("knewBetter")));
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

// ------------------------------------------------------------------ drawing

// the one rule, applied at every scale: if there are few enough, show them
// all; otherwise show the ones something happened in, and count the rest
function shown(n) {
  const kids = n.kids || childrenOf(n);
  if (kids.length <= CAP || state.more.has(n.id)) return kids;
  const worth = kids.filter((k) => k.notable);
  // if nothing happened in any of them there is nothing to fold away, and a
  // stretch of years in which nothing happened is still the thing you asked for
  if (!worth.length || worth.length === kids.length) return kids;
  return worth.concat([node(n.id + "/+", "more", {
    what: t("more").replace("%", fmt(kids.length - worth.length)), cls: "more",
    leaf: true, of: n.id,
  })]);
}

function row(n, depth, open) {
  const cls = "node " + (n.cls || "") + (open ? " open" : "") + (n.leaf ? " leaf" : "");
  return '<button class="' + cls + '" style="--d:' + depth + '" data-id="' +
    esc(n.id) + '" type="button">' +
    '<span class="mark">' + (n.leaf ? "" : open ? "▾" : "▸") + "</span>" +
    '<span class="when">' + esc(n.when || "") + "</span>" +
    '<span class="what">' + (n.html || esc(n.what || "")) + "</span>" +
    '<span class="tail">' + (n.tail || "") + "</span></button>";
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

function clicked(id) {
  const n = state.nodes.get(id);
  if (!n) return;
  if (n.kind === "more") { state.more.add(n.of); draw(); return; }
  if (n.leaf) return;
  if (state.open.has(id)) state.open.delete(id); else state.open.add(id);
  draw();
}

// ------------------------------------------------------------------ running

function run() {
  state.life = new Life({
    seed: state.seed, turbulence: .075, lethality: 1, temptation: 12,
    conscience: 1 / 26000, sleepBase: .05, allotted: 0,
  });
  let guard = 0;
  while (state.life.alive && guard++ < 130) state.life.stepYear();
  state.years = indexLife(state.life);
  // whatever was open in the program stays open; it is the same program
  state.open = new Set([...state.open].filter((id) => id.startsWith("prog")).concat(["life"]));
  state.more = new Set();
  chrome();
  draw();
  $("#tree").scrollIntoView({ block: "start", behavior: "smooth" });
}

function chrome() {
  document.documentElement.lang = state.lang;
  $("#lang").textContent = t("lang");
  $("#blurb").textContent = t("blurb");
  $("#hint").textContent = t("hint");
  $("#l-seed").textContent = t("seed");
  $("#roll").textContent = t("roll");
  $("#run").textContent = state.life ? t("again") : t("run");
  $("#seedout").textContent = state.life ? t("seed") + " " + state.seed : "";
}

function init() {
  $("#seed").value = state.seed;
  chrome();
  draw();
  $("#tree").addEventListener("click", function (e) {
    const b = e.target.closest ? e.target.closest(".node") : null;
    if (b) clicked(b.dataset.id);
  });
  $("#run").addEventListener("click", run);
  $("#roll").addEventListener("click", function () {
    state.seed = Math.floor(Math.random() * 1e6); $("#seed").value = state.seed;
  });
  $("#seed").addEventListener("input", function () {
    state.seed = Number($("#seed").value) || 0;
  });
  $("#lang").addEventListener("click", function () {
    state.lang = state.lang === "hr" ? "en" : "hr";
    chrome(); draw();
  });
}

init();
