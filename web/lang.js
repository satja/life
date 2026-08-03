// Only the commentary is translated. Everything the program says — the names
// in it, and the values it produces — stays in the language it was written
// in, which is Python.

const UI = {
  en: {
    lang: "hrvatski",
    blurb: "A life is a column of colour, a band to a year, and the colour is " +
      "what happened in it. Open one and it says what it was, and holds its " +
      "twelve months; open a month and it holds its days, again as colour; open " +
      "a day and it holds the things you did, and a thing holds the thoughts you " +
      "had on the way to it.",
    run: "run one life", again: "change the conditions", running: "living it…",
    moment: "a moment of it",
    seed: "seed", roll: "roll",
    hint: "Whether a thing is a colour or a sentence is decided by how many of " +
      "them there are: few enough to read and they are read, too many and they " +
      "are a colour you can open. So a life is seventy colours and a month is " +
      "thirty, while a year's months, a day's things and a thing's thoughts are " +
      "said in full. A moment of it takes one of the twenty million or so minutes " +
      "that were actually lived and opens the way down to it, a level at a time, " +
      "ending on whatever was being thought. A year also holds the six numbers " +
      "the loop was reading " +
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
    months: "months", days: "days", doing: "doing", thinking: "thinking",
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
    blurb: "Život je stupac boje, traka po godini, a boja je ono što se u njoj " +
      "dogodilo. Otvoriš jednu i kaže što je bila, i drži svojih dvanaest " +
      "mjeseci; otvoriš mjesec i drži svoje dane, opet kao boju; otvoriš dan i " +
      "drži ono što si radio, a radnja drži misli koje su joj prethodile.",
    run: "pokreni jedan život", again: "promijeni uvjete", running: "živi se…",
    moment: "jedan njegov trenutak",
    seed: "sjeme", roll: "baci",
    hint: "Je li nešto boja ili rečenica, odlučuje koliko ih ima: ako ih je malo " +
      "da se pročitaju, čitaju se; ako ih je previše, boja su koju možeš otvoriti. " +
      "Tako je život sedamdeset boja, a mjesec trideset, dok su mjeseci u godini, " +
      "radnje u danu i misli uz radnju izrečene u cijelosti. Jedan njegov trenutak " +
      "uzima jednu od dvadesetak milijuna stvarno proživljenih minuta i otvara put " +
      "do nje, razinu po razinu, sve do onoga što se u njoj mislilo. Godina drži i " +
      "šest brojeva koje je petlja čitala, a " +
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
    months: "mjeseci", days: "dana", doing: "radnje", thinking: "misli",
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
