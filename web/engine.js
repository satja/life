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

// A day is not a bag you empty; it is a length of time, and things belong to
// parts of it. Anything not named here can happen whenever.
const BANDS = {
  dawn:      (t) => t >= 300 && t < 540,
  morning:   (t) => t >= 360 && t < 720,
  workday:   (t) => t >= 480 && t < 1080,
  day:       (t) => t >= 540 && t < 1140,
  afternoon: (t) => t >= 720 && t < 1140,
  evening:   (t) => t >= 1020 || t < 120,
  any:       () => true,
};

const WHEN = {
  "working": "workday", "working, still": "workday", "going to work": "workday",
  "going back to it": "workday", "answering messages": "workday",
  "answering the message": "workday", "paying the bill": "workday",
  "looking for work": "workday", "how to look busy": "workday",
  "applying": "workday", "waiting for an answer": "workday",
  "going to school": "morning", "handing it in": "morning",
  "explaining yourself": "morning", "doing the homework": "afternoon",
  "studying the night before": "evening", "lying about homework": "morning",
  "watching cartoons": "morning", "playing until it is dark": "afternoon",
  "riding a bike": "afternoon", "collecting stones": "afternoon",
  "running": "afternoon", "being outside again": "afternoon",
  "opening the windows": "morning", "waiting for it to get light": "dawn",
  "keeping warm": "evening", "staying in": "day",
  "watching it get dark early": "evening", "sitting in the shade": "afternoon",
  "going to the water": "day", "lying awake in the heat": "evening",
  "being at the sea": "day", "doing nothing, on purpose": "day",
  "reading half a book": "afternoon", "eating outside": "evening",
  "staying up too late": "evening", "slamming a door": "evening",
  "looking in the mirror": "morning", "saying nothing at dinner": "evening",
  "arguing": "evening", "listening to the same song": "evening",
  "drinking too much": "evening", "going somewhere cheap": "day",
  "moving out": "day", "calling home, briefly": "evening",
  "driving somewhere": "day", "carrying something heavy": "day",
  "being needed": "evening", "seeing fewer friends": "evening",
  "sleeping badly": "evening", "cancelling": "workday",
  "worrying about money": "evening", "fixing the same thing again": "afternoon",
  "getting it repaired": "workday", "taking the bins out": "evening",
  "looking after someone": "day", "going to funerals": "morning",
  "walking for the sake of it": "afternoon",
  "reading the news too closely": "morning",
  "having the same argument": "evening", "putting something aside": "afternoon",
  "standing in the doorway of a room": "evening",
  "walking slowly": "afternoon", "reading the same page twice": "afternoon",
  "watering the plants": "morning", "watching the news": "evening",
  "waiting for the phone": "day", "telling the story again": "evening",
  "sitting in the sun": "afternoon", "going to the doctor": "morning",
  "going to the check-up": "morning", "taking the pills": "morning",
  "being visited": "afternoon", "sleeping in the afternoon": "afternoon",
  "not recognising the street": "day", "looking at photographs": "evening",
  "waiting": "day", "sitting": "afternoon",
  "carrying someone who is asleep": "evening",
  "reading the same book aloud": "evening",
  "worrying about someone else": "evening",
  "renewing the documents": "workday", "getting it looked at": "morning",
  "carrying things upstairs": "day", "queueing": "morning",
};

// what a Saturday is for, which is not what a Tuesday is for
const WEEKEND = [["having a lie-in", 55, "morning"], ["the long walk", 120, "day"],
  ["seeing people", 150, "afternoon"], ["the shopping", 90, "morning"],
  ["mending something", 70, "afternoon"], ["cooking properly", 110, "evening"]];

// two numbers a life carries rather than has
const AILMENTS = [
  ["something is found", 3, 0.055,
   [["going to the hospital", 180, "morning"], ["waiting for the result", 60, "day"],
    ["taking the pills", 45, "morning"]]],
  ["the operation", 1, 0.050,
   [["lying still", 240, "any"], ["being visited", 90, "afternoon"],
    ["learning to walk about again", 60, "day"]]],
  ["the bad winter", 2, 0.018,
   [["staying in", 200, "day"], ["coughing", 30, "any"]]],
  ["the back goes", 4, 0.0,
   [["lying on the floor", 90, "any"], ["not lifting anything", 40, "day"]]],
  ["the nerves", 5, 0.0,
   [["not answering the phone", 40, "day"], ["sitting very still", 120, "evening"]]],
];
const COSTS = { money: -0.22, war: -0.16, plague: -0.06, nature: -0.12,
                politics: -0.04, progress: 0.06 };
const POOR = [["counting it again", 30, "evening"], ["going without", 40, "any"],
  ["the cheaper shop", 45, "morning"], ["asking for more hours", 25, "workday"]];
const COMFORTABLE = [["having it done properly", 90, "workday"],
  ["going away for a few days", 300, "day"], ["giving some of it away", 30, "any"]];
const POORLY = [["resting", 120, "afternoon"], ["taking it slowly", 60, "any"],
  ["going to the doctor", 110, "morning"]];
const HARD_WORK = new Set(["carrying something heavy", "carrying things upstairs",
  "the long walk", "riding a bike", "running", "going to the water"]);
const TRADES = ["at the works", "in the office", "on the buses", "in the shop",
  "at the school", "on the site", "in the kitchens", "on the road"];

// when a life of this age goes to bed, and when it gets up
const BEDTIME = { infant: 1140, child: 1230, teenager: 1410, young: 1380,
                  middle: 1350, later: 1350, old: 1320, late: 1260 };
const WAKING = { infant: 390, child: 420, teenager: 420, young: 420,
                 middle: 405, later: 405, old: 390, late: 420 };
const aWeekend = (day) => day % 7 === 5 || day % 7 === 6;

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

// Every dial the machinery turns on, and what leans on it. Mirrors the
// tables in world.py: a trait is an entry here, and the entry is read by
// the loop.
const DIALS = { sleep: 0.05, restless: 1.0, conscience: 1 / 26000,
                temptation: 1 / 12, persistence: 0.96, frailty: 1.0 };

const FROM_GENES = {
  "worry":            { sleep: ["+", -0.018], restless: ["x", 1.35], temptation: ["x", 1.20] },
  "fear_of_the_dark": { sleep: ["+", -0.010], restless: ["x", 1.15] },
  "patience":         { sleep: ["+", 0.012], restless: ["x", 0.80], temptation: ["x", 0.75] },
  "stubbornness":     { persistence: ["+", 0.02], frailty: ["x", 0.90], conscience: ["x", 0.80] },
  "hope":             { conscience: ["x", 1.60], frailty: ["x", 0.85] },
  "silence":          { temptation: ["x", 0.80], restless: ["x", 1.10] },
  "posture":          { frailty: ["x", 1.15] },
  "a way with people": { conscience: ["x", 1.25] },
};
const FROM_UPBRINGING = { temptation: ["x", 1.15], restless: ["x", 1.10] };
const FROM_HISTORY = {
  war:      { sleep: ["+", -0.015], restless: ["x", 1.30], temptation: ["x", 1.20] },
  plague:   { restless: ["x", 1.20], conscience: ["x", 1.40] },
  money:    { restless: ["x", 1.20], temptation: ["x", 1.15] },
  nature:   { sleep: ["+", -0.010], restless: ["x", 1.15] },
  politics: { restless: ["x", 1.10] },
  progress: { conscience: ["x", 1.10] },
};

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


// ---- memory.py: who and what the thinking is about ----------------------
// The mind was a list of fifty things, and a list of fifty things comes
// round in a fortnight. What a person thinks about is a small number of
// shapes and a very large number of particulars, and the particulars come
// out of the life being lived.

const M_STAGES = ["infant", "child", "teenager", "young", "middle", "later",
                  "old", "late"];
const BEHIND = "behind", NOW = "now", AHEAD = "ahead", ALWAYS = "always";

const ONES = ["zero","one","two","three","four","five","six","seven","eight",
  "nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen",
  "seventeen","eighteen","nineteen"];
const TENS = ["","","twenty","thirty","forty","fifty","sixty","seventy",
  "eighty","ninety"];
function spell(n) {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
}

// each shape is [words, theme, earliest stage, where it points, how it feels]
const PERSON = [
  ["whether %s is all right", "love", 2, NOW, 0],
  ["what %s would say about this", "shame", 2, AHEAD, 0],
  ["%s, and the thing you did not say", "love", 3, BEHIND, -1],
  ["ringing %s, at some point", "love", 3, AHEAD, 0],
  ["whether %s ever thinks about it too", "love", 2, NOW, 0],
  ["the way %s says your name", "love", 1, ALWAYS, 1],
  ["what you owe %s, which is not money", "money", 4, AHEAD, -1],
  ["%s was right, and knew it", "shame", 4, BEHIND, -1],
  ["whether %s will call", "love", 5, AHEAD, 0],
  ["being no use to %s", "shame", 4, NOW, -1],
  ["something %s said that turned out to be true", "love", 4, BEHIND, 1],
  ["a day out with %s, when it is warmer", "love", 3, AHEAD, 1],
];
const GONE = [
  ["what you never asked %s", "death", 0, BEHIND, -1],
  ["%s, in the doorway", "death", 0, BEHIND, 0],
  ["the last thing %s said, or what you have made of it", "death", 0, BEHIND, 0],
  ["whether %s would know you now", "death", 0, NOW, 0],
  ["the year %s was still on the phone", "death", 0, BEHIND, 1],
];
const ESTRANGED = [
  ["whether %s would answer", "shame", 0, AHEAD, 0],
  ["who stopped first, you or %s", "shame", 0, BEHIND, -1],
  ["what it would take, with %s", "shame", 0, AHEAD, 0],
];
const THING = [
  ["%s, still", "money", 2, NOW, -1],
  ["getting to %s at the weekend", "time", 2, AHEAD, 0],
  ["%s, and how long it has been like that", "shame", 3, BEHIND, -1],
  ["what %s would cost now", "money", 4, AHEAD, -1],
  ["the afternoon %s is finally done", "time", 3, AHEAD, 1],
];
const PLACE = [
  ["the smell of %s", "home", 1, ALWAYS, 1],
  ["%s, in the dark", "fear", 1, ALWAYS, -1],
  ["whether %s is still there", "home", 4, NOW, 0],
  ["standing %@, doing nothing", "home", 3, ALWAYS, 1],
  ["something that happened %@, once", "home", 4, BEHIND, 0],
  ["going back to %s, one of these years", "home", 4, AHEAD, 1],
];
const ACHE = [
  ["the noise %s makes", "body", 0, NOW, -1],
  ["%s, in the morning", "body", 0, NOW, -1],
  ["whether %s is getting worse", "body", 0, AHEAD, -1],
];
const YEAR = [
  ["what you said at %s", "shame", 3, BEHIND, -1],
  ["the summer you were %s", "time", 3, BEHIND, 1],
  ["how sure you were at %s", "shame", 4, BEHIND, 0],
  ["being %s again, for an hour", "time", 5, BEHIND, 1],
];

const M_NAMES = ["Marko","Vera","Ivan","Nada","Josip","Ljubica","Zoran","Ana",
  "Damir","Snje\u017eana","Tomislav","Mira","Branko","Dubravka"];
const M_THINGS = ["the tap","the boxes in the hall","the documents","the car",
  "the letter you did not send","the photograph in the drawer",
  "the coat that still fits","the money you lent",
  "the shelf that was going to go up"];
// a place carries the preposition that goes with it, because nobody stands
// in the stairs
const M_PLACES = [["the hallway","in"],["the stairs","on"],
  ["the room at the back","in"],["the kitchen table","at"],["the yard","in"],
  ["the road out of town","on"],["the top of the house","at"],
  ["the corridor at school","in"],["the back step","on"]];

// %s takes the name of the thing, %@ takes it with its preposition
function fill(template, who) {
  return template.indexOf("%@") >= 0
    ? template.replace("%@", who.at + " " + who.word)
    : template.replace("%s", who.word);
}
const M_ACHES = ["the knee","the back","the shoulder","the tooth","the hands",
  "the eyes","the hip"];

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
    this.dials = Object.assign({}, DIALS); this.working = {}; this.dialsAt = {};

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

    this.wandering = 0; this.waking = 0; this.wokeAt = 0;
    this.dayEnds = 22 * 60; this.health = 1.0; this.money = 0.5;
    this.job = null; this.yearsInJob = 0; this.ailments = [];
    this.points = new Map(); this.tone = new Map();
    this.buildMemory();

    this.inherit();
    this.raiseChildhood();
    this.goToSchool();
    this.timeline = this.unfoldHistory();
    this.windUp();
    this.schedule = this.buildSchedule();
  }

  // ---- memory.py: the particulars this life happens to have
  buildMemory() {
    const take = (list, n) => {
      const left = list.slice(), out = [];
      for (let i = 0; i < n && left.length; i++) {
        out.push(left.splice(Math.floor(this.rng() * left.length), 1)[0]);
      }
      return out;
    };
    const About = (key, word, kind, since, at) =>
      ({ key, word, kind, since: since || 0, gone: null, estranged: false,
         at: at || "in" });
    this.people = [About("mother", "your mother", "person", 0),
                   About("father", "your father", "person", 0)];
    this.spare = take(M_NAMES.slice(1), 10);
    this.things = take(M_THINGS, 4).map((w, i) => About("t" + i, w, "thing", 0));
    this.places = take(M_PLACES, 4).map((w, i) => About("p" + i, w[0], "place", 0, w[1]));
    this.aches = take(M_ACHES, 3).map((w, i) =>
      About("a" + i, w, "ache", this.rrange(26, 62)));
    // whoever else was in the house. Siblings are there from the start.
    const sibs = this.rint(3);
    for (let i = 0; i < sibs && this.spare.length; i++) {
      this.people.push({ key: "sib" + i, word: this.spare.pop(), kind: "person",
                         since: 0, gone: null, estranged: false, at: "in" });
    }
    const ages = [];
    while (ages.length < 3) {
      const n = this.rrange(13, 33);
      if (!ages.includes(n)) ages.push(n);
    }
    ages.sort((a, b) => a - b);
    this.years = ages.map((n) => About("y" + n, spell(n), "year", n + 4));
  }

  entersMemory(key, word, since) {
    if (this.people.some((p) => p.key === key)) return;
    this.people.push({ key, word, kind: "person", since,
                       gone: null, estranged: false });
  }

  someone() {
    if (this.spare.length) return this.spare.pop();
    const taken = new Set(this.people.map((p) => p.word));
    const left = M_NAMES.filter((n) => !taken.has(n));
    return this.pick(left.length ? left : M_NAMES);
  }

  estrange(age) {
    const here = this.people.filter((p) => p.gone === null && !p.estranged &&
      p.since <= age && p.key !== "mother" && p.key !== "child");
    if (here.length) this.pick(here).estranged = true;
  }

  subjectsAt(age) {
    const all = this.people.concat(this.things, this.places, this.aches, this.years);
    return all.filter((w) => w.since <= age &&
      (w.kind !== "person" || w.gone === null || w.gone <= age));
  }

  // everything this life is in a position to think, said in full
  compose(age, stage) {
    const index = M_STAGES.indexOf(stage), out = [];
    const take = (who, shapes) => {
      for (const [words, theme, from, points, tone] of shapes) {
        if (index >= from) {
          out.push([fill(words, who), theme, who.key, points, tone]);
        }
      }
    };
    for (const who of this.people) {
      if (who.since > age) continue;
      if (who.gone !== null) take(who, GONE);
      else { take(who, PERSON); if (who.estranged) take(who, ESTRANGED); }
    }
    for (const who of this.things) take(who, THING);
    for (const who of this.places) take(who, PLACE);
    for (const who of this.aches) if (who.since <= age) take(who, ACHE);
    for (const who of this.years) if (who.since <= age) take(who, YEAR);
    return out;
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

  // recompute every dial from what was given, what was done, and what is
  // going on at the moment, keeping the working so it can be read
  windUp() {
    const base = Object.assign({}, DIALS, {
      sleep: this.opts.sleepBase, conscience: this.opts.conscience,
      temptation: 1 / this.opts.temptation,
    });
    this.dials = Object.assign({}, base);
    this.working = {}; for (const k in base) this.working[k] = [];
    const lean = (source, table) => {
      for (const dial in table) {
        const [how, amount] = table[dial];
        this.working[dial].push([source, how, amount]);
        if (how === "+") this.dials[dial] += amount; else this.dials[dial] *= amount;
      }
    };
    for (const trait of Object.keys(this.given).sort()) {
      if (FROM_GENES[trait]) {
        lean(trait + " (" + (this.fromWhom[trait] || "?") + ")", FROM_GENES[trait]);
      }
    }
    for (let i = 0; i < this.unresolved.length; i++) {
      lean("carried from childhood", FROM_UPBRINGING);
    }
    for (const c of this.circumstances) {
      if (FROM_HISTORY[c.kind]) lean(c.text, FROM_HISTORY[c.kind]);
    }
    const withAge = Math.round((1.15 - 0.005 * this.age) * 1000) / 1000;
    this.working.restless.push(["being " + this.age, "x", withAge]);
    this.dials.restless *= withAge;

    this.dials.sleep = Math.max(0.008, this.dials.sleep);
    this.dials.persistence = Math.min(0.995, this.dials.persistence);
    this.dialsAt[this.age] = { dials: Object.assign({}, this.dials),
                               working: JSON.parse(JSON.stringify(this.working)) };
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
    // the same attributes genes.py puts on the same classes, so that the
    // order Python resolves them in is the order resolved here
    const mother = ["Mother", { worry: 1, eyes: "green", everything_else: "hers",
                                patience: "with everyone but you" }];
    const father = ["Father", { worry: "about what people think", posture: "bad",
                                eyes: "grey", silence: "at the table",
                                stubbornness: "the quiet kind" }];
    // genes.py builds You with the bases in one order or the other; whichever
    // comes first is the one the resolution order reaches first
    const takesAfterMother = this.rint(2) === 0;
    this.takeAfter = takesAfterMother ? "Mother" : "Father";
    const MRO = [
      ["You", {}],
      takesAfterMother ? mother : father,
      takesAfterMother ? father : mother,
      ["Grandmother", { stubbornness: 1, recipe: "never written down", worry: "about money" }],
      ["Grandfather", { silence: "long", patience: 1 }],
      ["Ancestor", { hope: 1, fear_of_the_dark: 1, eyes: "brown",
                     worry: "about the winter", silence: "the kind you are born into",
                     posture: "from carrying things" }],
    ];
    const traits = ["hope","fear_of_the_dark","stubbornness","worry","posture","silence",
                    "recipe","eyes","patience","a way with people"];
    this.given = {}; this.fromWhom = {}; this.inheritedFrom = {};
    for (const trait of traits) {
      const dominant = this.rint(3) > 0;
      if (!dominant && this.rint(2) !== 0) continue;
      for (let i = 0; i < MRO.length; i++) {
        if (trait in MRO[i][1]) { this.given[trait] = true; break; }
      }
      if (!(trait in this.given)) continue;
      // inherit() walks the order forwards and stops at the nearest;
      // blame() walks it backwards and reaches the furthest
      for (let i = 0; i < MRO.length; i++) {
        if (trait in MRO[i][1]) { this.inheritedFrom[trait] = MRO[i][0]; break; }
      }
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
    add(6, "starts school", "school");
    add(18, "leaves school with a certificate stating that you can be taught");
    add(18, "average mark: " + this.average.toFixed(1));
    add(this.rrange(15, 20), "falls in love, silently", "loved");
    add(this.rrange(19, 26), "first job", "work");
    add(this.rrange(20, 29), "moves out for good");
    // somebody to live with, which the model had no room for at all
    const met = this.rrange(19, 34), them = this.someone();
    add(met, "meets " + them, ["meet", them, met]);
    const moved = met + this.rrange(1, 5);
    add(moved, "moves in with " + them, ["movein", them]);
    for (let i = 0, n = this.pick([0, 1, 1, 1, 2, 2, 3]); i < n; i++) {
      const born = moved + this.rrange(1, 12), name = this.someone();
      add(born, name + " is born", ["born", name, born]);
      add(born + 6, name + " starts school", ["school-age", name, born]);
      add(born + this.rrange(18, 27), name + " leaves home", ["leaves", name]);
    }
    const ending = this.rint(5);
    if (ending === 0) {
      add(moved + this.rrange(6, 31), "it ends, with " + them, ["parted", them]);
    } else if (ending === 1) {
      add(moved + this.rrange(22, 51), them + " dies first", ["bereaved", them]);
    }
    if (this.rint(2) === 0) {
      add(this.rrange(30, 55), "stops speaking to someone", "estranged");
    }
    const buriesFather = this.rrange(37, 72);
    add(buriesFather, "your father dies", "father");
    add(Math.min(96, buriesFather + this.rrange(0, 15)), "your mother dies", "mother");
    add(66, "stops going to work", "retires");
    if (this.raised) add(this.raised[0],
      "raises it — " + this.raised[1] + " — at someone who was not there");
    return plan;
  }

  // ------------------------------------------------------------ the machinery

  refreshMind() {
    const age = this.age, stage = stageAt(age);
    let thoughts = THOUGHTS[stage].map((t) => [t[0], t[1], null, ALWAYS, 0]);
    for (const c of this.circumstances) {
      if (c.thinks) {
        thoughts = thoughts.concat(c.thinks.map((t) => [t[0], t[1], null, NOW, 0]));
      }
    }
    thoughts = thoughts.concat(this.compose(age, stage));
    // live.py draws from the pool uniformly, so a bias can only be a number
    // of copies of a thing in it. The shapes come out at about three
    // thoughts forward for every two back on their own; the pleasant ones
    // need a thumb, or a life here is more rueful than the sampling says.
    thoughts = thoughts.concat(thoughts.filter((t) => t[4] > 0));

    // a preoccupation is a subject, not a sentence: for a few years more of
    // what you think is about the same person, or the same unpaid thing
    const subjects = this.subjectsAt(age);
    if (subjects.length && (!this.preoccupation || this.preoccupation[1] <= age)) {
      this.preoccupation = [this.pick(subjects).key, age + this.rrange(2, 8), age];
    }
    if (this.preoccupation) {
      const on = this.preoccupation[0];
      thoughts = thoughts.concat(thoughts.filter((t) => t[2] === on));
    }
    this.conscious = thoughts.map((t) => ({ text: t[0], theme: t[1], about: t[2],
                                            points: t[3], tone: t[4], deep: false }));
    this.subconscious = DEEP.filter((d) => age >= d[2])
      .map((d) => ({ text: d[0], theme: d[1], about: null, points: ALWAYS,
                     tone: -1, deep: true })).concat(this.scars);
    this.neverDo = age >= 13
      ? NEVER_DO.map((n) => ({ name: n, kind: 3, minutes: this.rrange(5, 40) })) : [];
    this.byTheme = new Map(); this.bySubject = new Map();
    for (const t of this.conscious.concat(this.subconscious)) {
      if (!this.byTheme.has(t.theme)) this.byTheme.set(t.theme, []);
      this.byTheme.get(t.theme).push(t);
      if (t.about) {
        if (!this.bySubject.has(t.about)) this.bySubject.set(t.about, []);
        this.bySubject.get(t.about).push(t);
      }
    }
  }

  remember(text, theme) {
    if (this.scars.length >= 8) return;
    if (this.scars.some((s) => s.text === text)) return;
    const t = { text, theme, about: null, points: BEHIND, tone: -1, deep: true };
    this.scars.push(t); this.subconscious.push(t);
    if (!this.byTheme.has(theme)) this.byTheme.set(theme, []);
    this.byTheme.get(theme).push(t);
  }

  restock() {
    let choices = CAN_DO[this.stage].slice();
    for (const s of this.skillsKept) choices.push([s, 45]);
    for (const c of this.circumstances) if (c.does) choices = choices.concat(c.does);
    choices = choices.concat(SEASON[SEASONS[this.month]]);
    if (this.money < 0.35) {
      choices = choices.concat(POOR).filter((c) =>
        c[0] !== "going somewhere cheap" && c[0] !== "being at the sea" &&
        c[0] !== "eating outside");
    } else if (this.money > 0.72) {
      choices = choices.concat(COMFORTABLE);
    }
    if (this.health < 0.62) {
      choices = choices.concat(POORLY).filter((c) => !HARD_WORK.has(c[0]));
    }
    const already = new Set(), distinct = [];
    for (const entry of choices) {
      const name = entry[0], minutes = entry[1];
      // a thing that arrives with a circumstance says when it happens
      if (entry.length > 2 && !(name in WHEN)) WHEN[name] = entry[2];
      if (!already.has(name)) { already.add(name); distinct.push([name, minutes]); }
    }
    this.choices = distinct;
  }

  // what there is to do is what there is to do *now*, and nobody starts a
  // day's work at eight in the evening
  fitting(pool, strict) {
    if (!this.alive) return [];
    const now = this.minute % MIN_DAY;
    let fits = pool.filter((d) => BANDS[d.band || "any"](now));
    if (!fits.length && !strict) {
      // nothing suits the hour, so anything that suits any hour will do
      fits = pool.filter((d) => (d.band || "any") === "any");
      if (!fits.length) fits = pool.slice();
    }
    const room = this.dayEnds - this.minute;
    const inside = fits.filter((d) => d.minutes <= room + 20);
    return inside.length ? inside : fits;
  }

  // health and money are not dials — the loop never reads them by name.
  // They are read by what there is to do, and by how easily a bad year can
  // kill you, which is the same thing as being read by the loop.
  keepTheBooks(age) {
    const wear = age < 35 ? 0 : (age - 35) * 0.0009;
    let ill = 0;
    for (const c of this.circumstances) if (c.kind === "ailment") ill += 0.04;
    this.health = Math.min(1, Math.max(0.05, this.health - wear - ill + 0.015));

    let target;
    if (age < 18) target = 0.5;
    else if (age >= 66) target = 0.42;
    else {
      const earning = this.job !== null &&
        !this.circumstances.some((c) => c.kind === "work");
      this.yearsInJob = earning ? this.yearsInJob + 1 : 0;
      target = earning ? 0.46 + Math.min(0.22, this.yearsInJob * 0.011) : 0.24;
    }
    for (const c of this.circumstances) if (c.kind === "child") target -= 0.05;
    this.money += (target - this.money) * 0.3 + this.gauss() * 0.02;
    for (const c of this.circumstances) {
      if (c.costs) { this.money += c.costs; c.costs = 0; }
    }
    this.money = Math.min(1, Math.max(0.02, this.money));

    if (age >= 20 && this.rnd() < (0.006 + Math.max(0, age - 35) * 0.0018) *
                                  (2 - this.health)) {
      const [text, years, risk, does] = this.pick(AILMENTS);
      if (!this.circumstances.some((c) => c.text === text)) {
        this.circumstances.push({ text, until: age + years, kind: "ailment",
          risk: risk * (2 - this.health), does, thinks: [], costs: -0.05 });
        this.note(text, "loss");
        this.remember(text, "body");
      }
    }
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
    // a circumstance arrives at a birthday but is dated to a month, and the
    // month has to be a day you actually lived, or it cannot be zoomed into
    const age = this.age, month = this.rint(12);
    const day = age * DAYS_YEAR + Math.floor(month * DAYS_YEAR / 12) + this.rint(27);
    this.circumstances.push({
      text: event.t, until: age + event.years, kind: event.kind,
      risk: (event.risk || 0) * this.opts.lethality,
      does: event.does || [], thinks: event.thinks || [],
      costs: COSTS[event.kind] || 0,
    });
    // the works closing is not a mood; it is the end of a wage
    if (event.kind === "work" && this.job) this.job = null;
    this.worldEvents.push({ age, month, text: event.t, kind: event.kind });
    this.events.push({ age, month, day, text: event.t, kind: "world" });
    if (event.costs) this.owe(event.costs);
  }

  owe(name) {
    if (this.noLonger.has(name)) return;
    if (this.shouldDo.some((d) => d.name === name)) return;
    this.shouldDo.push({ name, kind: 2, minutes: this.rrange(20, 120) });
  }

  takeHousehold(what, age) {
    const kind = what[0];
    if (kind === "meet") {
      this.entersMemory("partner", what[1], what[2]);
    } else if (kind === "movein") {
      this.circumstances.push({ text: "living with " + what[1], until: 200,
        risk: 0, kind: "household", thinks: [],
        does: [["cooking properly", 110, "evening"],
               ["the same argument", 35, "evening"],
               ["going somewhere together", 180, "day"],
               ["sitting in the same room, not talking", 60, "evening"]] });
    } else if (kind === "parted") {
      this.dropCircumstance("household");
      for (const p of this.people) if (p.word === what[1]) p.estranged = true;
      this.remember("the door, and then the stairs", "love");
      this.alone();
    } else if (kind === "bereaved") {
      this.dropCircumstance("household");
      for (const p of this.people) if (p.word === what[1]) p.gone = age;
      this.remember("the other side of the bed", "death");
      this.alone();
    } else if (kind === "born") {
      this.entersMemory(what[1], what[1], what[2]);
      this.circumstances.push({ text: "a small child", until: age + 6, risk: 0,
        kind: "child", thinks: [],
        does: [["carrying someone who is asleep", 60, "evening"],
               ["reading the same book aloud", 30, "evening"],
               ["being up in the night", 45, "evening"],
               ["worrying about someone else", 45, "evening"]] });
    } else if (kind === "school-age") {
      this.circumstances.push({ text: "a child at school", until: age + 12,
        risk: 0, kind: "child", thinks: [],
        does: [["the school run", 40, "morning"],
               ["helping with the homework", 45, "afternoon"],
               ["being shouted at by someone small", 20, "evening"],
               ["worrying about someone else", 45, "evening"]] });
    } else if (kind === "leaves") {
      this.dropCircumstance("child");
      this.circumstances.push({ text: "the room at the back, empty",
        until: age + 4, risk: 0, kind: "quiet", thinks: [],
        does: [["standing in the doorway of a room", 15, "evening"],
               ["ringing them, briefly", 14, "evening"]] });
    }
  }

  dropCircumstance(kind) {
    this.circumstances = this.circumstances.filter((c) => c.kind !== kind);
  }

  alone() {
    this.circumstances.push({ text: "living alone", until: 200, risk: 0,
      kind: "alone", thinks: [],
      does: [["eating standing up", 20, "any"], ["leaving the radio on", 90, "any"],
             ["nobody to tell", 30, "evening"]] });
  }

  takeEffect(key) {
    const age = this.age;
    if (Array.isArray(key)) { this.takeHousehold(key, age); return; }
    if (key === "school") {
      this.entersMemory("school1", "Marko", age);
      this.entersMemory("school2", this.someone(), age);
    } else if (key === "work") {
      this.job = this.pick(TRADES);
      this.note("starts " + this.job, "milestone");
      this.entersMemory("work1", this.someone(), age);
    } else if (key === "retires") {
      this.job = null;
    } else if (key === "loved") {
      this.entersMemory("loved", this.someone(), age);
    } else if (key === "estranged") {
      this.estrange(age);
    } else if (key === "father") {
      for (const p of this.people) if (p.key === "father") p.gone = age;
      this.remember("the silence at the table", "death");
    } else if (key === "mother") {
      for (const p of this.people) if (p.key === "mother") p.gone = age;
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
    this.keepTheBooks(age);
    this.windUp();
    if (age > this.lifespan) { this.die(null); return; }
    for (const c of this.circumstances) {
      const chance = c.risk * frailty(age) * this.dials.frailty * (2 - this.health);
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
      const grief = effect === "father" || effect === "mother" ||
        (Array.isArray(effect) && (effect[0] === "bereaved" || effect[0] === "parted"));
      this.note(text, grief ? "loss" : "milestone");
      if (effect) this.takeEffect(effect);
    }
    this.pending = later;
  }

  newMonth() { this.monthSeen = this.month; this.firePending(); this.restock(); this.drift(); }

  morningOf(full) {
    this.mornings++;
    this.dayIndex = this.day;
    this.sleepAttempts = 0; this.insomniaNoted = false; this.lying = false;
    this.wokeAt = this.minute;
    const age = this.age;
    if (age !== this.yearSeen) { this.yearSeen = age; this.birthday(age); }
    if (!this.alive) { this.canDo = []; return; }
    if (this.month !== this.monthSeen) this.newMonth();
    const stage = this.stage, day = this.day;
    const late = aWeekend(day) && stage !== "infant" && stage !== "child" ? 50 : 0;
    this.dayEnds = this.dayIndex * MIN_DAY + BEDTIME[stage] + late +
                   Math.round(this.gauss() * 40);
    if (this.dayEnds <= this.minute + 90) this.dayEnds = this.minute + 90;

    const doy = day % DAYS_YEAR;
    const away = doy >= this.holidayFrom && doy < this.holidayTo;
    const weekend = aWeekend(day);
    let pool = this.choices;
    if (away) {
      pool = pool.filter((c) => !WORK.has(c[0]) && !TERM_ONLY.has(c[0])).concat(HOLIDAY);
    } else if (weekend) {
      // nobody goes to work on a Sunday, and Saturday has its own things
      pool = pool.filter((c) => !WORK.has(c[0]) && !SCHOOL.has(c[0]) &&
                                !TERM_ONLY.has(c[0]));
      for (const [n, m, b] of WEEKEND) { if (!(n in WHEN)) WHEN[n] = b; }
      pool = pool.concat(WEEKEND.map(([n, m]) => [n, m]));
    } else if (age < 20 && doy >= 172 && doy < 244) {
      pool = pool.filter((c) => !TERM_ONLY.has(c[0]));
    }
    // more is offered than the day can hold, because the day is what runs out
    const offered = Math.min(pool.length, energyAt(age) + (full ? 5 : 3));
    this.canDo = this.weightedPick(pool, Math.max(1, offered)).map(
      ([name, minutes]) => ({ name, kind: 0, minutes, band: WHEN[name] || "any" }));
    if (!away && !weekend && this.mustDo.length < 9 && this.rint(2) === 0) {
      let owed = MUST_DO[this.stage];
      if (doy >= 172 && doy < 244) owed = owed.filter((o) => !SCHOOL.has(o));
      if (owed.length) {
        const name = this.pick(owed);
        this.mustDo.push({ name, kind: 1, minutes: this.rrange(20, 90),
                           band: WHEN[name] || "any" });
      }
    }
    this.tempted = this.rnd() < this.dials.temptation;
    this.reminded = false;
  }

  doThing(thing) {
    // where the day was when this began, and how far the day's thinking had
    // got — so a thing done can be placed in the day and carry the thoughts
    // that led up to it
    const began = this.minute % MIN_DAY;
    const thoughtsSoFar = this.record.thoughts.length;
    this.tick(thing.minutes);
    this.record.acts.push(thing.kind, this.nameId(thing.name), thing.minutes,
                          began, thoughtsSoFar);
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
    this.idle += Math.round(this.rrange(4, 13) * this.dials.restless);
    // the day is over when the hour says so, and not when the bag is empty
    if (thing.kind === 0 && this.minute >= this.dayEnds) this.canDo = [];
    this.tempted = this.rnd() < this.dials.temptation;
    if (!this.reminded && this.rnd() < this.dials.conscience) {
      this.reminded = true; this.record.remembered++; this.rememberedTotal++;
    }
  }

  think(thought) {
    // while you are up you are already doing something, so the thought does
    // not stop the day; it colours a stretch of it, and that stretch is what
    // the sampling work counts. Lying down there is nothing alongside it.
    if (this.lying) this.tick(this.rrange(1, 4));
    else this.wandering += this.rrange(2, 8);
    this.points.set(thought.points, (this.points.get(thought.points) || 0) + 1);
    this.tone.set(thought.tone, (this.tone.get(thought.tone) || 0) + 1);
    this.idle--;
    this.totalThoughts++;
    this.record.thoughts.push(this.thoughtId(thought.text));
    this.thoughtCount.set(thought.text, (this.thoughtCount.get(thought.text) || 0) + 1);
    this.themeCount.set(thought.theme, (this.themeCount.get(thought.theme) || 0) + 1);
    if (thought.deep) { this.deepCount++; this.deepTexts.add(thought.text); }
  }

  // three in the morning is not nine in the morning. What is available to
  // think is the same; what comes to hand is not.
  atThisHour(thoughts) {
    const hour = Math.floor((this.minute % MIN_DAY) / 60);
    let leaning;
    if (hour >= 22 || hour < 5) {
      leaning = thoughts.filter((t) => t.points === BEHIND || t.tone < 0);
    } else if (hour < 11) {
      leaning = thoughts.filter((t) => t.points === AHEAD);
    } else return thoughts;
    return leaning.length ? leaning.concat(leaning, thoughts) : thoughts;
  }

  // what a thought leads to is the same subject before it is the same theme
  related(thought) {
    if (thought.about && this.rint(3) > 0) {
      const near = this.bySubject.get(thought.about);
      if (near && near.length) return this.atThisHour(near);
    }
    return this.atThisHour(this.byTheme.get(thought.theme) || this.conscious);
  }

  thinkAboutStuff() {
    const all = this.atThisHour(this.subconscious.concat(this.conscious));
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
    if (this.minute >= this.dayEnds) {
      this.lying = true;
      this.idle += Math.round(this.rrange(2, 9) * this.dials.restless);
      return true;
    }
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
    const chance = this.dials.sleep + 0.012 * this.sleepAttempts;
    if (this.rnd() < chance) { this.night(); return true; }
    return false;
  }

  night() {
    this.waking += Math.max(0, this.minute - this.wokeAt);
    if (this.insomniaNoted && this.sleepAttempts > this.worstNight[0]) {
      this.worstNight = [this.sleepAttempts, this.age, this.clockTime()];
    }
    this.record.attempts = this.sleepAttempts;
    this.record.asleep = this.minute % MIN_DAY;
    this.record.insomnia = this.insomniaNoted;
    const tomorrow = this.dayIndex + 1;
    const stage = this.stage || "young";
    const lieIn = aWeekend(tomorrow) && stage !== "infant" && stage !== "old" &&
                  stage !== "late" ? 75 : 0;
    const wake = WAKING[stage] + lieIn + Math.round(this.gauss() * 25);
    const target = tomorrow * MIN_DAY + wake;
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
      let now = this.fitting(this.canDo, false);
      const more = now.length > 0;
      this.hitIf(38, more, more ? now.length + " to hand" : "the day is over");
      if (!more || guard++ >= 300) break;
      this.hit(39); this.thinkAboutStuff();

      const dueNow = this.fitting(this.mustDo, true);
      const must = dueNow.length > 0;
      this.hitIf(41, must, must ? dueNow.length : "");
      if (must) {
        const yes = this.rint(2) === 0;
        this.hitIf(42, yes);
        if (yes) {
          const thing = this.pick(dueNow);
          this.hit(43, thing.name); this.hit(44, thing.minutes + " min");
          this.doThing(thing);
        }
      }

      const should = this.reminded && this.shouldDo.length > 0;
      this.hitIf(46, should, should ? "in view" : "len() is 0");
      if (should) {
        const yes = this.rint(3) === 0;
        this.hitIf(47, yes);
        if (yes) {
          const thing = this.pick(this.shouldDo);
          this.hit(48, thing.name); this.hit(49, thing.minutes + " min");
          this.doThing(thing);
        }
      }

      const never = this.tempted && this.neverDo.length > 0;
      this.hitIf(51, never, never ? "tempted" : "len() is 0");
      if (never) {
        const yes = this.rint(4) === 0;
        this.hitIf(52, yes);
        if (yes) {
          const thing = this.pick(this.neverDo);
          this.hit(53, thing.name); this.hit(54, thing.minutes + " min");
          this.doThing(thing);
        }
      }

      now = this.fitting(this.canDo, false);
      if (!now.length) break;
      const thing = this.pick(now);
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
