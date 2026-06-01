/* ============================================================
   DADOS — Bolão da Copa 2026
   ============================================================ */

// Seleções: nome -> código de 3 letras
const TEAMS = {
  "México":"MEX","África do Sul":"RSA","Coreia do Sul":"KOR","República Tcheca":"CZE",
  "Canadá":"CAN","Bósnia e Herzegovina":"BIH","Catar":"QAT","Suíça":"SUI",
  "Brasil":"BRA","Marrocos":"MAR","Haiti":"HAI","Escócia":"SCO",
  "Estados Unidos":"USA","Paraguai":"PAR","Austrália":"AUS","Turquia":"TUR",
  "Alemanha":"GER","Curaçau":"CUW","Costa do Marfim":"CIV","Equador":"ECU",
  "Holanda":"NED","Japão":"JPN","Suécia":"SWE","Tunísia":"TUN",
  "Bélgica":"BEL","Egito":"EGY","Irã":"IRN","Nova Zelândia":"NZL",
  "Espanha":"ESP","Cabo Verde":"CPV","Arábia Saudita":"KSA","Uruguai":"URU",
  "França":"FRA","Senegal":"SEN","Iraque":"IRQ","Noruega":"NOR",
  "Argentina":"ARG","Argélia":"ALG","Áustria":"AUT","Jordânia":"JOR",
  "Portugal":"POR","RD Congo":"COD","Uzbequistão":"UZB","Colômbia":"COL",
  "Inglaterra":"ENG","Croácia":"CRO","Gana":"GHA","Panamá":"PAN",
};

// Cor de acento por seleção (para o badge), mantendo a paleta sóbria
const TEAM_TINT = {
  BRA:"#e7c200", ARG:"#5aa9e6", FRA:"#3d6fd6", ENG:"#d96d6d", ESP:"#d9a23c",
  GER:"#cfcfcf", POR:"#3f9e57", NED:"#e08a3c", BEL:"#d4b13a", URU:"#5fb0e0",
  MEX:"#3f9e57", USA:"#5a7fd6", CRO:"#d96d6d", MAR:"#c75a5a", JPN:"#5a8fd6",
};

const RAW_MATCHES = `11/06/2026,A,México,África do Sul
11/06/2026,A,Coreia do Sul,República Tcheca
18/06/2026,A,República Tcheca,África do Sul
18/06/2026,A,México,Coreia do Sul
24/06/2026,A,República Tcheca,México
24/06/2026,A,África do Sul,Coreia do Sul
12/06/2026,B,Canadá,Bósnia e Herzegovina
13/06/2026,B,Catar,Suíça
18/06/2026,B,Suíça,Bósnia e Herzegovina
19/06/2026,B,Canadá,Catar
24/06/2026,B,Suíça,Canadá
24/06/2026,B,Bósnia e Herzegovina,Catar
13/06/2026,C,Brasil,Marrocos
14/06/2026,C,Haiti,Escócia
19/06/2026,C,Escócia,Marrocos
19/06/2026,C,Brasil,Haiti
24/06/2026,C,Escócia,Brasil
24/06/2026,C,Marrocos,Haiti
12/06/2026,D,Estados Unidos,Paraguai
14/06/2026,D,Austrália,Turquia
19/06/2026,D,Turquia,Paraguai
20/06/2026,D,Estados Unidos,Austrália
25/06/2026,D,Turquia,Estados Unidos
25/06/2026,D,Paraguai,Austrália
14/06/2026,E,Alemanha,Curaçau
15/06/2026,E,Costa do Marfim,Equador
20/06/2026,E,Equador,Curaçau
20/06/2026,E,Alemanha,Costa do Marfim
25/06/2026,E,Equador,Alemanha
25/06/2026,E,Curaçau,Costa do Marfim
14/06/2026,F,Holanda,Japão
15/06/2026,F,Suécia,Tunísia
20/06/2026,F,Tunísia,Japão
21/06/2026,F,Holanda,Suécia
25/06/2026,F,Tunísia,Holanda
25/06/2026,F,Japão,Suécia
15/06/2026,G,Bélgica,Egito
16/06/2026,G,Irã,Nova Zelândia
21/06/2026,G,Nova Zelândia,Egito
21/06/2026,G,Bélgica,Irã
26/06/2026,G,Nova Zelândia,Bélgica
26/06/2026,G,Egito,Irã
15/06/2026,H,Espanha,Cabo Verde
16/06/2026,H,Arábia Saudita,Uruguai
21/06/2026,H,Uruguai,Cabo Verde
21/06/2026,H,Espanha,Arábia Saudita
26/06/2026,H,Uruguai,Espanha
26/06/2026,H,Cabo Verde,Arábia Saudita
16/06/2026,I,França,Senegal
16/06/2026,I,Iraque,Noruega
22/06/2026,I,Noruega,Senegal
22/06/2026,I,França,Iraque
26/06/2026,I,Noruega,França
26/06/2026,I,Senegal,Iraque
16/06/2026,J,Argentina,Argélia
17/06/2026,J,Áustria,Jordânia
22/06/2026,J,Jordânia,Argélia
22/06/2026,J,Argentina,Áustria
27/06/2026,J,Jordânia,Argentina
27/06/2026,J,Argélia,Áustria
17/06/2026,K,Portugal,RD Congo
17/06/2026,K,Uzbequistão,Colômbia
23/06/2026,K,Colômbia,RD Congo
23/06/2026,K,Portugal,Uzbequistão
27/06/2026,K,Colômbia,Portugal
27/06/2026,K,RD Congo,Uzbequistão
17/06/2026,L,Inglaterra,Croácia
18/06/2026,L,Gana,Panamá
23/06/2026,L,Panamá,Croácia
23/06/2026,L,Inglaterra,Gana
27/06/2026,L,Panamá,Inglaterra
27/06/2026,L,Croácia,Gana`;

const MONTHS = { "06":"JUN", "07":"JUL" };

// "Agora" simulado para travar/contar palpites: 12 de junho, fim de tarde
const NOW_VAL = 612; // mês*100 + dia

function dateVal(ddmmyyyy) {
  const [d, m] = ddmmyyyy.split("/");
  return parseInt(m, 10) * 100 + parseInt(d, 10);
}
function fmtDate(ddmmyyyy) {
  const [d, m] = ddmmyyyy.split("/");
  return `${d} ${MONTHS[m] || m}`;
}

// Parse + status de aposta
const SOON_LABELS = { 0: "Faltam 2h", 1: "Faltam 5h", 2: "Faltam 9h" };
let _soonCount = 0;
const MATCHES = RAW_MATCHES.trim().split("\n").map((line, i) => {
  const [date, group, home, away] = line.split(",");
  const v = dateVal(date);
  let status = "open", label = null;
  if (v <= NOW_VAL) {
    status = "locked";
  } else if (v === NOW_VAL + 1) { // 13/06 -> próximos
    status = "soon";
    label = SOON_LABELS[_soonCount % 3] || "Faltam 12h";
    _soonCount++;
  }
  return {
    id: `m${i}`,
    date, dateLabel: fmtDate(date), v,
    group, home, away,
    homeCode: TEAMS[home], awayCode: TEAMS[away],
    status, statusLabel: label,
    // placar real simulado (apenas para jogos já "encerrados")
    realHome: status === "locked" ? (i % 3) : null,
    realAway: status === "locked" ? ((i + 1) % 2) : null,
  };
});

// Agrupar por grupo, na ordem A..L
const GROUP_ORDER = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const GROUPS = GROUP_ORDER.map(g => {
  const matches = MATCHES.filter(m => m.group === g);
  const teams = [];
  matches.forEach(m => {
    if (!teams.includes(m.home)) teams.push(m.home);
    if (!teams.includes(m.away)) teams.push(m.away);
  });
  return { id: g, matches, teams: teams.sort((a,b)=>a.localeCompare(b,'pt')) };
});

const TOTAL_MATCHES = MATCHES.length;
const LOCKED_MATCHES = MATCHES.filter(m => m.status === "locked").length;

/* ---------------- Regras de pontuação ---------------- */
const SCORING = {
  groups: [
    { label: "Seleção classificada na posição certa (1º ou 2º)", pts: 10 },
    { label: "Seleção classificada, mas em outra posição", pts: 5 },
  ],
  knockout: [
    { label: "Vencedor de cada confronto previsto corretamente", pts: 10 },
  ],
  awards: [
    { key:"campeao",    label:"Campeão",                         pts:75 },
    { key:"vice",       label:"Vice-campeão",                    pts:55 },
    { key:"finalista",  label:"Acertar quem chega à final",      pts:40 },
    { key:"terceiro",   label:"Terceiro colocado",               pts:30 },
    { key:"mvp",        label:"Melhor Jogador (MVP)",            pts:50 },
    { key:"artilheiro", label:"Artilheiro",                      pts:45 },
    { key:"assist",     label:"Líder de assistências",           pts:45 },
    { key:"goldenboy",  label:"Golden Boy",                      pts:40 },
  ],
};

/* ---------------- Palpites especiais (campos) ---------------- */
const SPECIAL_FIELDS = [
  { key:"campeao",    label:"Campeão",              pts:75, kind:"team",   hint:"Quem levanta a taça" },
  { key:"vice",       label:"Vice-campeão",         pts:55, kind:"team",   hint:"Perdedor da final" },
  { key:"terceiro",   label:"Terceiro colocado",    pts:30, kind:"team",   hint:"Vencedor da disputa de 3º" },
  { key:"finalista",  label:"Outro finalista",      pts:40, kind:"team",   hint:"A 2ª seleção na decisão" },
  { key:"artilheiro", label:"Artilheiro",           pts:45, kind:"player", hint:"Maior goleador" },
  { key:"assist",     label:"Líder de assistências",pts:45, kind:"player", hint:"Mais passes para gol" },
  { key:"mvp",        label:"Melhor Jogador (MVP)", pts:50, kind:"player", hint:"Bola de Ouro do torneio" },
  { key:"goldenboy",  label:"Golden Boy",           pts:40, kind:"player", hint:"Melhor jovem (sub-21)" },
];

const ALL_TEAMS = Object.keys(TEAMS).sort((a,b)=>a.localeCompare(b,'pt'));
