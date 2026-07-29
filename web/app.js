const $ = (s, r) => (r || document).querySelector(s);

const PRESETS = {
  century: {
    en: ["quiet", "ordinary", "turbulent", "catastrophic"],
    hr: ["mirno", "obično", "burno", "katastrofalno"],
    val: [{ turbulence: .030, lethality: .4 }, { turbulence: .075, lethality: 1 },
          { turbulence: .130, lethality: 1.8 }, { turbulence: .200, lethality: 3 }],
  },
  conscience: {
    en: ["rarely", "sometimes", "often", "constantly"],
    hr: ["rijetko", "ponekad", "često", "stalno"],
    val: [1 / 60000, 1 / 26000, 1 / 8000, 1 / 1500],
  },
};

const state = {
  life: null, lang: (navigator.language || "en").startsWith("hr") ? "hr" : "en",
  century: 1, conscience: 1, seed: Math.floor(Math.random() * 1e6), year: null,
};

const t = (k) => UI[state.lang][k];
const w = (s) => say(s, state.lang);
const num = (n) => n.toLocaleString(state.lang === "hr" ? "hr-HR" : "en-US");
const months = () => (state.lang === "hr" ? MONTHS_HR : MONTHS);

function spanOf(minutes) {
  const hours = minutes / 60;
  if (hours >= 8760) {
    const y = hours / 8760;
    const s = y.toFixed(1);
    return (state.lang === "hr" ? s.replace(".", ",") + " god." : s + " years");
  }
  if (hours >= 48) {
    return Math.round(hours / 24) + (state.lang === "hr" ? " dana" : " days");
  }
  return Math.round(hours) + (state.lang === "hr" ? " h" : " h");
}

// ------------------------------------------------------------------ setup

function buildSetup() {
  const knobs = $("#knobs");
  knobs.innerHTML = "";
  const make = (title, why, node) => {
    const k = document.createElement("div");
    k.className = "knob panel";
    k.innerHTML = "<h3>" + title + '</h3><p class="why">' + why + "</p>";
    k.appendChild(node);
    knobs.appendChild(k);
  };
  const seg = (key, chosen, onPick) => {
    const box = document.createElement("div");
    box.className = "seg"; box.setAttribute("role", "group");
    PRESETS[key][state.lang].forEach((label, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = label;
      b.setAttribute("aria-pressed", String(i === chosen()));
      b.addEventListener("click", () => {
        onPick(i);
        for (const other of box.children) {
          other.setAttribute("aria-pressed", String(other === b));
        }
      });
      box.appendChild(b);
    });
    return box;
  };

  make(t("century"), t("centuryWhy"),
       seg("century", () => state.century, (i) => (state.century = i)));
  make(t("conscience"), t("conscienceWhy"),
       seg("conscience", () => state.conscience, (i) => (state.conscience = i)));

  const wrap = document.createElement("div");
  wrap.className = "begin"; wrap.style.marginTop = "0";
  const input = document.createElement("input");
  input.className = "seed"; input.type = "number"; input.value = state.seed;
  input.setAttribute("aria-label", t("seed"));
  input.addEventListener("input", () => (state.seed = Number(input.value) || 0));
  const roll = document.createElement("button");
  roll.className = "ghost"; roll.type = "button"; roll.textContent = t("roll");
  roll.addEventListener("click", () => {
    state.seed = Math.floor(Math.random() * 1e6); input.value = state.seed;
  });
  wrap.append(input, roll);
  make(t("seed"), t("seedWhy"), wrap);
}

function chrome() {
  $("#title").textContent = t("title");
  $("#sub").textContent = t("sub");
  $("#intro").innerHTML = t("intro");
  $("#start").textContent = t("begin");
  $("#again").textContent = t("again");
  $("#lang").textContent = t("lang");
  $("#h-given").textContent = t("given");
  $("#h-life").textContent = t("theLife");
  $("#h-account").textContent = t("account");
  $("#replay").textContent = t("replay");
  $("#gridnote").textContent = t("gridNote");
  document.documentElement.lang = state.lang;
}

// ------------------------------------------------------------------ living

function live() {
  const c = PRESETS.century.val[state.century];
  state.life = new Life({
    seed: state.seed, turbulence: c.turbulence, lethality: c.lethality,
    conscience: PRESETS.conscience.val[state.conscience],
    temptation: 12, sleepBase: .05, allotted: 0,
  });
  let guard = 0;
  while (state.life.alive && guard++ < 130) state.life.stepYear();
  state.year = null;
  $("#setup").hidden = true;
  $("#run").hidden = false;
  $("#seedout").textContent = (state.lang === "hr" ? "sjeme " : "seed ") + state.seed;
  drawAll();
}

function drawAll() { drawTree(); drawYears(); drawYearCard(); drawAccount(); }

// ---- act one: the family, drawn in the order Python resolves it -----------

function drawTree() {
  const life = state.life;
  const W = 520, H = 176;
  const at = {
    Ancestor: [260, 22], Grandmother: [110, 74], Grandfather: [410, 74],
    Mother: [150, 128], Father: [370, 128], You: [260, 168],
  };
  const edges = [
    ["Grandmother", "Ancestor"], ["Grandfather", "Ancestor"],
    ["Mother", "Grandmother"], ["Mother", "Grandfather"],
    ["Father", "Grandmother"], ["Father", "Grandfather"],
    ["You", "Mother"], ["You", "Father"],
  ];
  let svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' +
    t("given") + '">';
  for (const [a, b] of edges) {
    const [x1, y1] = at[a], [x2, y2] = at[b];
    svg += '<path class="edge" d="M' + x1 + " " + (y1 - 11) + "C" + x1 + " " +
      (y1 - 30) + " " + x2 + " " + (y2 + 22) + " " + x2 + " " + (y2 + 6) + '"/>';
  }
  for (const [who, [x, y]] of Object.entries(at)) {
    svg += '<text class="node" x="' + x + '" y="' + y + '" text-anchor="middle">' +
      w(who) + "</text>";
  }
  svg += "</svg>";
  $("#tree").innerHTML = svg;

  // the traits read as a list, which stays legible at any width and never
  // collides with the drawing
  const rows = Object.entries(life.fromWhom)
    .map(([trait, who]) => '<div class="row"><span class="tr">' + w(trait) +
      '</span><span class="ar">←</span><span class="wh">' + w(who) + "</span></div>");
  $("#inherit").innerHTML = rows.join("");
  $("#allot").textContent = life.lifespan + " " + t("allotted");
  $("#blamenote").textContent = t("blameNote");
}

// ---- act two: a square a year -------------------------------------------

function yearsOf(age) {
  const life = state.life;
  const from = age * 365, to = Math.min(life.days.length, (age + 1) * 365);
  return from >= life.days.length ? [] : life.days.slice(from, to);
}

function tallyYear(age) {
  const life = state.life, done = new Map(), thoughts = new Map();
  let busy = 0, tries = 0, worstNight = 0;
  for (const r of yearsOf(age)) {
    for (let i = 0; i < r.acts.length; i += 3) {
      const name = life.names[r.acts[i + 1]];
      done.set(name, (done.get(name) || 0) + r.acts[i + 2]);
    }
    for (const id of r.thoughts) {
      const text = life.thoughtNames[id];
      thoughts.set(text, (thoughts.get(text) || 0) + 1);
    }
    busy += r.busy; tries += r.attempts;
    if (r.attempts > worstNight) worstNight = r.attempts;
  }
  return { done, thoughts, busy, tries, worstNight, days: yearsOf(age).length };
}

function drawYears() {
  const life = state.life, box = $("#years");
  box.innerHTML = "";
  const lived = Math.floor((life.days.length - 1) / 365);
  const span = Math.max(lived, life.lifespan);
  const fullness = [];
  for (let a = 0; a <= span; a++) {
    const days = yearsOf(a);
    fullness.push(days.length ? days.reduce((s, r) => s + r.busy, 0) / days.length : 0);
  }
  const peak = Math.max(1, ...fullness);
  const evented = new Set(life.events.filter((e) => e.kind !== "world").map((e) => e.age));
  const worldly = new Set(life.worldEvents.map((e) => e.age));

  for (let a = 0; a <= span; a++) {
    if (a % 10 === 0) {
      const d = document.createElement("div");
      d.className = "decade"; d.textContent = a;
      box.appendChild(d);
    }
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell" + (fullness[a] ? "" : " unlived");
    cell.setAttribute("aria-label", String(a));
    if (fullness[a]) {
      const k = .18 + .82 * (fullness[a] / peak);
      cell.style.background = "color-mix(in srgb, var(--trace) " +
        Math.round(k * 100) + "%, transparent)";
      cell.addEventListener("click", () => { state.year = a; drawYears(); drawYearCard(); });
    } else {
      cell.disabled = true;
    }
    if (worldly.has(a)) cell.innerHTML += '<span class="ev world"></span>';
    if (evented.has(a)) cell.innerHTML += '<span class="ev mine"></span>';
    if (life.diedAt && a === life.diedAt[0]) cell.classList.add("dying");
    if (state.year === a) cell.setAttribute("aria-pressed", "true");
    box.appendChild(cell);
  }
}

function eventLine(e) {
  const cls = e.kind === "world" ? "world" : e.kind === "loss" ? "loss"
            : e.kind === "kept" ? "kept" : "";
  return '<li><span class="tag ' + cls + '">' + months()[e.month] + "</span><span>" +
    eventText(e) + "</span></li>";
}

function eventText(e) {
  const life = state.life;
  if (state.lang === "hr" && e.text.startsWith("raises it — ")) {
    const hurt = e.text.slice("raises it — ".length).split(" — ")[0];
    return t("raisedIt").replace(/^\S+\s/, "") + " " + w(hurt) + t("raisedAt");
  }
  return w(e.text);
}

function drawYearCard() {
  const life = state.life, card = $("#yearcard");
  const age = state.year === null ? Math.floor((life.days.length - 1) / 365) : state.year;
  const y = tallyYear(age);
  if (!y.days) { card.innerHTML = '<p class="note">' + t("noYear") + "</p>"; return; }
  const most = [...y.done.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([n]) => w(n)).join(" · ");
  const think = [...y.thoughts.entries()].sort((a, b) => b[1] - a[1])[0];
  let html = '<div><span class="age num">' + age + '</span><span class="stage">' +
    w(stageAt(age)) + "</span></div>";
  html += '<p class="mostly">' + t("mostly") + ": " + most + "</p>";
  if (think) html += '<p class="thought">' + t("thoughtOf") + ": " + w(think[0]) + "</p>";
  const here = life.events.filter((e) => e.age === age);
  if (here.length) html += "<ul>" + here.map(eventLine).join("") + "</ul>";
  card.innerHTML = html;
}

// ---- act three: what it came to -----------------------------------------

const CAT_COLOUR = {
  work: "var(--trace)", rest: "color-mix(in srgb, var(--trace) 38%, transparent)",
  care: "color-mix(in srgb, var(--trace) 62%, transparent)",
  worry: "var(--loss)", house: "var(--world)",
  school: "color-mix(in srgb, var(--world) 45%, transparent)",
  body: "color-mix(in srgb, var(--loss) 45%, transparent)",
  regret: "color-mix(in srgb, var(--loss) 72%, transparent)",
  other: "var(--grid)",
};

function drawAccount() {
  const life = state.life, box = $("#account");
  const by = new Map();
  let total = 0;
  for (const [name, minutes] of life.doneMinutes) {
    const cat = CAT_OF[name] || "other";
    by.set(cat, (by.get(cat) || 0) + minutes);
    total += minutes;
  }
  const order = CAT_ORDER.filter((c) => by.get(c));
  const lifeMinutes = (life.diedAt[0] || 1) * 365 * 1440;

  let html = "<h3>" + t("whereItWent") + "</h3>";
  html += '<div class="went">' + order.map((c) =>
    '<div style="width:' + (100 * by.get(c) / total).toFixed(2) + "%;background:" +
    CAT_COLOUR[c] + '" title="' + w(c + "_cat") + '"></div>').join("") + "</div>";
  html += '<div class="wentkey">' + order.map((c) =>
    '<div class="row"><span class="sw" style="background:' + CAT_COLOUR[c] + '"></span>' +
    "<span>" + w(c + "_cat") + '</span><span class="yr">' + spanOf(by.get(c)) +
    "</span></div>").join("") + "</div>";

  html += '<p class="big">' + t("awakeLine").replace("%1", spanOf(total))
    .replace("%2", String(life.diedAt[0])) + "</p>";

  const figures = [
    [num(life.totalThoughts), t("thoughts") + ", " + life.thoughtCount.size + " " + t("different")],
    [num(life.mornings), state.lang === "hr" ? "jutara" : "mornings"],
    [num(life.insomniaNights), t("nightsAwake")],
    [num(life.neverTotal), state.lang === "hr" ? "puta je znao bolje" : "things you knew better"],
    [num(life.questions), t("questions")],
  ];
  if (life.worstNight[0]) {
    figures.push([life.worstNight[0], t("worstLine")
      .replace("%1", String(life.worstNight[1])).replace("%2", life.worstNight[2])]);
  }
  html += '<div class="figures">' + figures.map(([v, k]) =>
    '<div class="fig"><span class="v">' + v + '</span><span class="k">' + k +
    "</span></div>").join("") + "</div>";

  const left = life.shouldDo.map((d) => d.name);
  html += "<h3>" + t("stillMeaning") + " (" + t("meantNote").toLowerCase() + " " +
    life.rememberedTotal + " " + t("times") + ")</h3>";
  html += left.length
    ? "<ul>" + left.map((n) => "<li>" + w(n) + "</li>").join("") + "</ul>"
    : '<p class="note">' + t("nothingLeft") + "</p>";
  if (life.motherDied !== undefined) {
    html += "<blockquote>„" + w("call your mother") + "” " +
      (state.lang === "hr"
        ? "otišlo je s popisa u " + life.motherDied + " i nije se moglo vratiti."
        : "left the list at " + life.motherDied + ", and could not be added again.") +
      "</blockquote>";
  }

  if (life.worldEvents.length) {
    html += "<h3>" + t("outside") + "</h3><ul>" + life.worldEvents.map((e) =>
      '<li><span class="n">' + e.age + " " + months()[e.month] + "</span><span>" +
      w(e.text) + "</span></li>").join("") + "</ul>";
  }

  const skills = life.skills.map((s) => w(s)).join(" · ");
  if (skills) html += "<h3>" + t("keptFromSchool") + "</h3><p>" + skills + "</p>";

  html = '<p class="big">' + t("died") + " " + life.diedAt[0] + ", " + t("at") + " " +
    life.diedAt[1] + ", " + t("gotUp") + " " + num(life.mornings) + " " + t("timesUp") +
    ".</p>" + (life.cause
      ? '<p class="note" style="color:var(--loss)">' + t("inTheYearOf") + " " +
        w(life.cause) + ".</p>" : "") + html;
  box.innerHTML = html;
}

// ---- watching it happen again, if you want to ---------------------------

function replay() {
  const box = $("#years");
  const cells = [...box.querySelectorAll(".cell")];
  box.classList.add("reveal");
  cells.forEach((c) => c.classList.remove("shown"));
  let i = 0;
  const step = () => {
    if (i >= cells.length) { box.classList.remove("reveal"); return; }
    cells[i++].classList.add("shown");
    setTimeout(step, 55);
  };
  step();
}

// ------------------------------------------------------------------ wiring

function init() {
  chrome(); buildSetup();
  $("#start").addEventListener("click", live);
  $("#again").addEventListener("click", () => {
    state.seed = Math.floor(Math.random() * 1e6);
    buildSetup(); live(); window.scrollTo({ top: 0, behavior: "smooth" });
  });
  $("#replay").addEventListener("click", replay);
  $("#lang").addEventListener("click", () => {
    state.lang = state.lang === "hr" ? "en" : "hr";
    chrome(); buildSetup();
    if (state.life) drawAll();
  });
}

init();
