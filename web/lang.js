// Only the commentary is translated. Everything the program says — the names
// in it, and the values it produces — stays in the language it was written
// in, which is Python.

const UI = {
  en: {
    lang: "hrvatski",
    blurb: "A life is a tree, and everything in it is a row. The bar is the whole " +
      "of it, a tick to a year. The rows below are the same life opened: a year " +
      "holds its months, a month its days, a day the things you did, a thing the " +
      "thoughts you had on the way to it.",
    run: "run one life", again: "change the conditions", running: "living it…",
    moment: "a moment of it",
    seed: "seed", roll: "roll",
    hint: "A moment of it takes one of the twenty million or so minutes that were " +
      "actually lived and opens the way down to it, a level at a time, ending on " +
      "whatever was being thought. Every year is there and every year opens, " +
      "including the ones nothing happened in, which were lived through all the " +
      "same; below the year the children something happened in are shown and the " +
      "rest are counted. A year also holds the six numbers the loop was reading " +
      "while it passed, computed by wind_up() in world.py out of what you were " +
      "given, what was done to you before you could object, and what happens to be " +
      "going on — and beside each one is the line of live.py that reads it.",

    century: "the century",
    centuryWhy: "How much happens that is not about you. Governments, borders, money, " +
      "weather, war. A little of it can kill you.",
    centurySet: ["quiet", "ordinary", "turbulent", "catastrophic"],
    conscience: "conscience",
    conscienceWhy: "How often the list of things you meant to do is visible to you at " +
      "all. At ordinary, about eight moments in a lifetime.",
    conscienceSet: ["rarely", "ordinary", "often", "constantly"],
    temptation: "temptation",
    temptationWhy: "How often the things you know better than to do have a length " +
      "greater than zero.",
    temptationSet: ["seldom", "ordinary", "often", "constantly"],
    sleep: "sleep",
    sleepWhy: "How readily you fall asleep once you are lying down. The rest of the " +
      "night is spent thinking.",
    sleepSet: ["badly", "ordinarily", "easily"],
    seedWhy: "The same seed and the same settings give the same life, exactly, every time.",

    aLife: "a life", years: "years", account: "what it came to",
    more: "… % more", mostly: "mostly",
    theDials: "what the loop was reading", base: "base", readBy: "read at",
    asFar: "as far as it is allowed to go",
    stillAwake: "still awake", asleep: "asleep", attempts: "% attempts",

    less: "less", moreOf: "more", tookUp: "took up", noMore: "no more",
    thinkingOf: "mostly about",
    carried: "what it was living on, at the end",
    healthLeft: "of the health it started with", moneyLeft: "of what there is to have",
    yearsInJob: "years in the same job", worked: "worked", noJob: "not working",
    elsewhere: "of waking minutes with the mind somewhere else",
    measuredAt: "measured at 46.9% — Killingsworth & Gilbert, Science 2010",
    ptAhead: "pointing ahead", ptBehind: "pointing behind",
    ptNow: "on the moment", ptAlways: "on nothing in particular",
    tonePlus: "pleasant", toneZero: "neutral", toneMinus: "unpleasant",
    whoAbout: "who and what it was all about",
    goneAt: "gone at", notSpeaking: "not speaking", achesFrom: "from then on",

    inOrder: "the bases, in that order",
    died: "died at", inTheYearOf: "in the year of",
    mornings: "mornings", thingsDone: "things done", thoughts: "thoughts",
    different: "different things to think", mostlyThat: "mostly",
    knewBetter: "things it knew better than to do",
    gotRoundTo: "things it got round to", nightsAwake: "nights still awake at three",
    questions: "questions left open at school",
    meaningTo: "still meaning to", nothingLeft: "nothing left on the list",
    leftTheList: "\"call your mother\" left the list, and could not be added again",
    outside: "meanwhile, outside",
  },
  hr: {
    lang: "english",
    blurb: "Život je stablo, a sve je u njemu redak. Traka je cijeli život, crtica " +
      "po godini. Redci ispod isti su taj život, otvoren: godina drži svoje mjesece, " +
      "mjesec dane, dan ono što si radio, radnja misli koje su joj prethodile.",
    run: "pokreni jedan život", again: "promijeni uvjete", running: "živi se…",
    moment: "jedan njegov trenutak",
    seed: "sjeme", roll: "baci",
    hint: "Jedan njegov trenutak uzima jednu od dvadesetak milijuna stvarno " +
      "proživljenih minuta i otvara put do nje, razinu po razinu, sve do onoga što " +
      "se u njoj mislilo. Svaka je godina tu i svaka se otvara, i one u kojima se " +
      "ništa nije dogodilo; ispod godine prikazuje se ono u čemu se nešto dogodilo, " +
      "ostalo se prebroji. Godina drži i šest brojeva koje je petlja čitala, a " +
      "računa ih wind_up() u world.py iz onoga što si dobio, onoga što ti je " +
      "učinjeno prije nego si mogao prigovoriti, i onoga što se u tom trenutku " +
      "događa — uz svaki piše redak iz live.py koji ga čita.",

    century: "stoljeće",
    centuryWhy: "Koliko se toga događa što nije o tebi. Vlade, granice, novac, vrijeme, " +
      "rat. Ponešto od toga te može ubiti.",
    centurySet: ["tiho", "obično", "burno", "katastrofalno"],
    conscience: "savjest",
    conscienceWhy: "Koliko ti je često popis onoga što si namjeravao uopće vidljiv. Na " +
      "obično, otprilike osam trenutaka u životu.",
    conscienceSet: ["rijetko", "obično", "često", "stalno"],
    temptation: "napast",
    temptationWhy: "Koliko često stvari za koje znaš da ih ne bi trebao imaju duljinu " +
      "veću od nule.",
    temptationSet: ["rijetko", "obično", "često", "stalno"],
    sleep: "san",
    sleepWhy: "Koliko lako zaspiš kad već ležiš. Ostatak noći potrošen je na misli.",
    sleepSet: ["loše", "obično", "lako"],
    seedWhy: "Isto sjeme i iste postavke daju točno isti život, svaki put.",

    aLife: "jedan život", years: "godina", account: "što je od toga ostalo",
    more: "… još %", mostly: "uglavnom",
    theDials: "što je petlja čitala", base: "temelj", readBy: "čita se u",
    asFar: "dalje ne smije",
    stillAwake: "još budan", asleep: "usnuo", attempts: "% pokušaja",

    less: "manje", moreOf: "više", tookUp: "prihvatio se —", noMore: "više ne —",
    thinkingOf: "uglavnom o —",
    carried: "od čega je živio, na kraju",
    healthLeft: "zdravlja s kojim je počeo", moneyLeft: "od onoga što se može imati",
    yearsInJob: "godina na istom poslu", worked: "radio", noJob: "ne radi",
    elsewhere: "budnih minuta s mislima negdje drugdje",
    measuredAt: "izmjereno 46,9% — Killingsworth i Gilbert, Science 2010.",
    ptAhead: "usmjereno naprijed", ptBehind: "usmjereno unatrag",
    ptNow: "na ovaj trenutak", ptAlways: "ni na što određeno",
    tonePlus: "ugodno", toneZero: "neutralno", toneMinus: "neugodno",
    whoAbout: "o kome se i o čemu radilo",
    goneAt: "otišao u", notSpeaking: "ne razgovarate", achesFrom: "otad nadalje",

    inOrder: "baze, tim redom",
    died: "umro u", inTheYearOf: "u godini u kojoj je bilo:",
    mornings: "jutara", thingsDone: "obavljenih stvari", thoughts: "misli",
    different: "različitih stvari za misliti", mostlyThat: "uglavnom",
    knewBetter: "stvari za koje je znao da ih ne treba raditi",
    gotRoundTo: "stvari kojih se dohvatio", nightsAwake: "noći budan u tri",
    questions: "pitanja ostalih bez odgovora",
    meaningTo: "još uvijek namjerava", nothingLeft: "na popisu nije ostalo ništa",
    leftTheList: "\"call your mother\" otišlo je s popisa i više se nije moglo vratiti",
    outside: "u međuvremenu, vani",
  },
};
