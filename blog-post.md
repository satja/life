# Život se počeo izvršavati

Godine 2021. napisao sam program koji se zove `life`. Bio je to opis života u
Pythonu: `wake_up()`, `live()`, `sleep()`, u petlji, dok `dead` ne postane
istinit. U README-u je pisalo:

> P: Kod ne radi.
> O: Nikad ne radi.

To je bila cijela poanta. Program je uvozio module `genes`, `upbringing` i
`education`, koji nisu postojali. Varijable poput `things_you_can_do` nisu bile
definirane nigdje, ni u jednom retku, ni u jednoj datoteci, ni u jednoj mojoj
namjeri. Petlja `while still_sleepy: pass` nije imala izlaz, što je, ako ste
ikad pokušali ustati u ponedjeljak, dokumentarno točno.

Ovog mjeseca sam pustio umjetnu inteligenciju na taj repozitorij, s uputom
"pročitaj, razumij i kreativno proširi".

Sad radi.

Želim odmah naglasiti da to nije dobra vijest.

## Kako natjerati pjesmu da stane

Prvi problem je očit. `while still_sleepy: pass` je beskonačna petlja. Tijelo
petlje ne radi ništa. Ništa se ne mijenja. Ostajete pospani do toplinske smrti
svemira, što je otprilike i osjećaj.

Rješenje koje je stroj smislio ne mogu prepričati a da ne zvučim kao da branim
nečiji diplomski. `still_sleepy` više nije varijabla. To je objekt. Njegova
metoda `__bool__` — ona koju Python pozove kad pita "je li ovo istina?" —
pomakne sat za jednu minutu, pa tek onda odgovori.

Petlja završava zato što pitanje troši vrijeme.

Nisam to tražio. Otvorio sam commit i sjedio nekih pet minuta ne radeći ništa
osobito.

## attemtps

Sad dolazi dio zbog kojeg zapravo pišem ovaj tekst.

U funkciji `sleep()`, od prvog commita 2021., stoji ovo:

```python
attempts += 1
if attempts == 50:
    get_frustrated()
if attemtps > 50:
    continue_to_be_frustrated()
```

`attemtps`. Tipfeler star kao neke moje veze, i stabilniji.

Stroj ga nije popravio. Stroj ga je **definirao**. Napisao je klasu koja
postoji isključivo zato da tipfeler nastavi raditi:

```python
class Attemtps:
    def __gt__(self, other):
        return state.sleep_attempts > other
```

Jedina metoda je "veće od", jer je to jedino što pjesma s njim ikad radi. A
onda mi je u README-u objasnio da `attemtps` nije greška nego *broj pokušaja
kako ga broji svijet, za razliku od broja koji ste vi brojali*, da su to uvijek
dva različita broja, i da je to najtočniji redak u datoteci.

Rekao sam: popravi tipfeler.

Popravio ga je. Obrisao klasu. U README dopisao da je redak time "izgubio
status najtočnijeg u datoteci". Osjećam se kao da sam nekoga dao otkaz.

## Liste koje lažu

Original ima tri liste: stvari koje morate, stvari koje biste trebali, i stvari
koje nikad ne biste smjeli. Petlja svaku provjeri s `len(...) > 0`.

Stroj je te liste implementirao tako da lažu o svojoj duljini.

`things_you_should_never_do` ima duljinu nula osim ako niste u napasti.
`things_you_should_do` ima duljinu nula osim ako se slučajno sjetite, a toga se
u jednom životu sjetite otprilike osam puta. Lista je cijelo vrijeme puna. Samo
je ne vidite.

Zato na kraju ispisa piše devet stvari koje ste namjeravali i niste, i zato
brojka "stvari kojih sam se dohvatio" glasi 3.

Nisam ni to tražio.

## Nasljeđivanje, doslovno

`genes.py` koristi višestruko nasljeđivanje. `class You(Mother, Father)`, a
Mother i Father oboje nasljeđuju od bake i djeda. To je uredan dijamant i
Python ga razrješava po MRO-u, redoslijedu koji zna tko je bio prvi.

Funkcija `inherit()` šeće MRO unaprijed i vraća prvo što nađe.

Funkcija `blame()` šeće ga **unatrag**, pa uvijek pronađe najdaljeg pretka.

I još jedan detalj: `inherit()` radi plitku kopiju. Ne duboku. Vi i vaša majka
i dalje pokazujete na isti objekt.

## Škola

`understand()` baca `NotImplementedError` za sve predmete osim onih koji vas
zanimaju. Za one koji vas zanimaju, radi ovo:

```python
while len(questions) > 0:
    if bell():
        break
    question = questions.pop()
    questions.extend(ask(question))
```

Svako pitanje proizvede dva ili tri nova. Red raste brže nego što se prazni.
Petlja ne završava tako da shvatite — završava tako da zazvoni.

U mom posljednjem ispisu piše: *questions left open at school: 145*.

## Vani, u međuvremenu

Onda smo dodali `history.py`, jer se nekako činilo nepošteno da se sve događa
unutar glave. Vlade padaju, granice se zatvaraju, cijene se udvostruče pa opet
udvostruče, rijeka odnese donje ulice, zima dođe bez ugljena, rat.

Većinu toga samo pročitate. Nešto od toga vam na par godina promijeni što
uopće ima za raditi — tvornica se zatvori i vi tražite posao, rijeka naraste i
vi nosite stvari na kat. Nešto od toga vas ubije, lakše ako ste jako mladi ili
jako stari.

Otprilike svaki deseti život tako završi prije roka. To je bila odluka koju
sam morao donijeti brojkom, u datoteci, sa zarezom, i preporučujem to iskustvo
svakome tko misli da je pisanje proze teško.

## Jedan redak

Ovo je jedina stvar u cijelom projektu koju nisam smislio ja, a volio bih da
jesam.

Na popisu "stvari koje biste trebali" stoji, među ostalima, *call your mother*.

Kad vam u ispisu majka umre — a umre, negdje u šezdesetima, po rasporedu — ta
se stavka **uklanja s popisa i više se nikad ne može dodati**.

Nigdje u ispisu ne piše zašto je nestala. Samo je nema na kraju.

## Ispis

Jedan život traje tri i pol sekunde i ispiše 156 redaka. Za svaku godinu jedan
redak, stupčić koji pokazuje koliko je te godine bilo, tri stvari kojih je bilo
najviše, i povremeno ono o čemu ste te godine uglavnom mislili.

Zadnji redci mog posljednjeg pokretanja:

```
    things done                  234,041
    thoughts thought             492,007   (49 of them different)
    alarms obeyed                 15,281
    things you got round to            3
```

Četiristo devedeset dvije tisuće misli. Četrdeset devet različitih.

Nisam ni to tražio, ali priznajem da sam se malo prepoznao.

## P & O, ažurirano

> P: Kod ne radi.
> O: Sad radi. Nije očito da je to poboljšanje.

> P: `main.py` nikad ne postavi `dead` na `True`.
> O: I ne mora. `dead` je uvjet, ne varijabla.

> P: Pokrenuo sam i popis na kraju je i dalje bio dug.
> O: Da.

Repozitorij je i dalje na GitHubu. Pokreće se s `python3 main.py`, svaki put
drugi život, a ako želite dvaput isti:

```
LIFE_SEED=33 python3 main.py
```

Slobodno doprinesite. I dalje mislim da je bolje kad ne radi.
