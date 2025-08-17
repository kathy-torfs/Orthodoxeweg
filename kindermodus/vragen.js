const vragen = [
  // Moeilijkheid 1 (Level 1)
  {
    difficulty: 1,
    q: "Wat doe je als je 's morgens wakker wordt?",
    a: ["Een kort gebedje bidden", "Zonder God te groeten uit bed springen", "Eerst op je gsm kijken", "Snel verder slapen"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat betekent het kruisteken?",
    a: ["Je begint en eindigt er je gebed mee", "Een magisch gebaar", "Een groet voor vrienden", "Een teken dat je klaar bent"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat betekent 'Amen'?",
    a: ["Ik geloof het / zo is het", "Einde van het verhaal", "Klaar en gedaan", "Een geheim woord"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat doe je op zondag als je kan?",
    a: ["Naar de kerk gaan", "Uitslapen", "Televisie kijken", "Buiten spelen zonder kerk"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat is bidden?",
    a: ["Praten met God", "Alleen iets vragen als je iets wil", "Zingen zonder aandacht", "Stilzitten zonder woorden"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat doe je als iemand honger heeft?",
    a: ["Je deelt je eten", "Je doet alsof je het niet ziet", "Je neemt het eten zelf", "Je lacht ermee"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat past het meest bij Jezus?",
    a: ["Troosten en luisteren", "Zeggen dat het niet erg is en weglopen", "Doe alsof je niets ziet", "Anderen uitlachen"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat doe je als iemand een fout maakt?",
    a: ["Vergeven en opnieuw proberen", "Boos blijven", "Ermee lachen", "Het aan iedereen vertellen"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Je brak per ongeluk iets. Wat is juist?",
    a: ["Eerlijk zeggen wat er gebeurde", "Zwijgen zodat niemand het weet", "De schuld op iemand anders steken", "Weglopen"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat doe je als de juf een vraag stelt en je weet het niet zeker?",
    a: ["Eerlijk zijn en je best doen", "Afkijken bij de buur", "Doen alsof je ziek bent", "Roepen wat in je opkomt"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat doe je als mama hulp vraagt bij de tafel?",
    a: ["Je helpt meteen", "Je doet alsof je het niet hoorde", "Je zegt nee", "Je gaat weg"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Hoe toon je respect thuis?",
    a: ["Met dankjewel en alstublieft", "Door te roepen", "Door te zwijgen", "Door boos te worden"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Je kreeg twee koekjes en je vriend geen. Wat doe je?",
    a: ["Je deelt er één", "Je eet ze snel allebei op", "Je verstopt ze", "Je lacht ermee"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat doe je in de kerk?",
    a: ["Stil zijn en meebidden", "Rondlopen en praten", "Op je gsm spelen", "Luid zingen zonder aandacht"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat lees je in de Bijbel?",
    a: ["Gods Woord", "Grappige mopjes", "Verhalen over voetbal", "Kookrecepten"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat is vasten (simpel uitgelegd)?",
    a: ["Minder van iets nemen om meer bij God te zijn", "Niet eten om sneller te lopen", "Eten verstoppen", "Een dieet voor mooi te zijn"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat doet het doopsel?",
    a: ["Maakt je kind van God en lid van de Kerk", "Geeft je superkrachten", "Is gewoon water", "Is een feest zonder betekenis"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat is de communie?",
    a: ["Jezus die bij ons komt in de Eucharistie", "Gewoon brood", "Een feestmaal", "Een herinnering zonder Jezus"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat vieren we met Pasen?",
    a: ["De verrijzenis van Jezus", "De lente begint", "Een grote schoonmaak", "Het einde van school"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wie leerde ons het 'Onze Vader'?",
    a: ["Jezus", "Petrus", "Paulus", "Maria"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat betekent ‘naaste’?",
    a: ["Iedereen die God op je weg plaatst", "Alleen je beste vriend", "Familie enkel", "De buurman enkel"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat doe je met afval buiten?",
    a: ["In de vuilnisbak gooien", "Op straat gooien", "Verstoppen", "In de rivier gooien"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Hoe ga je om met dieren?",
    a: ["Zorgzaam en zacht", "Plagen voor de lol", "Negeren", "Opsluiten"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Je vriend is verdrietig. Wat doe je?",
    a: ["Troosten en luisteren", "Laten doen", "Uitlachen", "Niets zeggen"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat is beter?",
    a: ["Eerlijk en vriendelijk zijn", "Stoer doen en liegen", "Altijd zwijgen", "Iedereen pesten"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat doe je met je talenten?",
    a: ["Je gebruikt ze om goed te doen", "Alleen om beter te zijn dan anderen", "Je verstopt ze", "Je schept erover op"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Je hebt iemand pijn gedaan. Wat doe je?",
    a: ["Sorry zeggen en goedmaken", "Doen alsof er niets is", "Weglopen", "Ermee lachen"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat doe je voor het eten?",
    a: ["Een gebedje bidden", "Eten zonder iets te zeggen", "Opscheppen", "Ruzie maken"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat betekent 'Kerk'?",
    a: ["Het huis van God en zijn mensen", "Een groot gebouw", "Een school", "Een feestzaal"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat is de belangrijkste wet van Jezus?",
    a: ["Heb God lief en je naaste als jezelf", "Doe wat je wil", "Je mag enkel voor jezelf zorgen", "Denk nooit aan anderen"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat doe je voor je gaat slapen?",
    a: ["Een avondgebedje bidden", "Televisie kijken tot je slaapt", "Niets", "Boos in bed kruipen"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat zeg je als iemand je iets geeft?",
    a: ["Dankjewel", "Geef meer", "Niets", "Ik wil dit niet"],
    correct: 0
  },
  {
    difficulty: 1,
    q: "Wat betekent 'Orthodox'?",
    a: ["Juist geloven en juist eren", "Een speciale taal", "Een groep mensen", "Een oude gewoonte"],
    correct: 0
  }
];
// Moeilijkheid 2 (Level 2)
vragen.push(
  {
    difficulty: 2,
    q: "Wat vieren we met Kerstmis?",
    a: ["De geboorte van Jezus Christus", "Een feest van cadeaus", "De winter begint", "Een gezellig familiefeest zonder Jezus"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wat vieren we met Pinksteren?",
    a: ["De komst van de Heilige Geest", "De verrijzenis van Jezus", "De geboorte van Maria", "Het einde van de zomer"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wat betekent het woord 'Evangelie'?",
    a: ["Blijde Boodschap", "Oud verhaal", "Heilig Boek", "Gebed"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Hoeveel apostelen koos Jezus?",
    a: ["12", "7", "10", "40"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wie was de moeder van Jezus?",
    a: ["Maria", "Elisabet", "Anna", "Sara"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wie was de vader van Johannes de Doper?",
    a: ["Zacharias", "Jozef", "Petrus", "Jakobus"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wat zei Jezus op het kruis?",
    a: ["Vader, vergeef het hun", "Ik ben boos", "Ik geef het op", "Laat me met rust"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wat betekent 'Messias'?",
    a: ["Gezalfde", "Heilige plaats", "Boodschapper", "Gelovige"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wat is het grootste gebod?",
    a: ["God liefhebben en je naaste als jezelf", "Altijd bidden", "Veel weten", "Veel vasten"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Welke apostel verloochende Jezus drie keer?",
    a: ["Petrus", "Johannes", "Thomas", "Jakobus"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wie verraadde Jezus?",
    a: ["Judas Iskariot", "Petrus", "Paulus", "Johannes"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wat deden de apostelen bij het Laatste Avondmaal?",
    a: ["Ze aten het brood en de wijn die Jezus Zijn Lichaam en Bloed noemde", "Ze maakten plannen voor later", "Ze sliepen", "Ze vertelden verhalen"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wat gebeurde er op de berg Tabor?",
    a: ["De Gedaanteverandering van Jezus", "De Hemelvaart", "De geboorte van Jezus", "De storm op het meer"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wie werd in de buik van de vis geslikt?",
    a: ["Jona", "Mozes", "Elia", "Paulus"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wat gaf God aan Mozes op de Sinaï?",
    a: ["De Tien Geboden", "Een kroon", "Een staf", "Een ark"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Hoe heet de plaats waar Jezus gekruisigd werd?",
    a: ["Golgotha", "Nazareth", "Bethlehem", "Jericho"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wie schreef de meeste brieven in het Nieuwe Testament?",
    a: ["Paulus", "Petrus", "Johannes", "Jakobus"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wie werd de eerste martelaar van de Kerk?",
    a: ["Stefanus", "Jakobus", "Petrus", "Lucas"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wat is de Ark van Noach?",
    a: ["Het schip waarin Noach en de dieren gered werden", "Een kerkgebouw", "Een boek", "Een altaar"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wie voerde het volk Israël uit Egypte?",
    a: ["Mozes", "Abraham", "David", "Elia"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wie werd koning nadat Saul stierf?",
    a: ["David", "Salomo", "Mozes", "Aaron"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wat vroeg Salomo aan God?",
    a: ["Wijsheid", "Rijkdom", "Oorlog", "Eten"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Welke zee spleet in twee toen Mozes zijn staf ophief?",
    a: ["De Rode Zee", "De Jordaan", "De Dode Zee", "De Middellandse Zee"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wie doodde Goliath?",
    a: ["David", "Saul", "Jozef", "Mozes"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wat deed Jezus bij het meer van Galilea?",
    a: ["Hij riep vissers om Zijn leerlingen te worden", "Hij bouwde een huis", "Hij ging zwemmen", "Hij verdween"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wie werd in de vuuroven gegooid maar bleef ongedeerd?",
    a: ["De drie jongemannen", "Mozes", "Jozua", "Samuel"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wat is het eerste boek van de Bijbel?",
    a: ["Genesis", "Exodus", "Psalmen", "Handelingen"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wat betekent 'Eucharistie'?",
    a: ["Dankzegging", "Brood", "Heiligdom", "Offer"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wat gebeurde er met Jezus veertig dagen na Zijn verrijzenis?",
    a: ["Hij voer ten hemel", "Hij stierf", "Hij ging op reis", "Hij werd priester"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wat betekent 'Orthodoxie'?",
    a: ["Juist geloven en juist eren", "Een oude traditie", "Een groep mensen", "Een kerkgebouw"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Wat zegt Jezus over kinderen?",
    a: ["Laat de kinderen tot Mij komen", "Ze zijn te klein", "Ze begrijpen niets", "Ze moeten wachten"],
    correct: 0
  },
  {
    difficulty: 2,
    q: "Hoeveel dagen is Jezus dood geweest voor Zijn verrijzenis?",
    a: ["3 dagen", "1 dag", "7 dagen", "40 dagen"],
    correct: 0
  }
);
// Moeilijkheid 3 (Level 3, maar ook gebruikt voor Level 4 en 5)
vragen.push(
  {
    difficulty: 3,
    q: "Wat betekent het woord 'Liturgie'?",
    a: ["Dienst voor God en Zijn volk", "Een feest", "Een verhaal", "Een lied"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat is het doel van vasten in de orthodoxe traditie?",
    a: ["Dichter bij God komen", "Gewicht verliezen", "Gezond leven", "Gewoon traditie"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Hoeveel sacramenten kent de Orthodoxe Kerk officieel?",
    a: ["7", "5", "3", "12"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat gebeurt er bij de Heilige Communie?",
    a: ["We ontvangen het Lichaam en Bloed van Christus", "We krijgen gewoon brood en wijn", "We herinneren ons enkel een feest", "We drinken om samen blij te zijn"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wie schreef veel psalmen in de Bijbel?",
    a: ["David", "Mozes", "Elia", "Jesaja"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat betekent 'Theotokos'?",
    a: ["Moeder van God", "Heilige plaats", "Engel van God", "Dochter van Israël"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wie zag een visioen van de hemelse ladder?",
    a: ["Jakob", "Abraham", "Noach", "Samuel"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat gebeurde er op de weg naar Emmaüs?",
    a: ["Jezus verscheen aan twee leerlingen na Zijn verrijzenis", "Petrus werd geroepen", "Maria ontmoette een engel", "Paulus werd blind"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wie is de beschermheilige van reizigers?",
    a: ["Christoforus", "Nicolaas", "Antonius", "Joris"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat leert de Bergrede ons vooral?",
    a: ["De zaligsprekingen en liefde voor de naaste", "Hoe je rijk kan worden", "Hoe je sterk kan zijn", "Hoe je wetten kan breken"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wie werd door raven gevoed in de woestijn?",
    a: ["De profeet Elia", "Mozes", "Jesaja", "David"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat betekent 'Orthodoxe Kerk' letterlijk?",
    a: ["Rechtgelovige Kerk", "Oude Kerk", "Traditionele Kerk", "Kerk van het Oosten"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat zegt Jezus over vergeven?",
    a: ["Zevenenzeventig keer", "Slechts één keer", "Alleen vrienden", "Nooit"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat symboliseert water in het doopsel?",
    a: ["Reiniging en nieuw leven", "Gewoon een traditie", "Kracht", "Wijsheid"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wie schreef het Boek Openbaring?",
    a: ["Johannes", "Paulus", "Petrus", "Lucas"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat betekent 'Eikon' (icoon)?",
    a: ["Beeld van Christus of de heiligen", "Een tekening", "Een symbool", "Een raam"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat betekent 'Kyrie Eleison'?",
    a: ["Heer, ontferm U", "Heer, zegen ons", "Heer, luister", "Heer, vergeef ons"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat is de taak van een priester?",
    a: ["De sacramenten bedienen", "De kerk schoonmaken", "De kinderen lesgeven", "De koning adviseren"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat is het verschil tussen Oude en Nieuwe Testament?",
    a: ["Oude Testament: vóór Christus, Nieuwe Testament: over Christus en Zijn Kerk", "Oude Testament is fout, Nieuwe juist", "Oude Testament is voor Joden, Nieuwe voor Grieken", "Ze zijn hetzelfde"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wie was de eerste bisschop van Jeruzalem?",
    a: ["Jakobus, de broer van de Heer", "Petrus", "Paulus", "Johannes"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat betekent 'Paaslam' in het Oude Testament?",
    a: ["Het offer waardoor het volk werd gespaard", "Een gewoon dier", "Een feestmaal", "Een symbool van rijkdom"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wie schreef de Apocalyps?",
    a: ["Johannes", "Petrus", "Paulus", "Lucas"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat zegt Jezus: 'Ik ben …'?",
    a: ["… de Weg, de Waarheid en het Leven", "… een profeet", "… een priester", "… een gewoon mens"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat betekent 'Katholikos'?",
    a: ["Algemeen, universeel", "Heilig", "Juist", "Bijzonder"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat betekent het Griekse woord 'Christos'?",
    a: ["Gezalfde", "Zoon", "Heer", "Redder"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat is de Eucharistische Anamnese?",
    a: ["Herinnering aan Christus’ lijden, dood en verrijzenis", "Een lofzang", "Een gebed om genezing", "Een lof op Maria"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wie is de beschermer van zeelieden?",
    a: ["Heilige Nicolaas", "Heilige Antonius", "Heilige Joris", "Heilige Andreas"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat is een icoon precies?",
    a: ["Een venster op de hemel", "Een schilderij", "Een foto", "Een herinnering"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat symboliseert de duif in de Bijbel?",
    a: ["De Heilige Geest", "De Kerk", "De vrede", "Het volk Israël"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat betekent 'Orthros'?",
    a: ["Ochtenddienst", "Avonddienst", "Nachtwake", "Middaggebed"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat vieren we op Theofanie?",
    a: ["De Doop van Christus in de Jordaan", "De Verrijzenis", "De Hemelvaart", "De geboorte van Maria"],
    correct: 0
  },
  {
    difficulty: 3,
    q: "Wat is de betekenis van het Kruis voor orthodoxen?",
    a: ["Overwinning op dood en zonde", "Een symbool van lijden zonder hoop", "Een oud ritueel", "Een versiering"],
    correct: 0
  }
);
📋 100 Zondevragen (met juiste antwoord)
1e gebod – God liefhebben

God helemaal vergeten en nooit bidden is goed. ❌ Nee

Elke dag even aan God denken is juist. ✅ Ja

Grappen maken over God in de kerk is goed. ❌ Nee

In de kerk eerbiedig zijn is juist. ✅ Ja

2e gebod – Gods naam niet ijdel

De Naam van God lelijk gebruiken is toegestaan. ❌ Nee

Gods Naam met liefde en eerbied gebruiken is juist. ✅ Ja

3e gebod – Zondag heiligen

De zondag enkel gebruiken om te spelen en nooit aan God te denken is goed. ❌ Nee

Naar de kerk gaan op zondag is juist. ✅ Ja

4e gebod – Vader en moeder eren

Je ouders expres negeren is juist. ❌ Nee

Met respect praten tegen ouders en juf is nodig. ✅ Ja

Je grootouders met liefde helpen is goed. ✅ Ja

Schelden tegen je ouders mag. ❌ Nee

5e gebod – Niet doden (vrede & zorg)

Iemand pijn doen voor de grap mag. ❌ Nee

Een vriend beschermen tegen pesten is juist. ✅ Ja

Pesten of iemand buitensluiten is goed. ❌ Nee

Je boosheid vergeven en vrede maken is goed. ✅ Ja

6e/9e – Zuiverheid en respect

Over het lichaam van anderen grapjes maken is goed. ❌ Nee

Respectvol omgaan met je eigen lichaam is juist. ✅ Ja

7e/10e – Niet stelen en niet hebzuchtig

Iets meenemen dat niet van jou is mag. ❌ Nee

Iets teruggeven dat je vond is goed. ✅ Ja

Jaloers doen en alles voor jezelf willen is juist. ❌ Nee

Tevreden zijn met wat je hebt is goed. ✅ Ja

8e gebod – Niet liegen

Liegen om uit de problemen te blijven is toegestaan. ❌ Nee

Altijd eerlijk zijn is goed. ✅ Ja

Roddelen over iemand is juist. ❌ Nee

De waarheid spreken, ook als het moeilijk is, is juist. ✅ Ja

Kerk & gebed

In de kerk hard roepen en rennen mag. ❌ Nee

Tijdens gebed stil en aandachtig zijn is goed. ✅ Ja

Tijdens gebed expres grapjes maken is goed. ❌ Nee

Een kaarsje aansteken voor iemand is juist. ✅ Ja

Barmhartigheid

Iemand met honger of verdriet negeren is juist. ❌ Nee

Delen met wie niets heeft is goed. ✅ Ja

Zieken bezoeken is juist. ✅ Ja

Iemand uitlachen die verdrietig is mag. ❌ Nee

Respect voor schepping

Afval op straat gooien is oké. ❌ Nee

Afval in de vuilnisbak gooien is juist. ✅ Ja

Dieren plagen mag. ❌ Nee

Zorgen voor dieren is goed. ✅ Ja

School & eerlijk spel

Spieken en valsspelen is toegestaan. ❌ Nee

Eerlijk zijn bij een toets is juist. ✅ Ja

Je beurt afpakken in de rij is goed. ❌ Nee

Wachten op je beurt is juist. ✅ Ja

Taalgebruik

Schelden en lelijke woorden gebruiken is oké. ❌ Nee

Vriendelijke woorden spreken is juist. ✅ Ja

Vergeving

Nooit vergeven en altijd boos blijven is juist. ❌ Nee

Iemand vergeven die sorry zegt is goed. ✅ Ja

Dankbaarheid

Nooit dankjewel zeggen is goed. ❌ Nee

Dankbaar zijn voor kleine dingen is juist. ✅ Ja

Trots / nederigheid

Opscheppen en anderen klein maken is juist. ❌ Nee

Nederig en vriendelijk zijn is goed. ✅ Ja

Media & tijd

Altijd schermtijd kiezen boven gebed of gezin is juist. ❌ Nee

Samen bidden met je gezin is goed. ✅ Ja

Waarheidsliefde

Een fout verbergen en een ander de schuld geven is toegestaan. ❌ Nee

Je eigen fouten toegeven is goed. ✅ Ja

Verdere toepassing geboden

Geld stelen van een arme is toegestaan. ❌ Nee

Een deel van je zakgeld geven aan de armen is juist. ✅ Ja

Een geheim doorvertellen dat iemand jou toevertrouwde is juist. ❌ Nee

Een geheim bewaren als iemand je vertrouwt is goed. ✅ Ja

Je vrienden verraden voor plezier is toegestaan. ❌ Nee

Trouwe vriendschap bewaren is juist. ✅ Ja

Kerk & liturgie

Met aandacht luisteren naar het Evangelie is goed. ✅ Ja

In de kerk bewust storen is juist. ❌ Nee

Voor de communie bidden is goed. ✅ Ja

De communie nemen zonder geloof is juist. ❌ Nee

Gebed & geloof

Elke dag danken voor eten is goed. ✅ Ja

Eten zonder God te danken is juist. ❌ Nee

Je zorgen bij God brengen in gebed is goed. ✅ Ja

Denken dat God je nooit hoort is juist. ❌ Nee

Broederliefde

Je broer of zus expres pijn doen is juist. ❌ Nee

Samen spelen en delen is goed. ✅ Ja

Altijd jaloers zijn op je broer of zus is juist. ❌ Nee

Trots zijn op je broer of zus is goed. ✅ Ja

Heiligen en iconen

Voor een icoon eerbiedig bidden is goed. ✅ Ja

Een icoon bespotten is juist. ❌ Nee

Een kruisje dragen uit geloof is goed. ✅ Ja

Het kruisje uitlachen is juist. ❌ Nee

Liefde voor vijanden

Wraak nemen op iemand die je pijn deed is juist. ❌ Nee

Bidden voor je vijanden is goed. ✅ Ja

Iemand vervloeken is toegestaan. ❌ Nee

Iemand zegenen is juist. ✅ Ja

Naastenliefde

Een nieuwe leerling uitsluiten is juist. ❌ Nee

Een nieuwe leerling welkom heten is goed. ✅ Ja

Een arm kind uitlachen is juist. ❌ Nee

Een arm kind helpen is goed. ✅ Ja

Geloofsleven

De vasten negeren en er grapjes over maken is juist. ❌ Nee

De vasten volgen uit liefde voor God is goed. ✅ Ja

De Bijbel lezen is goed. ✅ Ja

De Bijbel belachelijk maken is juist. ❌ Nee

Hoop & vreugde

Altijd somber doen en nooit danken is juist. ❌ Nee

Hoopvol bidden en danken is goed. ✅ Ja

Overig

Een vriend verraden voor geld is juist. ❌ Nee

Een vriend trouw blijven is goed. ✅ Ja

Zegenen bij het eten is goed. ✅ Ja

Vechten en ruzie maken is juist. ❌ Nee

Bidden voor zieke mensen is goed. ✅ Ja

Zieken uitlachen is juist. ❌ Nee

Een kaarsje aansteken voor iemand is goed. ✅ Ja

Een icoon kapotmaken is juist. ❌ Nee

Samen zingen voor God is goed. ✅ Ja

In de kerk expres lawaai maken is juist. ❌ Nee
