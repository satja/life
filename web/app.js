const $ = (s, r) => (r || document).querySelector(s);
const fmt = (n) => n.toLocaleString("en-US");

const PRESETS = {
  century: {
    quiet:        { turbulence: 0.030, lethality: 0.4 },
    ordinary:     { turbulence: 0.075, lethality: 1.0 },
    turbulent:    { turbulence: 0.130, lethality: 1.8 },
    catastrophic: { turbulence: 0.200, lethality: 3.0 },
  },
  conscience: { rarely: 1/60000, sometimes: 1/26000, often: 1/8000, constantly: 1/1500 },
  temptation: { seldom: 30, ordinary: 12, often: 6, constantly: 3 },
  sleep:      { badly: 0.02, ordinarily: 0.05, easily: 0.12 },
};

const state = {
  life: null, playing: false, speed: 1, acc: 0, last: 0,
  zoom: { level: "life", year: 0, month: 0, day: 0 },
  choice: { century: "ordinary", conscience: "sometimes", temptation: "ordinary",
            sleep: "ordinarily", seed: Math.floor(Math.random() * 1e6) },
};

// ---------------------------------------------------------------- setup

function segment(name, options, current, onPick) {
  const seg = document.createElement("div");
  seg.className = "seg";
  seg.setAttribute("role", "group");
  for (const opt of options) {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = opt;
    b.setAttribute("aria-pressed", String(opt === current()));
    b.addEventListener("click", () => {
      onPick(opt);
      for (const other of seg.children) other.setAttribute("aria-pressed", String(other === b));
    });
    seg.appendChild(b);
  }
  return seg;
}

function buildSetup() {
  const knobs = $("#knobs");
  const make = (title, why, node) => {
    const k = document.createElement("div");
    k.className = "knob panel";
    k.innerHTML = `<h3>${title}</h3><p class="why">${why}</p>`;
    k.appendChild(node);
    knobs.appendChild(k);
  };

  make("The century",
    "How much happens that is not about you. Governments, borders, money, weather, war. A little of it can kill you.",
    segment("century", Object.keys(PRESETS.century), () => state.choice.century,
            (v) => (state.choice.century = v)));

  make("Conscience",
    "How often the list of things you meant to do is visible to you at all. At <i>sometimes</i>, roughly eight moments in a lifetime.",
    segment("conscience", Object.keys(PRESETS.conscience), () => state.choice.conscience,
            (v) => (state.choice.conscience = v)));

  make("Temptation",
    "How often the things you know better than to do have a length greater than zero.",
    segment("temptation", Object.keys(PRESETS.temptation), () => state.choice.temptation,
            (v) => (state.choice.temptation = v)));

  make("Sleep",
    "How readily you fall asleep once you are lying down. The rest of the night is spent thinking.",
    segment("sleep", Object.keys(PRESETS.sleep), () => state.choice.sleep,
            (v) => (state.choice.sleep = v)));

  const seedWrap = document.createElement("div");
  seedWrap.className = "begin";
  const input = document.createElement("input");
  input.className = "seed"; input.type = "number"; input.value = state.choice.seed;
  input.setAttribute("aria-label", "seed");
  input.addEventListener("input", () => (state.choice.seed = Number(input.value) || 0));
  const roll = document.createElement("button");
  roll.className = "ghost"; roll.type = "button"; roll.textContent = "roll";
  roll.addEventListener("click", () => {
    state.choice.seed = Math.floor(Math.random() * 1e6); input.value = state.choice.seed;
  });
  seedWrap.append(input, roll);
  make("Seed", "The same seed and the same settings give the same life, exactly, every time.",
       seedWrap);
}

function optionsFromChoice() {
  const c = PRESETS.century[state.choice.century];
  return {
    seed: state.choice.seed,
    turbulence: c.turbulence, lethality: c.lethality,
    conscience: PRESETS.conscience[state.choice.conscience],
    temptation: PRESETS.temptation[state.choice.temptation],
    sleepBase: PRESETS.sleep[state.choice.sleep],
    allotted: 0,
  };
}

// ---------------------------------------------------------------- running

function begin() {
  state.life = new Life(optionsFromChoice());
  state.zoom = { level: "life", year: 0, month: 0, day: 0 };
  $("#setup").hidden = true;
  $("#run").hidden = false;
  $("#seedout").textContent = "seed " + state.choice.seed;
  state.playing = true; state.acc = 0; state.last = performance.now();
  requestAnimationFrame(loop);
  draw(); paint();
}

function loop(now) {
  const life = state.life;
  if (!life) return;
  const dt = Math.min(250, now - state.last);
  state.last = now;
  if (state.playing && life.alive) {
    state.acc += dt * state.speed;
    let guard = 0;
    while (state.acc >= 1000 && life.alive && guard++ < 40) {
      state.acc -= 1000;
      life.stepYear();
      if (state.zoom.level === "life") state.zoom.year = life.age;
    }
    draw();
    if (now - (state.lastPaint || 0) > 180) { state.lastPaint = now; paint(); }
    if (!life.alive) { state.playing = false; setTransport(); paint(); }
  }
  requestAnimationFrame(loop);
}

function runToEnd() {
  const life = state.life;
  let guard = 0;
  while (life.alive && guard++ < 130) life.stepYear();
  state.playing = false; setTransport(); draw(); paint();
}

function setTransport() {
  const b = $("#play");
  b.textContent = state.playing ? "pause" : (state.life && state.life.alive ? "play" : "ended");
  b.disabled = !state.life || !state.life.alive;
  for (const btn of $("#speeds").children) {
    btn.setAttribute("aria-pressed", String(Number(btn.dataset.speed) === state.speed));
  }
}

// ---------------------------------------------------------------- the chart

function window_() {
  const life = state.life, z = state.zoom;
  if (z.level === "life") return [0, (life.lifespan + 2) * 365];
  if (z.level === "year") return [z.year * 365, (z.year + 1) * 365];
  return [z.year * 365 + Math.floor(z.month * 365 / 12),
          z.year * 365 + Math.floor((z.month + 1) * 365 / 12)];
}

function draw() {
  const life = state.life, cv = $("#chart");
  if (!life) return;
  const dpr = window.devicePixelRatio || 1;
  const W = cv.clientWidth, H = cv.clientHeight;
  if (cv.width !== W * dpr || cv.height !== H * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
  const g = cv.getContext("2d");
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const css = getComputedStyle(document.documentElement);
  const col = (n) => css.getPropertyValue(n).trim();
  g.clearRect(0, 0, W, H);

  const [d0, d1] = window_();
  const span = Math.max(1, d1 - d0);
  const pad = 22, base = H - pad, top = 16;
  const xOf = (d) => ((d - d0) / span) * W;

  // grid: decades at life scale, months inside a year, days inside a month
  g.strokeStyle = col("--grid"); g.fillStyle = col("--faint");
  g.lineWidth = 1; g.font = '10px ui-monospace, monospace';
  const marks = [];
  if (state.zoom.level === "life") {
    for (let a = 0; a <= life.lifespan + 2; a += 10) marks.push([a * 365, String(a)]);
  } else if (state.zoom.level === "year") {
    for (let m = 0; m < 12; m++)
      marks.push([state.zoom.year * 365 + Math.floor(m * 365 / 12), MONTHS[m]]);
  } else {
    for (let d = d0; d < d1; d += 7) marks.push([d, ""]);
  }
  for (const [d, label] of marks) {
    const x = Math.round(xOf(d)) + .5;
    g.beginPath(); g.moveTo(x, top - 8); g.lineTo(x, base); g.stroke();
    if (label) g.fillText(label, x + 4, H - 7);
  }
  g.strokeStyle = col("--rule");
  g.beginPath(); g.moveTo(0, base + .5); g.lineTo(W, base + .5); g.stroke();

  // the trace: how full each day was
  const perPx = Math.max(1, Math.ceil(span / W));
  const height = base - top;
  g.beginPath(); g.moveTo(xOf(d0), base);
  let drew = false;
  for (let d = d0; d < d1; d += perPx) {
    let sum = 0, n = 0;
    for (let k = 0; k < perPx && d + k < d1; k++) {
      const rec = life.days[d + k];
      if (rec) { sum += rec.busy; n++; }
    }
    if (!n) continue;
    const y = base - Math.min(1, sum / n / 1000) * height;
    g.lineTo(xOf(d), y); drew = true;
  }
  if (drew) {
    const lastDay = Math.min(d1, life.days.length);
    g.lineTo(xOf(lastDay), base); g.closePath();
    const grad = g.createLinearGradient(0, top, 0, base);
    grad.addColorStop(0, col("--trace")); grad.addColorStop(1, "transparent");
    g.globalAlpha = .30; g.fillStyle = grad; g.fill(); g.globalAlpha = 1;
    g.strokeStyle = col("--trace"); g.lineWidth = 1.2; g.stroke();
  }

  // what you knew better than to do, and the rare thing you got round to
  for (let d = d0; d < Math.min(d1, life.days.length); d++) {
    const rec = life.days[d];
    if (!rec) continue;
    if (rec.never) {
      g.fillStyle = col("--loss"); g.globalAlpha = .30;
      g.fillRect(xOf(d), base + 3, Math.max(1, W / span), 3);
      g.globalAlpha = 1;
    }
    if (rec.should) {
      g.fillStyle = col("--trace");
      g.fillRect(xOf(d) - 1, top - 12, 2.5, height + 12);
      g.globalAlpha = .12; g.fillRect(xOf(d) - 3, top - 12, 7, height + 12); g.globalAlpha = 1;
    }
  }

  // events
  for (const e of life.events) {
    const d = e.age * 365 + Math.floor(e.month * 365 / 12);
    if (d < d0 || d > d1) continue;
    const x = xOf(d);
    const c = e.kind === "world" ? col("--world") : e.kind === "loss" ? col("--loss") : col("--ink");
    g.fillStyle = c;
    if (e.kind === "world") { g.fillRect(x - 1, top - 14, 2, 9); }
    else { g.beginPath(); g.arc(x, base, 2.6, 0, 7); g.fill(); }
  }

  // playhead
  const nowDay = life.days.length;
  if (nowDay >= d0 && nowDay <= d1) {
    g.strokeStyle = col("--ink"); g.globalAlpha = .5; g.lineWidth = 1;
    const x = Math.round(xOf(nowDay)) + .5;
    g.beginPath(); g.moveTo(x, top - 14); g.lineTo(x, base + 6); g.stroke(); g.globalAlpha = 1;
  }

  // the selected year, when looking at the whole life
  if (state.zoom.level === "life" && state.zoom.year >= 0) {
    const a = xOf(state.zoom.year * 365), b = xOf((state.zoom.year + 1) * 365);
    g.fillStyle = col("--ink"); g.globalAlpha = .07;
    g.fillRect(a, top - 14, Math.max(1.5, b - a), base - top + 20); g.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------- panels

function yearSlice(year) {
  const life = state.life;
  const from = year * 365, to = Math.min(life.days.length, (year + 1) * 365);
  return life.days.slice(Math.min(from, life.days.length), to);
}

function tally(records) {
  const done = new Map(); let busy = 0, thoughts = 0, never = 0, should = 0,
      remembered = 0, attempts = 0, insomnia = 0;
  for (const r of records) {
    for (let i = 0; i < r.acts.length; i += 3) {
      const name = state.life.names[r.acts[i + 1]];
      done.set(name, (done.get(name) || 0) + 1);
    }
    busy += r.busy; thoughts += r.thoughts.length; never += r.never; should += r.should;
    remembered += r.remembered; attempts += r.attempts; insomnia += r.insomnia ? 1 : 0;
  }
  return { done, busy, thoughts, never, should, remembered, attempts, insomnia,
           days: records.length };
}

function topOf(map, n) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

function paint() {
  const life = state.life;
  if (!life) return;
  const age = life.diedAt ? life.diedAt[0] : life.age;
  $("#age").textContent = age;
  $("#of").textContent = "of " + life.lifespan + " allotted · " + MONTHS[life.month];
  $("#stage").textContent = life.alive ? stageAt(life.age) : "ended";

  // the mind
  $("#preocc").textContent = life.preoccupation ? life.preoccupation[0][0] : "—";
  const cloud = $("#cloud"); cloud.innerHTML = "";
  const hottest = topOf(life.thoughtCount, 14);
  const max = hottest.length ? hottest[0][1] : 1;
  for (const [text, n] of hottest) {
    const s = document.createElement("span");
    const rel = n / max;
    s.textContent = text;
    s.style.fontSize = (11.5 + rel * 5.5).toFixed(1) + "px";
    if (rel > .55) s.className = "hot";
    cloud.appendChild(s);
  }
  $("#distinct").textContent = life.thoughtCount.size + " distinct · " +
    fmt(life.totalThoughts) + " thought";

  // the lists
  const thisYear = tally(yearSlice(Math.max(0, life.age)));
  const should = $("#shouldlist");
  should.innerHTML = "";
  for (const item of life.shouldDo) {
    const li = document.createElement("li");
    li.textContent = item.name;
    should.appendChild(li);
  }
  if (life.noLonger.size) {
    for (const gone of life.noLonger) {
      const li = document.createElement("li"); li.className = "gone"; li.textContent = gone;
      should.appendChild(li);
    }
  }
  const box = $("#shouldbox");
  box.classList.toggle("lit", thisYear.remembered > 0);
  $("#remembered").textContent = life.gotRoundTo + " done · in view " +
    fmt(life.rememberedTotal) + "×";

  const never = $("#neverlist"); never.innerHTML = "";
  for (const [name, n] of topOf(new Map(NEVER_DO.map(
        (nm) => [nm, life.doneCount.get(nm) || 0])), 9)) {
    const li = document.createElement("li");
    li.innerHTML = name + ' <span class="num" style="color:var(--faint)">' + fmt(n) + "</span>";
    never.appendChild(li);
  }
  $("#neverbox").classList.toggle("lit", life.tempted);

  // the world
  const circ = $("#circ"); circ.innerHTML = "";
  const active = life.circumstances.filter((c) => c.until > life.age);
  if (!active.length) {
    circ.innerHTML = '<div style="color:var(--faint)">nothing in particular</div>';
  }
  for (const c of active) {
    const row = document.createElement("div"); row.className = "row";
    row.innerHTML = '<span class="tag world">until ' + c.until + "</span> <b>" + c.text + "</b>";
    circ.appendChild(row);
  }
  const recent = $("#recent"); recent.innerHTML = "";
  for (const e of life.events.slice(-6).reverse()) {
    const row = document.createElement("div"); row.className = "row";
    const cls = e.kind === "world" ? "world" : e.kind === "kept" ? "kept"
              : e.kind === "loss" ? "loss" : "";
    row.innerHTML = '<span class="num" style="color:var(--faint)">' + e.age +
      "</span> " + (cls ? '<span class="tag ' + cls + '">' + e.kind + "</span> " : "") + e.text;
    recent.appendChild(row);
  }
  paintDetail();
}

function crumb() {
  const z = state.zoom;
  const parts = ["whole life"];
  if (z.level !== "life") parts.push("age " + z.year);
  if (z.level === "month" || z.level === "day") parts.push(MONTHS[z.month]);
  if (z.level === "day") parts.push("day " + (z.day + 1));
  return parts.join("  ›  ");
}

function paintDetail() {
  const life = state.life, z = state.zoom, out = $("#detail");
  for (const b of $("#tabs").children) {
    b.setAttribute("aria-pressed", String(b.dataset.level === z.level));
  }
  let html = '<div class="crumb">' + crumb() + "</div>";
  if (z.level === "life") html += lifeView();
  else if (z.level === "year") html += yearView(z.year);
  else if (z.level === "month") html += monthView(z.year, z.month);
  else html += dayView(z.year, z.month, z.day);
  out.innerHTML = html;
  for (const row of out.querySelectorAll("tr.click")) {
    row.addEventListener("click", () => {
      const z2 = state.zoom;
      if (row.dataset.year !== undefined) {
        state.zoom = { level: "year", year: +row.dataset.year, month: 0, day: 0 };
      } else if (row.dataset.month !== undefined) {
        state.zoom = { level: "month", year: z2.year, month: +row.dataset.month, day: 0 };
      } else if (row.dataset.day !== undefined) {
        state.zoom = { level: "day", year: z2.year, month: z2.month, day: +row.dataset.day };
      }
      draw(); paintDetail();
    });
  }
}

function statBlock(pairs) {
  return '<div class="stats">' + pairs.map(
    ([v, k]) => '<div class="stat"><span class="v">' + v + '</span><span class="k">' + k +
                "</span></div>").join("") + "</div>";
}

function lifeView() {
  const life = state.life;
  let html = statBlock([
    [fmt(life.totalDone), "things done"],
    [fmt(life.totalThoughts), "thoughts, " + life.thoughtCount.size + " of them different"],
    [fmt(life.mornings), "mornings"],
    [String(life.gotRoundTo), "things you got round to"],
    [fmt(life.neverTotal), "things you knew better"],
    [fmt(life.insomniaNights), "nights still awake at three"],
  ]);
  html += '<h3 style="font-weight:400;font-size:15px;margin:18px 0 6px">What most of it was</h3>';
  html += '<table class="grid"><tbody>';
  const most = topOf(life.doneCount, 10);
  const max = most.length ? most[0][1] : 1;
  for (const [name, n] of most) {
    html += '<tr><td style="width:44%">' + name + '</td><td class="n">' + fmt(n) +
      '</td><td><span class="barcell" style="width:' + (100 * n / max).toFixed(1) + '%"></span></td></tr>';
  }
  html += "</tbody></table>";
  if (!life.alive) html += epilogue();
  return html;
}

function epilogue() {
  const life = state.life;
  const left = life.shouldDo.map((d) => d.name);
  let html = '<div class="epi" style="margin-top:20px;border-top:2px solid var(--ink);padding-top:14px">';
  html += '<div class="big">Died at ' + life.diedAt[0] + ", at " + life.diedAt[1] +
    ", having got up " + fmt(life.mornings) + " times.</div>";
  if (life.cause) html += '<div class="cause">In the year of ' + life.cause + ".</div>";
  if (left.length) {
    html += "<div><b style='font-weight:400'>Still meaning to:</b><ul class='items'>" +
      left.map((n) => "<li>" + n + "</li>").join("") + "</ul></div>";
  }
  if (life.motherDied !== undefined) {
    html += "<blockquote>“call your mother” left the list at " + life.motherDied +
      ", and could not be added again.</blockquote>";
  }
  if (life.worldEvents.length) {
    html += "<div><b style='font-weight:400'>Meanwhile, outside:</b><ul class='items'>" +
      life.worldEvents.map((e) => "<li><span class='num' style='color:var(--faint)'>" +
        e.age + " " + MONTHS[e.month] + "</span> &nbsp;" + e.text + "</li>").join("") + "</ul></div>";
  }
  html += "<div>Questions left open at school: " + fmt(life.questions) + ".</div>";
  html += "</div>";
  return html;
}

function yearView(year) {
  const life = state.life;
  const rows = [];
  for (let m = 0; m < 12; m++) {
    const from = year * 365 + Math.floor(m * 365 / 12);
    const to = year * 365 + Math.floor((m + 1) * 365 / 12);
    const recs = life.days.slice(Math.min(from, life.days.length),
                                Math.min(to, life.days.length));
    if (!recs.length) continue;
    const t = tally(recs);
    rows.push([m, t]);
  }
  if (!rows.length) return "<p style='color:var(--muted)'>Not lived yet.</p>";
  const peak = Math.max(...rows.map((r) => r[1].busy / Math.max(1, r[1].days)));
  let html = '<table class="grid"><thead><tr><th>month</th><th>how full</th><th>mostly</th>' +
             '<th>knew better</th></tr></thead><tbody>';
  for (const [m, t] of rows) {
    const most = topOf(t.done, 2).map((x) => x[0]).join(" · ");
    const rel = (t.busy / Math.max(1, t.days)) / (peak || 1);
    html += '<tr class="click" data-month="' + m + '"><td class="n">' + MONTHS[m] +
      '</td><td style="width:26%"><span class="barcell" style="width:' +
      (100 * rel).toFixed(1) + '%"></span></td><td>' + most + '</td><td class="n">' +
      (t.never || "") + "</td></tr>";
  }
  html += "</tbody></table>";
  const events = life.events.filter((e) => e.age === year);
  if (events.length) {
    html += "<ul class='items' style='margin-top:12px'>" + events.map((e) =>
      "<li><span class='tag " + (e.kind === "world" ? "world" : e.kind === "loss" ? "loss"
        : e.kind === "kept" ? "kept" : "") + "'>" + MONTHS[e.month] + "</span> " + e.text +
      "</li>").join("") + "</ul>";
  }
  return html;
}

function monthView(year, month) {
  const life = state.life;
  const from = year * 365 + Math.floor(month * 365 / 12);
  const to = year * 365 + Math.floor((month + 1) * 365 / 12);
  let html = '<table class="grid"><thead><tr><th>day</th><th>up</th><th>asleep</th>' +
             '<th>doing</th><th>tries</th></tr></thead><tbody>';
  let any = false;
  for (let d = from; d < to; d++) {
    const r = life.days[d];
    if (!r) continue;
    any = true;
    const names = [];
    for (let i = 0; i < r.acts.length; i += 3) names.push(life.names[r.acts[i + 1]]);
    html += '<tr class="click" data-day="' + (d - from) + '"><td class="n">' +
      (d - from + 1) + '</td><td class="n">' + hhmm(r.wake) + '</td><td class="n">' +
      hhmm(r.asleep) + "</td><td>" + names.slice(0, 3).join(" · ") + '</td><td class="n">' +
      (r.attempts || "") + "</td></tr>";
  }
  html += "</tbody></table>";
  return any ? html : "<p style='color:var(--muted)'>Not lived yet.</p>";
}

function hhmm(m) {
  m = Math.round(m) % MIN_DAY;
  return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
}

function dayView(year, month, day) {
  const life = state.life;
  const from = year * 365 + Math.floor(month * 365 / 12);
  const r = life.days[from + day];
  if (!r) return "<p style='color:var(--muted)'>Not lived yet.</p>";
  const total = Math.max(1, r.busy);
  let band = '<div class="dayband">';
  const list = [];
  for (let i = 0; i < r.acts.length; i += 3) {
    const kind = r.acts[i], name = life.names[r.acts[i + 1]], mins = r.acts[i + 2];
    band += '<div class="kind' + kind + '" style="width:' + (100 * mins / total).toFixed(2) +
      '%" title="' + name + '"></div>';
    list.push([kind, name, mins]);
  }
  band += "</div>";
  const KIND = ["", "had to", "meant to", "knew better"];
  let html = statBlock([
    [hhmm(r.wake), "up" + (r.alarm ? ", to an alarm" : ", when it stopped")],
    [hhmm(r.asleep), "asleep" + (r.insomnia ? ", after three" : "")],
    [String(r.attempts), "tries to fall asleep"],
    [String(r.thoughts.length), "thoughts"],
  ]);
  html += band;
  html += '<div class="daylist">' + list.map(([k, n, m]) =>
    '<div>' + n + ' <span class="num" style="color:var(--faint)">' + m + "′" +
    (k ? " · " + KIND[k] : "") + "</span></div>").join("") + "</div>";
  const seen = new Map();
  for (const t of r.thoughts) {
    const text = life.thoughtNames[t];
    seen.set(text, (seen.get(text) || 0) + 1);
  }
  html += '<h3 style="font-weight:400;font-size:15px;margin:16px 0 4px">Thought about</h3>';
  html += '<div class="cloud">' + topOf(seen, 12).map(([t, n]) =>
    "<span>" + t + (n > 1 ? ' <span class="num" style="color:var(--faint)">×' + n + "</span>" : "") +
    "</span>").join("") + "</div>";
  return html;
}

// ---------------------------------------------------------------- wiring

function init() {
  buildSetup();
  $("#start").addEventListener("click", begin);
  $("#play").addEventListener("click", () => {
    state.playing = !state.playing; state.last = performance.now(); setTransport();
  });
  $("#toend").addEventListener("click", runToEnd);
  $("#again").addEventListener("click", () => {
    state.life = null; state.playing = false;
    $("#run").hidden = true; $("#setup").hidden = false;
  });
  for (const btn of $("#speeds").children) {
    btn.addEventListener("click", () => { state.speed = Number(btn.dataset.speed); setTransport(); });
  }
  for (const btn of $("#tabs").children) {
    btn.addEventListener("click", () => {
      const level = btn.dataset.level;
      const z = state.zoom;
      state.zoom = { level, year: z.year, month: z.month, day: z.day };
      draw(); paintDetail();
    });
  }
  const cv = $("#chart");
  const inspect = (ev) => {
    const life = state.life;
    if (!life) return;
    const rect = cv.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
    const [d0, d1] = window_();
    const day = Math.floor(d0 + frac * (d1 - d0));
    const z = state.zoom;
    if (z.level === "life") { z.year = Math.max(0, Math.floor(day / 365)); }
    else if (z.level === "year") { z.month = Math.min(11, Math.floor((day - z.year * 365) * 12 / 365)); }
    else { z.day = Math.max(0, day - d0); }
    draw(); paintDetail();
  };
  cv.addEventListener("click", inspect);
  cv.addEventListener("dblclick", () => {
    const z = state.zoom;
    z.level = z.level === "life" ? "year" : z.level === "year" ? "month" : "day";
    draw(); paintDetail();
  });
  window.addEventListener("resize", () => draw());
  window.addEventListener("keydown", (e) => {
    if (e.key === " " && state.life) {
      e.preventDefault(); state.playing = !state.playing;
      state.last = performance.now(); setTransport();
    }
  });
  setTransport();
}

init();
