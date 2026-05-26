# Africké kopřivy

První statický prototyp evidence zákazníků a objednávek pro prodej odřezků koleusů.

## Spuštění

Otevři v prohlížeči soubor `index.html`, nebo spusť:

`Spustit.bat`

Appka nepotřebuje server ani instalaci. Data ukládá lokálně do prohlížeče přes `localStorage`.

## Co umí

- evidence zákazníků
- jedno pole pro `Jméno a příjmení` při ručním zadávání
- volitelné `FB jméno` zvlášť od skutečného jména
- adresa rozdělená na `Ulice`, `PSČ`, `Město` a `Země`
- evidence objednávek
- jednoduchý úvodní přehled: jen hlavní čísla a úkoly, zbytek je schovaný pod `Další přehledy`
- čísla v úvodním přehledu fungují jako rychlé filtry; `Pozor` ukáže konkrétní zákazníky
- zjednodušený objednávkový formulář: základ je hned vidět, předání a poznámka jsou rozbalitelné
- sezóny u objednávek a filtr podle sezóny
- samostatný filtr objednávek podle odrůdy
- volný text pro odrůdy v objednávce
- výběr odrůdy z ceníku přímo v objednávce, aby se cena našla přesněji
- samostatný seznam odrůd s náhledovou fotkou a jednoduchou galerií
- lokální složka fotek pro odrůdy: nové fotky se ukládají do podsložek podle názvu odrůdy
- detail odrůdy má velký prohlížeč fotek, fullscreen a stažení fotky s názvem odrůdy
- prodejní cena u odrůdy v Kč/EUR a historie změn ceny
- týdenní/čtrnáctidenní nabídky s položkami, fotkami odřezků a rezervacemi zákazníků
- z uzavřené nabídky jde vytvořit objednávky podle rezervací
- živý výpočet ceny objednávky z naceněných odrůd s přepočtem Kč/EUR podle data objednávky
- ruční úprava ceny u konkrétní objednávky zůstane zachovaná
- řazení a filtrování odrůd podle žádanosti v objednávkách
- rozklik odrůdy ukáže, kdo ji koupil a v jakých objednávkách
- detail zákazníka ukáže koupené odrůdy a umožní proklik na detail odrůdy i související objednávky
- klikatelné objednávky a zákazníci přímo z úvodního přehledu
- z detailu odrůdy jde rovnou založit objednávku s předvyplněnou odrůdou a cenou
- libovolná země
- štítky `pozor` a `VIP`; starší `neplatič` se sloučí do `pozor`
- interní hodnocení zákazníka typu `platí pozdě`, `pomalá komunikace` nebo `neposílat bez platby`
- barevné stavy objednávky: `Nová`, `Připraveno`, `Odesláno`, `Zaplaceno`
- platební přehled v úvodním dashboardu
- nastavení poštovného, balného a dobírky
- hromadné označení objednávek jako zaplacené nebo odeslané
- detail zákazníka s historií objednávek, upozorněními, rychlou poznámkou a šablonami zpráv
- čištění chyb typu `[object Object]` a dopočítání země z kontaktu/adresy, když to jde
- konzervativní slučování duplicitních zákazníků podle emailu, telefonu nebo jména s adresou
- jednoduché předání u objednávky: `Odeslat` nebo `Osobní odběr`
- přepínač měny objednávky `Kč` / `EUR` s automatickým přepočtem podle kurzu ČNB k datu objednávky
- automatické dočtení kurzu k datu objednávky a malé tlačítko pro ruční dočtení kurzu u objednávky
- vyhledávání a filtrování

## Doprava

Packeta API, sledovací čísla a výdejní místa jsou zatím vynechané. V objednávce se řeší jen to, jestli se má objednávka odeslat, nebo je to osobní odběr.

## Předvyplněná data

Soubor `seed-data.js` je vygenerovaný z `C:\Users\PC\Desktop\adresy.xlsx`.
Původních 219 zákaznických řádků je vyčištěných a sloučených na 155 zákazníků. Objednávkových záznamů je 112 a seznam odrůd má 316 položek vytažených z textů objednávek.

Čištění bere email a telefon i z nesprávných polí, například když je telefon nalepený před emailem. Duplicitní zákazníci se slučují podle emailu, telefonu a přesnější shody jména.
Technické texty z původních buněk a informace o slučování nejsou ukládané do poznámek.

## Fotky

V sekci `Nástroje` vyber složku fotek. Když potom v odrůdě přidáš fotky z počítače, originály se uloží do:

`odrudy\Název odrůdy\`

Když složka vybraná není, fotky zůstanou uložené jen v datech appky jako dřív.

## Předání

Kamarádce se pošle celá složka `africke-koprivy`. Spustí `Spustit.bat` nebo otevře `index.html`.
Před přesunem na jiný počítač je dobré v `Nástroje` stáhnout zálohu dat. Vybranou složku fotek je potřeba poslat spolu s appkou, pokud už v ní jsou uložené originální fotky.
