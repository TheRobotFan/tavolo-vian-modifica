/* data.js — Solo dati di "All In Vian". Modifica solo i testi tra virgolette.
   shortLabel = riga piccola in alto | title = titolo | text = testo dettaglio
   suit: spades | hearts | diamonds | clubs (seme decorativo)
   tag = categoria | motivo = illustrazione della carta (file in img/) */

const PUNTI = [
  { id: 1, shortLabel: 'PUNTO 01', title: '[Titolo punto 1]', text: '[Testo di esempio del punto 1. Sostituiscilo con la descrizione vera: di cosa si tratta, a chi è rivolto, dove e quando.]', suit: 'spades', tag: '[Tema]', motivo: './img/asso.svg' },
  { id: 2, shortLabel: 'PUNTO 02', title: '[Titolo punto 2]', text: '[Testo di esempio del punto 2. Sostituiscilo con la descrizione vera, senza toccare il resto del codice.]', suit: 'hearts', tag: '[Tema]', motivo: './img/mano-poker.svg' },
  { id: 3, shortLabel: 'PUNTO 03', title: '[Titolo punto 3]', text: '[Testo di esempio del punto 3. Sostituiscilo con idee, proposte o iniziative da raccontare.]', suit: 'diamonds', tag: '[Tema]', motivo: './img/jolly.svg' },
  { id: 4, shortLabel: 'PUNTO 04', title: '[Titolo punto 4]', text: '[Testo di esempio del punto 4. Sostituiscilo con la descrizione vera del punto.]', suit: 'clubs', tag: '[Tema]', motivo: './img/sacco-fiches.svg' },
  { id: 5, shortLabel: 'PUNTO 05', title: '[Titolo punto 5]', text: '[Testo di esempio del punto 5. Sostituiscilo con la descrizione vera del punto.]', suit: 'spades', tag: '[Tema]', motivo: './img/seme-picche.svg' },
  { id: 6, shortLabel: 'PUNTO 06', title: '[Titolo punto 6]', text: '[Testo di esempio del punto 6. Sostituiscilo con la descrizione vera del punto.]', suit: 'hearts', tag: '[Tema]', motivo: './img/seme-cuori.svg' }
];

/* Sconti di esempio: compaiono solo finché la tabella sconti su Supabase è vuota.
   Appena inserisci i veri sconti dall'admin (o dalla SQL editor), questi spariscono.
   Modifica solo i testi tra virgolette. */
const SCONTI_MOCK = [
  { locale: 'Pizzeria Da Nino', categoria: 'Ristoranti', sconto: '-15%', dettagli: 'Sconto sul conto intero per tavoli da 4 persone in su. Da richiedere prima di ordinare, mostrando questa pagina.', valido_fino: '30/06/2025' },
  { locale: 'Bar Centrale', categoria: 'Caffè', sconto: '2x1', dettagli: 'Un aperitivo offerto su uno, ogni giovedì dalle 18 alle 20. Vale anche su bibite e tramezzini.', valido_fino: '30/06/2025' },
  { locale: 'Libreria Il Vian', categoria: 'Libri', sconto: '-10%', dettagli: 'Su libri di testo, quaderni e cancelleria. Presentarsi in cassa con la lista All In Vian.', valido_fino: '31/07/2025' },
  { locale: 'Copy & Stampi', categoria: 'Servizi', sconto: '-20%', dettagli: 'Su fotocopie, stampazioni e rilegature per la scuola. Minimo 10 fogli per attivare lo sconto.', valido_fino: '30/06/2025' },
  { locale: 'Gelateria Il Borgo', categoria: 'Dolci', sconto: '+1 cop', dettagli: 'Una copertura gratis su qualsiasi cono o coppetta. Ogni pomeriggio dalle 16 in poi.', valido_fino: '30/09/2025' },
  { locale: 'Parrucchiere Alex', categoria: 'Beauty', sconto: '-20%', dettagli: 'Taglio e piega a prezzo studente. Su appuntamento: indica lo sconto quando prenoti.', valido_fino: '31/12/2025' },
  { locale: 'Panineria Da Ricky', categoria: 'Street food', sconto: '-1€', dettagli: 'Un euro in meno su qualsiasi panino o piadina. Basta mostrare la pagina al bancone.', valido_fino: '30/06/2025' },
  { locale: 'Bici Service Bracciano', categoria: 'Sport', sconto: '-25%', dettagli: 'Riparazioni e tagliando bici: un quarto in meno. Utile per tornare in pista dopo la pausa estiva.', valido_fino: '31/10/2025' }
];

/* Giorno della votazione per il countdown in home (AAAA-MM-GGThh:mm).
   Cambia solo questa riga per aggiornare l'orologio di torneo. */
const DATA_VOTAZIONE = '2026-10-28T08:00';

/* Foto di tavolo: sostituisci i src con le foto vere (in img/foto/...).
   Finché sono placeholder usiamo le carte del mazzo. */
const FOTO = [
  { src: './img/carte/ace_of_spades.png', didascalia: 'La prima mano', data: 'settembre' },
  { src: './img/carte/king_of_hearts.png', didascalia: 'Carta nobile in distribuzione', data: 'ottobre' },
  { src: './img/carte/queen_of_diamonds.png', didascalia: 'La regina del banco', data: 'novembre' },
  { src: './img/carte/jack_of_clubs.png', didascalia: 'Il jack in missione', data: 'dicembre' },
  { src: './img/carte/ace_of_hearts.png', didascalia: 'Asso di cuori, punto pieno', data: 'gennaio' },
  { src: './img/carte/dorso.png', didascalia: 'Mazzo coperto: sorpresa in arrivo', data: 'febbraio' }
];

/* Proposte di esempio: compaiono solo se la tabella proposte su Supabase è vuota/assente. */
const PROPOSTE_MOCK = [
  { nome: 'Sara M.', classe: '2ª A', testo: 'Uno spazio in biblioteca aperto fino alle 18 due volte a settimana, per studiare insieme prima delle verifiche.', creato: 'esempio' },
  { nome: 'Luca T.', classe: '4ª C', testo: 'Un murale nel cortile dipinto dagli studenti, con un concorso aperto a tutte le classi.', creato: 'esempio' }
];

/* La partita: le tappe della lista sulla timeline della home.
   Modifica solo i testi tra virgolette, l'ordine è quello che compaiono. */
const TAPPE = [
  { data: 'settembre', titolo: 'Il mazzo si compone', testo: 'Siamo partiti in sei, con un’idea sola: prendere la scuola sul serio e noi stessi no.', stato: 'fatto' },
  { data: 'inizio ottobre', titolo: 'Programma aperto', testo: 'I sei punti sono online, modificabili: chi ha critiche è più utile di chi applaude.', stato: 'fatto' },
  { data: 'metà ottobre', titolo: 'Trattative in tavola', testo: 'Convenzioni con negozi e locali del centro: sconti veri per chi frequenta il Vian.', stato: 'fatto' },
  { data: 'oggi', titolo: 'Il tavolo delle proposte', testo: 'Le vostre idee contano più delle nostre promesse: mandatele, le leggiamo tutte.', stato: 'fatto' },
  { data: '28 ottobre', titolo: 'La votazione', testo: 'Il giorno della mano finale. All In, fino in fondo.', stato: 'futuro' }
];

/* Domande frequenti: le carte della pagina FAQ.
   seme: spades | hearts | diamonds | clubs (distribuiscili come vuoi). */
const FAQ_VOCI = [
  { seme: 'spades', domanda: 'È sul serio o è una presa in giro?', risposta: 'Sul serio, con ironia. Prendiamo la scuola sul serio, non noi stessi: dietro ogni battuta c’è un programma vero, fatto di sei punti concreti e di ascolto.' },
  { seme: 'hearts', domanda: 'Perché il tema del poker?', risposta: 'Perché "All In" significa metterci tutto: le idee, il tempo, la voglia. Ogni candidato è una carta del mazzo, ogni proposta è una mano da giocare.' },
  { seme: 'diamonds', domanda: 'Gli sconti valgono per tutti?', risposta: 'Sì: basta essere studenti del Vian. Mostri la pagina in cassa e lo sconto è tuo, senza tesserino e senza abbonamenti.' },
  { seme: 'clubs', domanda: 'Dove vi troviamo?', risposta: 'In intervallo nell’aula che ci affidano, e ovunque ci sia una discussione da migliorare. Seguiteci anche qui: il sito si aggiorna in tempo reale.' },
  { seme: 'spades', domanda: 'Posso proporre un’idea?', risposta: 'Non solo puoi: devi. Vai al tavolo delle proposte, scrivi la tua idea e la leggiamo tutte. Le migliori finiscono nel programma.' },
  { seme: 'hearts', domanda: 'Il programma è questo e basta?', risposta: 'I sei punti sono la base, non il tetto. Cambia la scuola chi la frequenta: per questo le proposte di tutti contano più delle promesse di pochi.' }
];
