/* Dialogové stromy. Uzel: by (kdo mluví), text (řádek nebo pole řádků),
   do (akce), next (další uzel) nebo choices (volby). */
(function () {
  const TP = (window.TP = window.TP || {});
  TP.data = TP.data || {};

  TP.data.dialogues = {

    uvod: {
      start: 'a',
      nodes: {
        a: { by: 'cooper', text: [
          'Diane, sedm hodin a dvanáct minut. Double R Diner. Káva je horká, koláč čerstvý a svět zatím drží pohromadě.',
          'Vracím se od šerifa a… Diane, tohle není můj diktafon.',
        ], next: 'b' },
        b: { by: 'natalie', text: 'Vypadá stejně. Stejný model, stejný škrábanec na boku.', next: 'c' },
        c: { by: 'cooper', text: 'Přesně tak. Stejný — a přesto cizí. To je v tomhle městě nejnebezpečnější kombinace.', next: 'd' },
        d: { by: 'cooper', text: 'A hraje jen šum. Někdo si odnesl moji kazetu a nechal mi místo ní ticho.', next: 'e' },
        e: { by: 'natalie', text: 'Na spodku má štítek. Tři sta patnáct. To je pokoj v Great Northern.', next: 'f' },
        f: { by: 'cooper', text: [
          'Natálie, nejde jen o vyměněnou kazetu. Když se v Twin Peaks stane něco malého, je to vždycky dveře k něčemu velkému.',
        ], next: 'g' },
        g: { choices: [
          { text: '„Co mám udělat?“', to: 'h' },
          { text: '„Proč já? Jsem tu první den.“', to: 'i' },
          { text: '„A co když se spletete?“', to: 'j' },
        ] },
        h: { by: 'cooper', text: 'Zjistěte, kdo tu dnes ráno seděl. Pak jděte tam, kam vás to pošle. A nikam jinam se nedívejte — dívejte se přesně tam.', next: 'k' },
        i: { by: 'cooper', text: 'Protože si všímáte. Toho štítku jste si všimla vy, a já se na diktafony dívám profesionálně.', next: 'h' },
        j: { by: 'cooper', text: 'Pak se spletu nahlas a před svědkem. To je jediný způsob, jak se mýlit správně.', next: 'h' },
        k: { by: 'cooper', text: 'Musím na výslech. S vámi to zvládnu.', do: [{ flag: 'intro' }], next: 'l' },
        l: { by: 'natalie', text: 'Dobře. Začnu tím, co mám na dosah.', end: true },
      },
    },

    cooper_diner: {
      start: 'a',
      nodes: {
        a: { by: 'cooper', text: 'Ještě pořád tady? Kazeta cestuje, Natálie. Kazety mají nohy.', end: true },
      },
    },

    norma: {
      start: 'a',
      nodes: {
        a: { by: 'norma', text: 'Jak ti to jde, zlato?', next: 'b' },
        b: { choices: [
          { text: '„Kdo tu dnes ráno seděl u pultu?“', to: 'hoste' },
          { text: '„Můžu si půjčit tvůj zápisník?“', to: 'zapisnik' },
          { text: '„Co mám dělat?“', to: 'ukol' },
          { text: '„Nic. Jen se koukám.“', to: 'konec' },
        ] },
        hoste: { by: 'norma', text: [
          'Ráno? Řidič, paní s kloboukem, pán s novinami. A jeden pán v drahém kabátě, co si dal dva koláče.',
          'Platil kanadskými dolary a tvářil se u toho, jako bych mu měla poděkovat.',
        ], do: [{ flag: 'jerryZmineny' }], next: 'b' },
        zapisnik: { by: 'norma', text: 'Zápisník leží na pultu. Ale vrať ho — v něm je celé tohle město seřazené podle objednávek.', next: 'b' },
        ukol: { by: 'norma', text: 'Nalij kávu všem třem u pultu. Do tří čtvrtin. Kdo nalije až po okraj, tomu nevěřím.', next: 'b' },
        konec: { by: 'norma', text: 'Jen se koukej. Tady se většina práce udělá koukáním.', end: true },
      },
    },

    ben: {
      start: 'a',
      nodes: {
        a: { by: 'ben', text: 'Slečno! Great Northern vítá hosty, dodavatele a dámy se zástěrou. Co pro vás můžu udělat?', next: 'b' },
        b: { choices: [
          { text: '„Potřebuju se podívat do pokoje 315.“', to: 'ne' },
          { text: '„Váš bratr Jerry byl dnes ráno v Double R.“', to: 'jerry', if: 'jerryZmineny' },
          { text: '„Slyšela jsem, že obchodujete s Kanadou.“', to: 'kanada' },
          { text: '„Nic, děkuju.“', to: 'konec' },
        ] },
        ne: { by: 'ben', text: 'Pokoje svých hostů nedávám ani šerifovi. Zvlášť ne šerifovi. Zvlášť ne dnes.', next: 'b' },
        jerry: { by: 'ben', text: [
          'Jerry? Jerry je v Kanadě. Jerry je vždycky v Kanadě, i když stojí vedle mě.',
          'Ale to vy nechcete slyšet. Vy chcete slyšet o trhu.',
        ], next: 'b' },
        kanada: { by: 'ben', text: [
          'Kanada, slečno! Kdybyste věděla, co to je za trh! Dřevo, ryby, pozemky a lidé, kteří se na všechno usmívají.',
          'Sedněte si. Řeknu vám o tom všechno. Začneme rokem, kdy jsem tam jel poprvé, a skončíme dnešním ránem.',
        ], do: [{ flag: 'benRozpovidan' }], next: 'kanada2' },
        kanada2: { by: 'ben', text: [
          'Představte si les, který nikdo nepočítá. Představte si dolar, který vypadá jako dolar, ale chová se jinak…',
        ], next: 'kanada3' },
        kanada3: { by: 'natalie', text: 'Ben se otočil k oknu a mluví do skla. Na tabuli s klíči se nedívá už půl minuty.', end: true },
        konec: { by: 'ben', text: 'Kdybyste si to rozmyslela, jsem tady. Vždycky jsem tady.', end: true },
      },
    },

    pokojska: {
      start: 'a',
      nodes: {
        a: { by: 'pokojska', text: [
          'Třináctka chce ručníky, patnáctka nechce nic a ve třistapatnáctce se od včerejška nesvítí.',
        ], next: 'b' },
        b: { choices: [
          { text: '„Kdo bydlí ve 315?“', to: 'kdo' },
          { text: '„Můžu vám pomoct?“', to: 'pomoc' },
          { text: '„Nic, jdu dál.“', to: 'konec' },
        ] },
        kdo: { by: 'pokojska', text: 'Pán v drahém kabátě. Je tam zapsaný týden a spal tam jednu noc. Ostatní noci má postel ustlanou jako v katalogu.', next: 'b' },
        pomoc: { by: 'pokojska', text: 'Pomoct? Zlatíčko, tady si každý pomůže hlavně tím, že se netváří, že sem nepatří.', next: 'b' },
        konec: { by: 'pokojska', text: 'Jen běžte. A rukavice si vemte, jinak vám ruce budou páchnout po chlóru.', end: true },
      },
    },

    lucy: {
      start: 'a',
      nodes: {
        a: { by: ['lucy', 'andy'], text: [
          'Je lososová! Kupovala jsem ji já a na štítku bylo napsáno LOSOSOVÁ.',
          'Ale ve světle od okna, Lucy, ve světle od okna je broskvová. Já to vidím. Já to prostě vidím.',
        ], next: 'b' },
        b: { choices: [
          { text: '„Lucy, ta barva je jednoznačně lososová.“', to: 'lososova', once: 'lososova' },
          { text: '„Je to jenom kabelka.“', to: 'spatne', once: 'spatne' },
          { text: '„Potřebovala bych soupravu na otisky.“', to: 'souprava_hadka',
            if: { all: [{ not: 'lucyUklidnena' }, { not: 'soupravaPujcena' }] } },
          { text: '„Potřebovala bych soupravu na otisky.“', to: 'souprava_andy',
            if: { all: ['lucyUklidnena', { not: 'andyUklidnen' }, { not: 'soupravaPujcena' }] } },
          { text: '„Potřebovala bych soupravu na otisky.“', to: 'souprava_ano',
            if: { all: ['lucyUklidnena', 'andyUklidnen', { not: 'soupravaPujcena' }] } },
          { text: '„Soupravu vrátím čistou, slibuju.“', to: 'souprava_mam', if: 'soupravaPujcena' },
          { text: '„Co víte o Jerrym Horneovi?“', to: 'jerry', if: 'jerryZmineny' },
          { text: '„Nic, děkuju.“', to: 'konec' },
        ] },
        lososova: { by: 'lucy', text: [
          'Děkuju. Konečně někdo, kdo má oči.',
          'Andy má jinak oči taky hezké, ale vidí jimi jenom to, co chce.',
        ], do: [{ flag: 'lucyUklidnena' }], next: 'b' },
        spatne: { by: 'lucy', text: 'Jenom kabelka. Jenom. Kabelka.', next: 'spatne2' },
        spatne2: { by: 'natalie', text: 'To nebylo dobré. Lucy má teď v očích něco, co bych v dokumentaci nazvala „pozdější problém“.', next: 'b' },
        jerry: { by: 'lucy', text: [
          'Jerry Horne? Ten sem chodí dvakrát do roka a pokaždé se ptá, jestli se změnily zákony.',
          'A pokaždé mu řeknu, že zákony ne, ale formuláře ano.',
        ], next: 'b' },
        souprava_hadka: { by: 'lucy', text: [
          'Otisky? Teď? Andy pláče u kopírky a vy chcete otisky.',
          'Nejdřív někdo musí rozhodnout, jakou barvu má ta kabelka. Pak se tady zase začne pracovat.',
        ], next: 'b' },
        souprava_andy: { by: 'lucy', text: [
          'Souprava je ve skříňce a klíč mám já.',
          'Ale Andy takhle brečet nemůže, to pak celá stanice vypadá, jako by se něco stalo. Udělejte s ním něco. Prosím.',
        ], next: 'b' },
        souprava_ano: { by: 'lucy', text: [
          'Tak dobře. Lososová je lososová a Andy se usmívá. To je na jedno dopoledne hodně.',
          'Tady je souprava. Štěteček, fólie a karta se vzorky z kartotéky. Prášek si musíte sehnat sama — ten nám došel.',
        ], do: [{ get: 'souprava' }, { flag: 'soupravaPujcena' }], next: 'souprava_rada' },
        souprava_rada: { by: 'lucy', text: 'Na otisk stačí cokoli jemného a sypkého. V Double R toho mají plný pult.', next: 'b' },
        souprava_mam: { by: 'lucy', text: 'To doufám. Minule ji vrátil Andy a byla v ní svačina.', next: 'b' },
        konec: { by: 'lucy', text: 'Mějte se. A kdyby vám někdo tvrdil, že je to broskvová, nevěřte mu.', end: true },
      },
    },

    andy: {
      start: 'a',
      nodes: {
        a: { by: 'andy', text: [
          'Já netvrdím, že Lucy nemá pravdu. Já jenom říkám, že to světlo… to světlo lže.',
        ], next: 'b' },
        b: { choices: [
          { text: '„Andy, jste v pořádku?“', to: 'brek' },
          { text: '„Viděl jste dnes ráno Jerryho Hornea?“', to: 'jerry', if: 'jerryZmineny' },
          { text: '„Zatím nashledanou.“', to: 'konec' },
        ] },
        brek: { by: 'andy', text: [
          'Jsem. Úplně. Jenom mám… něco v oku. Obě oči. Celý obličej.',
        ], next: 'b' },
        jerry: { by: 'andy', text: 'Viděl jsem ho jet k lesu. Mával mi. Já mu mával taky, protože to se dělá.', next: 'b' },
        konec: { by: 'andy', text: 'Nashledanou. A opatrně u lesa, tam je vlhko a člověk tam snadno dostane rýmu. Nebo něco jiného.', end: true },
      },
    },

    hawk: {
      start: 'a',
      nodes: {
        a: { by: 'hawk', text: 'Slyšel jsem, že máte v kapse cizí hlas.', next: 'b' },
        b: { choices: [
          { text: '„Mám shodu otisků. Jerry Horne.“', to: 'mapa', if: 'otiskyShoda' },
          { text: '„Hledám někoho, kdo vzal Cooperovi kazetu.“', to: 'hledam' },
          { text: '„Co je Ghostwood?“', to: 'ghostwood' },
          { text: '„Zatím děkuju.“', to: 'konec' },
        ] },
        hledam: { by: 'hawk', text: [
          'Pak potřebujete důkaz, ne dojem. Dojem vám v lese nepomůže — les má vlastní dojmy.',
        ], next: 'b' },
        ghostwood: { by: 'hawk', text: 'Les. Starší než město a trpělivější. Lidé tam chodí, když chtějí něco slyšet a bojí se, že by to doma slyšel někdo další.', next: 'b' },
        mapa: { by: 'hawk', text: [
          'Otisk je jméno, které se nedá odvolat. Dobrá práce.',
          'Tady je mapa. Křížek je u starého pařezu na kraji Ghostwoodu — tam Jerry sedává.',
        ], do: [{ get: 'mapa' }, { flag: 'mapaZiskana' }], next: 'mapa2' },
        mapa2: { by: 'hawk', text: 'A pod křížek jsem vám napsal jednu větu. Nejdřív navštivte Log Lady.', next: 'mapa3' },
        mapa3: { choices: [
          { text: '„Proč nejdřív Log Lady?“', to: 'proc' },
          { text: '„Dobře. Díky, Hawku.“', to: 'konec' },
        ] },
        proc: { by: 'hawk', text: 'Protože les vás pustí dovnitř vždycky. Otázka je, jestli víte, kam v něm jít. To polínko ví.', next: 'mapa3' },
        konec: { by: 'hawk', text: 'Jděte. A dívejte se pod nohy i nad sebe.', end: true },
      },
    },

    lyra: {
      start: 'a',
      nodes: {
        a: { by: 'natalie', text: 'Pohladím ji. Opře se mi o nohu celou vahou, jako by mě chtěla někam posunout.', next: 'b' },
        b: { by: 'lucy', text: [
          'To je Lyra. Je to nejlepší zaměstnanec téhle stanice a nikdy nechodí pozdě.',
        ], do: [{ sfx: 'dog' }], next: 'c' },
        c: { by: 'natalie', text: 'Lyra se na mě podívá a pak na dveře. Dvakrát. Jako by mi dávala rozvrh.', end: true },
      },
    },

    loglady: {
      start: 'a',
      nodes: {
        a: { by: 'logLady', text: 'Polínko dnes ráno mlčelo. Mlčení je taky informace.', next: 'b' },
        b: { choices: [
          { text: '„Potřebuju vědět, kde v lese sedává Jerry Horne.“', to: 'hadanka' },
          { text: '„Co říká polínko o té kazetě?“', to: 'kazeta' },
          { text: '„Co mám před polínko položit?“', to: 'hadanka' },
          { text: '„Nic. Promiňte za vyrušení.“', to: 'konec' },
        ] },
        kazeta: { by: 'logLady', text: [
          'Na kazetě je hlas, který mluví do noci. Noc mu odpověděla a on si to zapsal.',
          'Až to pustíte obráceně, uslyšíte odpověď. Ne otázku.',
        ], next: 'b' },
        hadanka: { by: 'logLady', text: [
          'Polínko promluví, když bude přítomno něco zanechaného, něco odebraného a něco darovaného.',
          'Položte to sem. Polínko pozná rozdíl, i když vy ne.',
        ], do: [{ flag: 'hadankaZnama' }], next: 'b' },
        konec: { by: 'logLady', text: 'Jděte. Ale vraťte se, než se setmí. Po setmění mluví polínko o jiných věcech.', end: true },
      },
    },

    polinko_mluvi: {
      start: 'a',
      nodes: {
        a: { by: 'logLady', text: [
          'Tři věci jsou na místě. Poslouchejte.',
        ], do: [{ sfx: 'sting' }], next: 'b' },
        b: { by: 'logLady', text: [
          'Polínko říká: na východ od cesty stojí pařez, který byl kdysi nejvyšší strom.',
          'Sedí na něm muž v drahém kabátě a poslouchá něco, čemu nerozumí. Pouští to pořád dokola.',
        ], next: 'c' },
        c: { by: 'logLady', text: 'A polínko dodává: ten muž není zlý. Je jenom vyděšený. To je většinou horší.', do: [{ flag: 'polinkoPromluvilo' }], next: 'd' },
        d: { by: 'natalie', text: 'Ghostwood. Teď už vím, kam v tom lese jít.', end: true },
      },
    },

    jerry: {
      start: 'a',
      nodes: {
        a: { by: 'jerry', text: [
          'Jestli jdete pro podpis, tak nepodepisuju. Jestli jdete pro kabát, tak ho nedám.',
        ], next: 'b' },
        b: { choices: [
          { text: '„Vzal jste agentu Cooperovi diktafon.“', to: 'popira' },
          { text: '„Máme váš otisk na pásce z pokoje 315.“', to: 'priznani', if: 'otiskyShoda' },
          { text: '„Platil jste v Double R kanadskými dolary.“', to: 'kanada', if: 'jerryZmineny' },
          { text: '(zatím nic neříct)', to: 'konec' },
        ] },
        popira: { by: 'jerry', text: [
          'Diktafon? Já mám diktafonů doma šest. Proč bych bral cizí?',
          'Tenhle je… tenhle je půjčený. Od kamaráda. Který neexistuje.',
        ], next: 'b' },
        kanada: { by: 'jerry', text: 'Kanadskými? To dělám z hrdosti. A protože jsem zapomněl vyměnit peníze. Obojí je pravda.', next: 'b' },
        priznani: { by: 'jerry', text: [
          'Dobře. Dobře!',
          'Myslel jsem, že si tam nahrál něco o našich rodinných obchodech. O Bennym, o mně, o věcech, co se nezapisují.',
          'Tak jsem vyměnil kazety. Vyměnil jsem i ten stroj, aby si toho nevšiml. A pak jsem si to pustil.',
        ], do: [{ flag: 'jerryPriznal' }], next: 'priznani2' },
        priznani2: { by: 'jerry', text: [
          'A víte, co tam je? Šum. Jenom šum. Poslouchám to od rána a nic z toho nedává smysl.',
        ], next: 'priznani3' },
        priznani3: { by: 'natalie', text: 'Já vím, co s tím. Ten hlas se musí pustit obráceně.', end: true },
        konec: { by: 'jerry', text: 'Tak si sedněte. Nebo nesedejte. Já tady stejně sedím za oba.', end: true },
      },
    },

    finale: {
      start: 'a',
      nodes: {
        a: { by: 'natalie', text: 'Páska se rozjede pozpátku. Les ztichne tak náhle, až to zabolí v uších.', next: 'b' },
        b: { by: 'cooper', text: [
          'Diane, dnes v noci se mi zdál sen.',
          'V tom snu mi pomáhala mladá žena, kterou jsem nikdy neviděl.',
        ], next: 'c' },
        c: { by: 'cooper', text: [
          'Tmavé vlasy. Zelené oči. Zástěra z podniku, kde dělají višňový koláč.',
          'Přišla do města dnes ráno. Ještě o tom neví, ale bude u toho, až se to celé otevře.',
        ], next: 'd' },
        d: { by: 'jerry', text: 'To… to jste vy.', next: 'e' },
        e: { by: 'natalie', text: 'Ta nahrávka je z včerejší noci. Já jsem přijela dneska v šest ráno.', next: 'f' },
        f: { by: 'cooper', text: 'Diane, dodávám: až ji potkám, poděkuju jí. A objednám dvě kávy.', next: 'g' },
        g: { by: 'jerry', text: [
          'Vezměte si to. Prosím. Já to nechci mít ani v kabátě.',
        ], do: [{ flag: 'kazetaZiskana' }, { music: 'woods' }], next: 'h' },
        h: { by: 'natalie', text: 'Vracím se do Double R. Někdo tam na mě čeká s kávou a ještě o tom neví.', end: true },
      },
    },

    epilog: {
      start: 'a',
      nodes: {
        a: { by: 'cooper', text: 'Natálie. Sedněte si. Tohle je vaše židle, dokud nedopijeme.', next: 'b' },
        b: { by: 'natalie', text: 'Kazeta je zpátky. Jerry ji vydal sám. A na té nahrávce…', next: 'c' },
        c: { by: 'cooper', text: [
          'Já vím, co je na té nahrávce. Nahrál jsem to já.',
          'Zajímavé je, že jsem to nahrál dřív, než jste přišla do města.',
        ], next: 'd' },
        d: { choices: [
          { text: '„Jak je to možné?“', to: 'sen' },
          { text: '„A co to znamená?“', to: 'vyznam' },
          { text: '(mlčet a napít se kávy)', to: 'ticho' },
        ] },
        sen: { by: 'cooper', text: 'Sny nevysvětluju, Natálie. Vysvětlený sen přestane pracovat.', next: 'd2' },
        vyznam: { by: 'cooper', text: 'Znamená to, že jste byla v téhle věci dřív než ona ve vás. To se stává. Tady častěji.', next: 'd2' },
        ticho: { by: 'cooper', text: 'Výborná odpověď. Nejlepší ze všech, které jsem dnes slyšel.', next: 'd2' },
        d2: { by: 'cooper', text: [
          'Dnes jsem se přesvědčil, že nejlepší vyšetřovatelé nenosí odznak. Nosí zástěru a nikdy nezapomenou dolít kávu.',
        ], next: 'e' },
        e: { by: 'norma', text: 'Koláč je na podniku. Oba dva.', next: 'f' },
        f: { by: 'cooper', text: 'Tohle je opravdu skvělá káva.', do: [{ flag: 'dohrano' }], next: 'g' },
        g: { by: 'natalie', text: 'Venku se zvedá mlha a v lese je o jedno tajemství míň. Zítra v šest.', do: [{ credits: true }], end: true },
      },
    },
  };
})();
