const $ = (s, r) => (r || document).querySelector(s);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const state = {
  life: null, lang: (navigator.language || "en").startsWith("hr") ? "hr" : "en",
  seed: Math.floor(Math.random() * 1e6), open: new Set(), walk: null,
};
const t = (k) => UI[state.lang][k];
const fmt = (n) => n.toLocaleString("en-US");

const KEYWORDS = /\b(def|while|if|else|return|import|from|pass|True|False|not|in|and|or|len|random|__name__)\b/g;
const NAMES = Object.keys(SRC.reveals).sort((a, b) => b.length - a.length);
const NAME_RE = new RegExp("\\b(" + NAMES.join("|") + ")\\b", "g");

// ---------------------------------------------------------------- listings

function colour(line) {
  let html = esc(line);
  html = html.replace(/'[^']*'/g, (m) => '<span class="st">' + m + "</span>");
  html = html.replace(/#.*$/, (m) => '<span class="cm">' + m + "</span>");
  html = html.replace(NAME_RE, (m) =>
    '<button class="nm" type="button" data-name="' + m + '">' + m + "</button>");
  return html.replace(KEYWORDS, (m) => '<span class="kw">' + m + "</span>");
}

function listing(box, text, margins) {
  const lines = text.split("\n");
  let html = "";
  lines.forEach((line, i) => {
    const no = i + 1;
    const m = margins ? margins(no) : "";
    html += '<div class="ln' + (m === null ? " dead" : "") + '" data-line="' + no + '">' +
      '<span class="no">' + no + '</span><span class="src">' + colour(line) +
      '</span><span class="margin">' + (m || "") + "</span></div>";
  });
  box.innerHTML = html;
  for (const b of box.querySelectorAll("button.nm")) {
    b.addEventListener("click", () => toggle(b.dataset.name));
  }
  for (const b of box.querySelectorAll("button.dial")) {
    b.addEventListener("click", () => {
      const key = "dial:" + b.dataset.dial;
      if (state.open.has(key)) state.open.delete(key); else state.open.add(key);
      draw();
    });
  }
}

function counts(no) {
  const life = state.life;
  if (!life) return "";
  if (!life.hits[no]) return TRACED.includes(no) ? null : "";
  let out = '<span class="n">' + fmt(life.hits[no]) + "×</span>";
  if (life.conds.has(no)) {
    out += '  <span class="t">' + t("tru") + " " + fmt(life.trues[no]) + "</span>";
  }
  const now = dialsNow();
  if (DIAL_ON[no] && now) {
    const dial = DIAL_ON[no];
    out += '  <button class="dial" type="button" data-dial="' + dial + '" data-at="' + no +
      '">' + dial + " " + now.dials[dial].toFixed(SHOW[dial]) + "</button>";
  }
  return out;
}

// both listings are redrawn together, because a name clicked in main.py
// belongs to a module and a name clicked in live.py belongs to world.py
function draw() {
  listing($("#main"), SRC.main, null);
  listing($("#live"), SRC.live, state.life ? counts : null);
  for (const name of state.open) {
    if (name.startsWith("dial:")) insertDial(name.slice(5)); else insert(name);
  }
}

// the working for a dial, opened on the line of live.py that reads it
function insertDial(dial) {
  const now = dialsNow();
  if (!now) return;
  const line = Object.keys(DIAL_ON).find((k) => DIAL_ON[k] === dial);
  const host = $('#live .ln[data-line="' + line + '"]');
  if (!host) return;
  const div = document.createElement("div");
  div.className = "reveal"; div.dataset.for = "dial:" + dial;
  div.innerHTML = '<div class="where">world.py:wind_up</div><pre>' +
    esc(derivation(dial, now)) + "</pre>";
  host.after(div);
}

// ---- clicking a name shows what it is, from the file it is in ------------

function toggle(name) {
  if (state.open.has(name)) { state.open.delete(name); } else { state.open.add(name); }
  draw();
  const opened = $('.reveal[data-for="' + name + '"]');
  if (opened) opened.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function insert(name) {
  const blocks = SRC.reveals[name];
  if (!blocks) return;
  const rows = [...document.querySelectorAll(".listing .ln")];
  const host = rows.find((r) => r.querySelector('button.nm[data-name="' + name + '"]'));
  if (!host) return;
  for (const b of host.querySelectorAll('button.nm[data-name="' + name + '"]')) {
    b.setAttribute("aria-expanded", "true");
  }
  const div = document.createElement("div");
  div.className = "reveal"; div.dataset.for = name;
  div.innerHTML = blocks.map((b) =>
    '<div class="where">' + b.file + ":" + b.line + "</div><pre>" + colour(b.code) +
    "</pre>").join("");
  host.after(div);
  for (const b of div.querySelectorAll("button.nm")) {
    b.addEventListener("click", () => toggle(b.dataset.name));
  }
}

// ---------------------------------------------------------------- running

function run() {
  state.life = new Life({
    seed: state.seed, turbulence: .075, lethality: 1, temptation: 12,
    conscience: 1 / 26000, sleepBase: .05, allotted: 0,
  });
  let guard = 0;
  while (state.life.alive && guard++ < 130) state.life.stepYear();
  stopWalk();
  $("#out").hidden = false;
  $("#run").textContent = t("again");
  draw();
  $("#account").textContent = account();
  $("#clockwork").textContent = clockwork();
}

// ---- one day, line by line ----------------------------------------------

function stopWalk() {
  if (state.walk) { clearTimeout(state.walk.timer); state.walk = null; }
  $("#walk").setAttribute("aria-pressed", "false");
  $("#walk").textContent = t("walk");
  for (const r of document.querySelectorAll("#live .ln.here")) r.classList.remove("here");
  if (state.life) draw();
}

function startWalk() {
  const age = Math.max(0, Math.min(state.life.diedAt[0] - 1, Number($("#walkage").value) || 0));
  const trace = state.life.traceOneDay(age);
  if (!trace.length) return;
  state.walk = { trace, i: 0, timer: null };
  $("#walk").setAttribute("aria-pressed", "true");
  $("#walk").textContent = t("stop");
  listing($("#live"), SRC.live, () => "");
  tick();
}

function tick() {
  const walk = state.walk;
  if (!walk) return;
  if (walk.i >= walk.trace.length) { stopWalk(); return; }
  const [line, note] = walk.trace[walk.i++];
  for (const r of document.querySelectorAll("#live .ln.here")) r.classList.remove("here");
  const row = $('#live .ln[data-line="' + line + '"]');
  if (row) {
    row.classList.add("here");
    row.querySelector(".margin").textContent = note;
    row.scrollIntoView({ block: "nearest" });
  }
  walk.timer = setTimeout(tick, 70);
}

// ---- the clockwork: every dial, and what leans on it --------------------

const READS = {
  sleep: "fall_asleep()          live.py:17",
  restless: "have_nothing_to_do     live.py:30",
  conscience: "things_you_should_do   live.py:46",
  temptation: "things_you_should_never_do  live.py:51",
  persistence: "what you keep doing    world.py:drift",
  frailty: "what the world does    world.py:birthday",
};
const SHOW = { sleep: 4, restless: 3, conscience: 6, temptation: 4,
               persistence: 3, frailty: 3 };
// which line of live.py reads which dial, so the working can be opened there
const DIAL_ON = { 17: "sleep", 30: "restless", 46: "conscience", 51: "temptation" };

function dialsNow() {
  const life = state.life;
  if (!life || !life.diedAt) return null;
  const want = Math.max(0, Math.min(life.diedAt[0], Number($("#walkage").value) || 0));
  let at = want;
  while (at >= 0 && !life.dialsAt[at]) at--;
  return at < 0 ? null : Object.assign({ at }, life.dialsAt[at]);
}

function derivation(dial, now) {
  const dp = SHOW[dial] || 3;
  const base = dial === "conscience" ? 1 / 26000
    : dial === "temptation" ? 1 / 12 : DIALS[dial];
  const out = [dial + "  " + base.toFixed(dp) + "   " + t("base")];
  for (const [source, how, amount] of now.working[dial] || []) {
    const shown = how === "+" ? (amount > 0 ? "+" : "") + amount.toFixed(dp)
                              : "x" + amount.toFixed(2);
    out.push("   " + shown.padStart(9) + "   " + source);
  }
  out.push("   " + "-".repeat(9));
  out.push("   " + now.dials[dial].toFixed(dp).padStart(9) + "   " + t("atAge") + " " + now.at);
  return out.join("\n");
}

function clockwork() {
  const life = state.life;
  const want = Math.max(0, Math.min(life.diedAt[0], Number($("#walkage").value) || 0));
  let at = want;
  while (at >= 0 && !life.dialsAt[at]) at--;
  if (at < 0) return "";
  const { dials, working } = life.dialsAt[at];
  $("#clockat").textContent = t("atAge") + " " + at;

  const out = [];
  for (const dial of Object.keys(dials)) {
    const dp = SHOW[dial] || 3;
    const base = dial === "conscience" ? 1 / 26000
      : dial === "temptation" ? 1 / 12 : DIALS[dial];
    out.push(dial.padEnd(13) + String(base.toFixed(dp)).padStart(9) + "   " + t("base"));
    for (const [source, how, amount] of working[dial] || []) {
      const shown = how === "+" ? (amount > 0 ? "+" : "") + amount.toFixed(dp)
                                : "x" + amount.toFixed(2);
      out.push(" ".repeat(13) + shown.padStart(9) + "   " + source);
    }
    out.push(" ".repeat(13) + "-".repeat(9));
    out.push(" ".repeat(13) + dials[dial].toFixed(dp).padStart(9) + "   " +
             t("readBy") + " " + READS[dial]);
    out.push("");
  }
  return out.join("\n").trimEnd();
}

// ---------------------------------------------------------------- the account

function account() {
  const life = state.life;
  const out = [];
  const pad = (v, k) => String(v).padStart(11) + "   " + k;

  out.push("You(" + (life.takeAfter === "Mother" ? "Mother, Father" : "Father, Mother") +
           ")  — the bases in that order, which is why inherit() reaches " +
           life.takeAfter + " first");
  out.push("");
  out.push("inherited" + " ".repeat(17) + "inherit()      blame()");
  for (const [trait, blamed] of Object.entries(life.fromWhom)) {
    const near = life.inheritedFrom[trait] || blamed;
    out.push("    " + trait.padEnd(22) + near.padEnd(15) + blamed +
             (near === blamed ? "" : "   <- resolved by the order"));
  }
  out.push("");
  out.push("died at " + life.diedAt[0] + ", at " + life.diedAt[1] +
           (life.cause ? ", in the year of " + life.cause : "") + ".");
  out.push("");
  out.push(pad(fmt(life.mornings), "mornings"));
  out.push(pad(fmt(life.totalDone), "things done"));
  out.push(pad(fmt(life.totalThoughts), "thoughts, " + life.thoughtCount.size +
    " of them different"));
  out.push(pad(fmt(life.neverTotal), "things it knew better than to do"));
  out.push(pad(life.gotRoundTo, "things it got round to"));
  out.push(pad(fmt(life.rememberedTotal), "times the list was in view"));
  out.push(pad(fmt(life.insomniaNights), "nights still awake at three"));
  out.push(pad(fmt(life.questions), "questions left open at school"));
  out.push("");

  const left = life.shouldDo.map((d) => d.name);
  if (left.length) {
    out.push("still meaning to");
    for (const n of left) out.push("    " + n);
  } else {
    out.push("nothing left on the list. this is rarer than it sounds.");
  }
  if (life.motherDied !== undefined) {
    out.push("");
    out.push('    "call your mother" left the list at ' + life.motherDied +
             ", and could not be added again.");
  }
  if (life.worldEvents.length) {
    out.push("");
    out.push("meanwhile, outside");
    for (const e of life.worldEvents) {
      out.push("    " + String(e.age).padStart(3) + " " + MONTHS[e.month] + "   " + e.text);
    }
  }
  if (life.raised) {
    out.push("");
    out.push("    it came up once, at " + life.raised[0] + ", at someone who was not there:");
    out.push("    " + life.raised[1] + ".");
  }
  return out.join("\n");
}

// ---------------------------------------------------------------- wiring

function chrome() {
  document.documentElement.lang = state.lang;
  $("#lang").textContent = t("lang");
  $("#blurb").textContent = t("blurb");
  $("#h-entry").textContent = t("entry");
  $("#entrynote").textContent = t("entryNote");
  $("#h-stage").textContent = t("stage");
  $("#stagenote").textContent = t("stageNote");
  $("#h-account").textContent = t("account");
  $("#h-clock").textContent = t("clock");
  $("#clocknote").textContent = t("clockNote");
  $("#hint").textContent = t("hint");
  $("#l-seed").textContent = t("seed");
  $("#l-atage").textContent = t("atAge");
  $("#roll").textContent = t("roll");
  $("#run").textContent = state.life ? t("again") : t("run");
  $("#walk").textContent = state.walk ? t("stop") : t("walk");
}

function init() {
  $("#seed").value = state.seed;
  chrome();
  draw();
  $("#run").addEventListener("click", run);
  $("#roll").addEventListener("click", () => {
    state.seed = Math.floor(Math.random() * 1e6); $("#seed").value = state.seed;
  });
  $("#seed").addEventListener("input", () => (state.seed = Number($("#seed").value) || 0));
  $("#walk").addEventListener("click", () => (state.walk ? stopWalk() : startWalk()));
  $("#walkage").addEventListener("input", () => {
    // the dials shown in the margin belong to an age, so the listing is
    // redrawn with the table
    if (state.life) { draw(); $("#clockwork").textContent = clockwork(); }
  });
  $("#lang").addEventListener("click", () => {
    state.lang = state.lang === "hr" ? "en" : "hr";
    chrome();
    if (state.life) { draw(); $("#account").textContent = account();
                      $("#clockwork").textContent = clockwork(); }
  });
}

init();
