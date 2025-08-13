// ========= Helpers UI =========
const LS_KEY = "testgen.session.v2";
function $(id) { return document.getElementById(id); }
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1500);
}
async function copyFrom(targetId) {
  const el = $(targetId);
  const value = el.value;
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
    else { el.select(); document.execCommand('copy'); }
    toast('Copiado');
  } catch { toast('No se pudo copiar'); }
}
function setStatus(id, ok, okMsg, badMsg) {
  const el = $(id);
  el.className = 'status ' + (ok ? 'ok' : 'error');
  el.textContent = ok ? `✅ ${okMsg}` : `❌ ${badMsg}`;
}

function exportCSV(obj){
  const headers = Object.keys(obj);
  const row = headers.map(k => '"'+String(obj[k]).replace(/"/g,'""')+'"');
  const csv = headers.join(',') + '\n' + row.join(',');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'session.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ========= Alias & Email =========
const ADJECTIVES = ["roca","noble","soberbio","claro","bravo","pleno","pardo","rápido","sereno","vivo","etéreo","granito","ámbar","cobalto","púrpura","dorado","plata","oculto","crudo","ornato","franco","recto","astro","árido","lunar","óptimo","rústico","silente","rútilo","tímido","férreo","magno","íntegro","sólido","tenaz","laurel","fresco","sabio","fibra","solar","nuevo","nítido","verde","azul","negro","blanco","ocre","seco","grave","manso","tibio","plano","largo","ancho","alto","bajo","suave","duro","limpio","pardo","casto","fiel","diestro","torre","cauto","recto","firme","valle","pampa","andino","litoral","selvático","marino","urbano","río","nube","trueno","brisa","llama","cumbre","bosque","norte","sur","este","oeste","pluma","eco","arcano","clavel","rosa","lirio","árbol","lluvia","naciente","viejo","joven","sabio","raro","clásico","moderno","ágil","ácido","bélico","básico","cóncavo","convexo","óptico","épico","ínfimo","máximo","místico","prístino"];
const NOUNS = ["paragua","castor","tundra","faro","nicho","quimera","plataforma","brújula","fogón","farallón","bastión","talle","bóveda","brote","cuenco","dársena","estuario","fragua","góndola","horno","isla","jardín","kilómetro","lago","margen","nodo","óvalo","pilar","quicio","ribera","sendero","tajo","umbra","válvula","yunque","zaguán","arroyito","barranca","caverna","duna","estepa","fresno","glaciar","hondonada","iglesia","jaula","kiosco","lanza","meandro","nave","órbita","pampa","querencia","rancho","serrana","tambo","urna","vértice","yapeyú","zorzal","puente","balcón","cantera","delta","estación","frontera","galpón","humedal","ingenio","juncal","laguna","monte","naciente","orilla","puerto","quebrada","reserva","salina","terrazas","upland","vereda","yacare","zigurat"];
const ANIMALS = ["zorro","tigre","ñandú","condor","lobo","puma","jaguar","gato","perro","halcón","gorrión","liebre","oso","caballo","yacaré","tortuga","delfín","ballena","búho","carancho","águila","búfalo","ciervo","suricata","colibrí","búfalo","andeano","ñacurutú","gavilán","paloma","cisne","cóndor","flamenco","maguari","huemul","vizcacha","coipo","carpincho","guanaco","llama","alpaca","zorrino","monarca","abeja","avispa","cigarra","langosta","manta","pulpo","salmon","trucha","gallareta","hornero","tordo","tero","pato","ganso","gallina","quebracho","calandria","chercán","martín","zorzal","picaflor","chajá","tucán"];

function normalizeWord(w) { return w.toLowerCase().normalize('NFD').replace(/\p{M}+/gu, ''); }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function generateAlias() { return `${normalizeWord(pick(ADJECTIVES))}.${normalizeWord(pick(NOUNS))}.${normalizeWord(pick(ANIMALS))}`; }

function emailDefault(alias) { return `${alias}@example.com`; }
function emailCustom(alias, base, domain) {
  const b = (base || 'test').trim(); const d = (domain || 'gmail.com').trim();
  return `${b}+${alias}@${d}`;
}

// ========= GS1 / Check digits =========
// GS1 (mod10): sum right-to-left alternando *3,*1
function gs1CheckDigit(numWithoutCD) {
  const digits = String(numWithoutCD).split('').map(Number);
  let sum = 0;
  // desde la derecha: posiciones impares *3
  for (let i = digits.length - 1, pos = 1; i >= 0; i--, pos++) {
    sum += digits[i] * (pos % 2 === 1 ? 3 : 1);
  }
  return (10 - (sum % 10)) % 10;
}
function validateGS1(full) {
  const s = String(full).replace(/\D/g,'');
  const body = s.slice(0, -1), cd = Number(s.slice(-1));
  return gs1CheckDigit(body) === cd;
}

// GLN (13) = GS1 12 + cd
function generateGLN() {
  let body = ''; for (let i=0;i<12;i++) body += Math.floor(Math.random()*10);
  if (/^0+$/.test(body)) body = '1' + body.slice(1);
  return body + gs1CheckDigit(body);
}
function validateGLN(v) { const s = String(v).replace(/\D/g,''); return s.length === 13 && validateGS1(s); }

// GTIN-13 (EAN-13)
function generateGTIN13() {
  let body = ''; for (let i=0;i<12;i++) body += Math.floor(Math.random()*10);
  if (/^0+$/.test(body)) body = '1' + body.slice(1);
  return body + gs1CheckDigit(body);
}
function validateGTIN13(v){ const s = String(v).replace(/\D/g,''); return s.length===13 && validateGS1(s); }

// GTIN-14 (ITF-14)
function generateGTIN14() {
  let body = ''; for (let i=0;i<13;i++) body += Math.floor(Math.random()*10);
  if (/^0+$/.test(body)) body = '1' + body.slice(1);
  return body + gs1CheckDigit(body);
}
function validateGTIN14(v){ const s = String(v).replace(/\D/g,''); return s.length===14 && validateGS1(s); }

// SSCC (18)
function generateSSCC() {
  let body = ''; for (let i=0;i<17;i++) body += Math.floor(Math.random()*10);
  if (/^0+$/.test(body)) body = '1' + body.slice(1);
  return body + gs1CheckDigit(body);
}
function validateSSCC(v){ const s = String(v).replace(/\D/g,''); return s.length===18 && validateGS1(s); }

// ========= CUIT =========
function computeCuitDV10(digs){ // 10 primeros
  const w = [5,4,3,2,7,6,5,4,3,2];
  const sum = digs.reduce((a,d,i)=>a+d*w[i],0);
  const mod = sum % 11; const dv = 11 - mod;
  if (dv === 11) return 0; if (dv === 10) return 9; return dv;
}

function generateCuitWithPrefix(prefixStr = '30') {
  const p = String(prefixStr).padStart(2, '0').slice(0, 2);
  const prefix = [Number(p[0]), Number(p[1])];
  const mid = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10));
  const base10 = prefix.concat(mid);
  const dv = computeCuitDV10(base10);
  const all = base10.concat([dv]).join('');
  return `${all.slice(0,2)}-${all.slice(2,10)}-${all.slice(10)}`;
}

// Prefijos CUIT válidos (podés quitar este set si no querés restringir por tipo)
const CUIT_ALLOWED_PREFIXES = new Set(['20','23','24','27','30','33','34']);

// ✅ Validador estricto de CUIT
function validateCuit(value) {
  const s = String(value).trim();

  // Acepta: "XXXXXXXXXXX" o "XX-XXXXXXXX-X" (sólo dígitos y guiones donde corresponde)
  const m = s.match(/^(\d{2})-?(\d{8})-?(\d)$/);
  if (!m) return false;

  const prefix = m[1];                    // 2 dígitos
  const body10 = (m[1] + m[2]).split(''); // 10 dígitos (prefijo + base)
  const dv = Number(m[3]);                // dígito verificador

  // (Opcional) Restringir a prefijos conocidos
  if (!CUIT_ALLOWED_PREFIXES.has(prefix)) return false;

  // Pesos y cálculo ya existentes
  const arr = body10.map(Number); // 10 dígitos
  return computeCuitDV10(arr) === dv;
}

// ========= DNI =========
function computeDniDV8(digs){
  const w = [3,2,7,6,5,4,3,2];
  const arr = String(digs).padStart(8,'0').split('').map(Number);
  const sum = arr.reduce((a,d,i)=>a+d*w[i],0);
  const mod = sum % 11; const dv = 11 - mod;
  if (dv === 11) return 0; if (dv === 10) return 9; return dv;
}
function generateDNI(){
  let body=''; for(let i=0;i<8;i++) body += Math.floor(Math.random()*10);
  return body + computeDniDV8(body);
}
function validateDNI(v){
  const s = String(v).replace(/\D/g,'');
  if (s.length!==9) return false;
  const body = s.slice(0,8); const cd = Number(s.slice(8));
  return computeDniDV8(body) === cd;
}

// ========= CBU =========
function computeCBUDigit(digs, weights){
  const sum = digs.reduce((a,d,i)=>a + d*weights[i], 0);
  return (10 - (sum % 10)) % 10;
}
function generateCBU(){
  let bank=''; for(let i=0;i<7;i++) bank += Math.floor(Math.random()*10);
  const d1 = computeCBUDigit(bank.split('').map(Number), [7,1,3,9,7,1,3]);
  let acct=''; for(let i=0;i<13;i++) acct += Math.floor(Math.random()*10);
  const d2 = computeCBUDigit(acct.split('').map(Number), [3,9,7,1,3,9,7,1,3,9,7,1,3]);
  return bank + d1 + acct + d2;
}
function validateCBU(v){
  const s = String(v).replace(/\D/g,'');
  if (s.length!==22) return false;
  const bank = s.slice(0,7).split('').map(Number); const d1 = Number(s[7]);
  const acct = s.slice(8,21).split('').map(Number); const d2 = Number(s[21]);
  const ok1 = computeCBUDigit(bank, [7,1,3,9,7,1,3]) === d1;
  const ok2 = computeCBUDigit(acct, [3,9,7,1,3,9,7,1,3,9,7,1,3]) === d2;
  return ok1 && ok2;
}

// ========= UUID v4 / ULID =========
function generateUUIDv4() {
  // Si está disponible, usar RNG criptográfico
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // Setear versión (0100) en byte 6 y variante (10xx) en byte 8
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  }

  // Fallback sin crypto: controla índices incluyendo guiones
  const hex = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) { s += '-'; continue; }
    let r = (Math.random() * 16) | 0;
    if (i === 14) r = 4;                // versión 4 en la 3ra sección (posición 14, 0-based)
    if (i === 19) r = (r & 0x3) | 0x8;  // variante 10xx en la 4ta sección (posición 19)
    s += hex[r];
  }
  return s;
}

const UUIDV4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function validateUUIDv4(v){ return UUIDV4_RE.test(v); }

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function generateULID(){
  // 48-bit time (ms) + 80-bit randomness => 26 chars base32 crockford
  const time = Date.now();
  const timeChars = [];
  let t = time;
  for (let i=9;i>=0;i--){ timeChars[i] = CROCKFORD[t % 32]; t = Math.floor(t/32); }
  let randChars = '';
  for (let i=0;i<16;i++) randChars += CROCKFORD[Math.floor(Math.random()*32)];
  return timeChars.join('') + randChars;
}
const ULID_RE = /^[0-9A-HJKMNP-TV-Z]{26}$/; // crockford base32
function validateULID(v){ return ULID_RE.test(v); }

// ========= Barcodes (SVG) =========
// EAN-13 patterns
const EAN_L = {
  0:"0001101",1:"0011001",2:"0010011",3:"0111101",4:"0100011",5:"0110001",6:"0101111",7:"0111011",8:"0110111",9:"0001011"
};
const EAN_G = {
  0:"0100111",1:"0110011",2:"0011011",3:"0100001",4:"0011101",5:"0111001",6:"0000101",7:"0010001",8:"0001001",9:"0010111"
};
const EAN_R = {
  0:"1110010",1:"1100110",2:"1101100",3:"1000010",4:"1011100",5:"1001110",6:"1010000",7:"1000100",8:"1001000",9:"1110100"
};
const EAN_PARITY = {
  0:"LLLLLL",1:"LLGLGG",2:"LLGGLG",3:"LLGGGL",4:"LGLLGG",5:"LGGLLG",6:"LGGGLL",7:"LGLGLG",8:"LGLGGL",9:"LGGLGL"
};
function ean13Encode(num13){
  const s = String(num13).replace(/\D/g,'');
  if (s.length!==13) return null;
  const first = Number(s[0]);
  const left = s.slice(1,7).split('').map(Number);
  const right = s.slice(7).split('').map(Number);

  let enc = "101"; // start guard
  const parity = EAN_PARITY[first];
  for (let i=0;i<6;i++){
    const digit = left[i];
    const patt = parity[i]==='L' ? EAN_L[digit] : EAN_G[digit];
    enc += patt;
  }
  enc += "01010"; // center
  for (let i=0;i<6;i++){
    enc += EAN_R[right[i]];
  }
  enc += "101"; // end guard
  return enc;
}
function renderEAN13SVG(num13, height=60, scale=2){
  const s = String(num13).replace(/\D/g,'');
  const bits = ean13Encode(s);
  if (!bits) return `<svg />`;
  const width = bits.length * scale;
  let x=0, bars='';
  for (const b of bits){
    if (b==='1') bars += `<rect x="${x}" y="0" width="${scale}" height="${height}" />`;
    x += scale;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g fill="#fff"/><g fill="#000">${bars}</g></svg>`;
}

// ITF-14 (Interleaved 2 of 5)
const ITF_PATTERNS = {
  0:"00110",1:"10001",2:"01001",3:"11000",4:"00101",5:"10100",6:"01100",7:"00011",8:"10010",9:"01010"
};
function renderITF14SVG(num14, height=60, scale=2){
  const s = String(num14).replace(/\D/g,'');
  if (s.length!==14) return `<svg />`;
  // start code: 1010, end code: 1101 (wide/narrow bars simplificado)
  let pattern = "1010";
  for (let i=0;i<14;i+=2){
    const a = Number(s[i]), b = Number(s[i+1]);
    const pa = ITF_PATTERNS[a], pb = ITF_PATTERNS[b];
    for (let j=0;j<5;j++){
      // bar (from a), space (from b)
      pattern += pa[j]==='1' ? "11" : "1";   // ancho barra
      pattern += pb[j]==='1' ? "00" : "0";   // ancho espacio
    }
  }
  pattern += "1101";

  // Dibujo por runs (bar/space alternados). Cada char = 1 unidad de ancho.
  let x = 0, bars = '', run = 1;
  for (let i=1; i<=pattern.length; i++){ // i=1 para poder mirar anterior
    if (i < pattern.length && pattern[i] === pattern[i-1]) { run++; continue; }
    const isBar = ((i-1) % 2 === 0); // 0-based: 0 bar,1 space,2 bar,...
    const width = run * scale;
    if (isBar && pattern[i-1] === '1') {
      bars += `<rect x="${x}" y="0" width="${width}" height="${height}" />`;
    }
    x += width;
    run = 1;
  }
  const totalW = x;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${height}" viewBox="0 0 ${totalW} ${height}"><g fill="#fff"/><g fill="#000">${bars}</g></svg>`;
}

// ========= Datos ficticios =========
const FIRST_NAMES = [
  "Juan","María","Luis","Ana","Pedro","Lucía","Sofía","Nicolás","Camila","Julián","Carla","Tomás","Valentina","Agustín","Florencia",
  "Martín","Paula","Andrés","Verónica","Diego","Micaela","Gustavo","Laura","Federico","Rocío","Matías","Daniela","Pablo","Gabriela","Hernán",
  "Santiago","Julieta","Leandro","Carolina","Franco","Milagros","Sebastián","Lorena","Emiliano","Patricia","Fernando","Cecilia","Maximiliano","Claudia","Alejandro",
  "Iván","Marina","Ricardo","Noelia","Facundo","Victoria","Gonzalo","Jimena","Lucas","Antonella","Cristian","Brenda","Esteban","Carina","Hugo",
  "Oscar","Adriana","Raúl","Nadia","Jorge","Carina","Rubén","Pilar","Ezequiel","Soledad","Alejandra","Omar","Romina","Manuel","Silvina",
  "Lisandro","Alicia","Héctor","Josefina","Elena","Natalia","Miguel","Isabel","Felipe","Pamela","Rodrigo","Malena","Ariel","Bianca","Mauricio"
];

const LAST_NAMES  = [
  "García","López","Martínez","Rodríguez","Gómez","Fernández","Hernández","Pérez","Sánchez","Romero","Alvarez","Torres","Rojas","Castro","Ruiz",
  "Morales","Silva","Ramírez","Ortega","Acosta","Domínguez","Molina","Medina","Suárez","Ramos","Núñez","Cruz","Herrera","Aguilar","Paredes",
  "Reyes","Vega","Vázquez","Cabrera","Figueroa","Méndez","Bravo","Salazar","Cortés","Peña","Leiva","Ibarra","Campos","Navarro","Arce",
  "Palacios","Godoy","Toledo","Chávez","Fuentes","Rivera","Valenzuela","Bustos","Ojeda","Carrizo","Espinoza","Quiroga","Muñoz","Lucero","Farias",
  "Correa","Zárate","Montoya","Ponce","Escobar","Alonso","Aguirre","Delgado","Ayala","Rosales","Villalba","Luna","Peralta","Orellana","Pizarro"
];

const STREETS = [
  "San Martín","Belgrano","Rivadavia","Sarmiento","Mitre","Alsina","Lavalle","Urquiza","Corrientes","Santa Fe","Maipú","Independencia",
  "Alem","Italia","Francia","España","Chile","Brasil","Paraguay","Uruguay","Perú","México","Bolivia","Venezuela",
  "Colon","9 de Julio","25 de Mayo","Güemes","Dorrego","Saavedra","Roque Sáenz Peña","Balcarce","Laprida","Pasco","Castelli","Catamarca",
  "Jujuy","Tucumán","Entre Ríos","Formosa","Chaco","Misiones","Salta","Jujuy Norte","Mendoza Sur","Río Negro","Neuquén","Chubut"
];

const CITIES  = [
  "CABA","Córdoba","Rosario","Mendoza","La Plata","Mar del Plata","Salta","Santa Fe","San Miguel de Tucumán","Neuquén","Bahía Blanca","Paraná",
  "Posadas","Resistencia","Corrientes","San Salvador de Jujuy","Santiago del Estero","Río Gallegos","San Fernando del Valle de Catamarca","Ushuaia","San Juan","Trelew","Villa María","Rafaela",
  "Concordia","Gualeguaychú","Comodoro Rivadavia","Puerto Madryn","San Rafael","Villa Carlos Paz","Pinamar","Bariloche","Esquel","Rawson","Chivilcoy","Mercedes",
  "Pergamino","Junín","Olavarría","Azul","Tandil","Venado Tuerto","Reconquista","Campana","Zárate","San Nicolás","Balcarce","Casilda"
];

const AREA_CODES = ["11","221","223","261","341","351","362","370","379"];
const CURRENCIES = ["ARS","USD","EUR","GBP","BRL"];


function titleCaseWords(alias){ return alias.split('.').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' '); }
function genCompanyNameFromAlias(alias){
  const base = titleCaseWords(alias);
  const suffix = Math.random() < 0.5 ? " SRL" : " SA";
  return base + suffix;
}
function genPerson(){ return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`; }
function genAddress(){
  const num = Math.floor(100 + Math.random()*8900);
  return `${pick(STREETS)} ${num}, ${pick(CITIES)}`;
}

// ========= Amounts / Orders / Dates =========
function formatMoney(v, currency){
  try { return new Intl.NumberFormat('es-AR', {style:'currency', currency}).format(v); }
  catch { return `${currency} ${v.toFixed(2)}`; }
}
function randomBetween(min, max){ return Math.random()*(max-min)+min; }
function pad(n){ return String(n).padStart(2,'0'); }
function yyyymmdd(d){ return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`; }

function generatePhone(areaCodes = AREA_CODES){
  const area = pick(areaCodes);
  const num = Math.floor(1000000 + Math.random()*9000000).toString();
  return `+54${area}${num}`;
}

function generateFromPattern(expr){
  let out = '';
  for (const ch of expr){
    if (ch === 'A') out += String.fromCharCode(65 + Math.floor(Math.random()*26));
    else if (ch === 'a') out += String.fromCharCode(97 + Math.floor(Math.random()*26));
    else if (ch === '9') out += Math.floor(Math.random()*10);
    else out += ch;
  }
  return out;
}

// ========= Estado =========
let state = {
  alias: '',
  customEmail: false,
  emailDomain: 'gmail.com',
  emailBase: 'test',
  email: '',
  gln: '',
  gtin13: '',
  gtin14: '',
  sscc: '',
  cuitPrefix: '30',
  cuit: '',
  uuidv4: '',
  ulid: '',
  dni: '',
  cbu: '',
  fakeCompany: '',
  fakePerson: '',
  fakeAddress: '',
  dateFrom: '',
  dateTo: '',
  amountOut: '',
  orderOut: '',
  phone: '',
  patternOut: ''
};

function save(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
function load(){
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function recomputeEmail(){
  const alias = $('alias').value.trim();
  if ($('custom-email').checked) {
    const base = $('email-base').value.trim() || 'test';
    const dom  = $('email-domain').value.trim() || 'gmail.com';
    state.email = emailCustom(alias, base, dom);
  } else {
    state.email = emailDefault(alias);
  }
  $('email').value = state.email;
  save();
}

function renderAll(){
  $('alias').value = state.alias;
  $('custom-email').checked = state.customEmail;
  $('email-domain').value = state.emailDomain;
  $('email-base').value = state.emailBase;
  recomputeEmail();

  $('gln').value = state.gln;
  setStatus('gln-status', validateGLN(state.gln), 'GLN válido', 'GLN inválido');

  $('gtin13').value = state.gtin13;
  setStatus('gtin13-status', validateGTIN13(state.gtin13), 'GTIN-13 válido', 'GTIN-13 inválido');

  $('gtin14').value = state.gtin14;
  setStatus('gtin14-status', validateGTIN14(state.gtin14), 'GTIN-14 válido', 'GTIN-14 inválido');

  $('sscc').value = state.sscc;
  setStatus('sscc-status', validateSSCC(state.sscc), 'SSCC válido', 'SSCC inválido');

  $('cuit-prefix').value = state.cuitPrefix;
  $('cuit').value = state.cuit;
  setStatus('cuit-status', validateCuit(state.cuit), 'CUIT válido', 'CUIT inválido');

  $('uuidv4').value = state.uuidv4;
  setStatus('uuidv4-status', validateUUIDv4(state.uuidv4), 'UUID v4 válido', 'UUID v4 inválido');

  $('ulid').value = state.ulid;
  setStatus('ulid-status', validateULID(state.ulid), 'ULID válido', 'ULID inválido');

  $('dni').value = state.dni;
  setStatus('dni-status', validateDNI(state.dni), 'DNI válido', 'DNI inválido');

  $('cbu').value = state.cbu;
  setStatus('cbu-status', validateCBU(state.cbu), 'CBU válido', 'CBU inválido');

  $('fake-company').value = state.fakeCompany;
  $('fake-person').value = state.fakePerson;
  $('fake-address').value = state.fakeAddress;

  $('date-from').value = state.dateFrom || '';
  $('date-to').value = state.dateTo || '';

  $('amount-out').value = state.amountOut || '';
  $('order-out').value = state.orderOut || '';

  $('pattern-out').value = state.patternOut || '';
  setStatus('pattern-status', !!state.patternOut, 'Generado', '');

  $('phone').value = state.phone || '';
  setStatus('phone-status', !!state.phone, 'Generado', '');

  // Mostrar/ocultar config de email
  $('email-config').classList.toggle('hidden', !$('custom-email').checked);
}

function regenAlias(){
  state.alias = generateAlias();
  $('alias').value = state.alias;
  recomputeEmail();
}
function regenGS1(){
  state.gln = generateGLN();
  state.gtin13 = generateGTIN13();
  state.gtin14 = generateGTIN14();
  state.sscc = generateSSCC();
}
function regenGeneral(){
  state.cuit = generateCuitWithPrefix(state.cuitPrefix);
  state.uuidv4 = generateUUIDv4();
  state.ulid = generateULID();
  state.dni = generateDNI();
  state.cbu = generateCBU();
}
function regenFake(){
  state.fakeCompany = genCompanyNameFromAlias(state.alias);
  state.fakePerson = genPerson();
  state.fakeAddress = genAddress();
}

function regenPhone(){
  state.phone = generatePhone();
}

function renderBarcodes(){
  const g13 = $('gtin13').value;
  const g14 = $('gtin14').value;
  $('ean13-svg').innerHTML = validateGTIN13(g13) ? renderEAN13SVG(g13, 80, 2) : '';
  $('itf14-svg').innerHTML = validateGTIN14(g14) ? renderITF14SVG(g14, 80, 2) : '';
}

// ========= Init =========
document.addEventListener('DOMContentLoaded', () => {
  const s = load();
  if (s) state = Object.assign(state, s);
  if (!state.alias) state.alias = generateAlias();
  if (!state.gln) regenGS1();
  if (!state.cuit || !state.uuidv4 || !state.ulid || !state.dni || !state.cbu) regenGeneral();
  if (!state.fakeCompany) regenFake();
  if (!state.phone) regenPhone();

  renderAll();

  // Copy buttons (delegado)
  document.querySelectorAll('button.copy').forEach(btn => {
    btn.addEventListener('click', () => copyFrom(btn.getAttribute('data-target')));
  });

  // Alias editable
  $('alias').addEventListener('input', () => {
    let v = $('alias').value;
    // normalizo similar a generateAlias: minúscula, sin tildes; espacios -> punto; múltiples puntos -> uno
    v = v.normalize('NFD').replace(/\p{M}+/gu,'').toLowerCase().replace(/[\s_]+/g,'.').replace(/[^a-z0-9.]/g,'').replace(/\.+/g,'.').replace(/^\./,'').replace(/\.$/,'');
    $('alias').value = v;
    state.alias = v;
    recomputeEmail();
    save();
  });

  // Email config
  $('custom-email').addEventListener('change', () => {
    state.customEmail = $('custom-email').checked;
    $('email-config').classList.toggle('hidden', !state.customEmail);
    recomputeEmail();
  });
  $('email-domain').addEventListener('input', () => { state.emailDomain = $('email-domain').value; recomputeEmail(); save(); });
  $('email-base').addEventListener('input', () => { state.emailBase = $('email-base').value; recomputeEmail(); save(); });

  // Regenerar
  $('regen-alias').addEventListener('click', () => { regenAlias(); save(); renderAll(); });
  $('regen-gs1').addEventListener('click', () => { regenGS1(); save(); renderAll(); });
  $('regen-general').addEventListener('click', () => { regenGeneral(); save(); renderAll(); });
  $('regen-fake').addEventListener('click', () => { regenFake(); save(); renderAll(); });
  $('regen-phone').addEventListener('click', () => { regenPhone(); save(); renderAll(); });

  // Validaciones al editar manualmente
  $('gln').addEventListener('input', () => { state.gln = $('gln').value; setStatus('gln-status', validateGLN(state.gln), 'GLN válido', 'GLN inválido'); save(); });
  $('gtin13').addEventListener('input', () => { state.gtin13 = $('gtin13').value; setStatus('gtin13-status', validateGTIN13(state.gtin13), 'GTIN-13 válido', 'GTIN-13 inválido'); save(); });
  $('gtin14').addEventListener('input', () => { state.gtin14 = $('gtin14').value; setStatus('gtin14-status', validateGTIN14(state.gtin14), 'GTIN-14 válido', 'GTIN-14 inválido'); save(); });
  $('sscc').addEventListener('input', () => { state.sscc = $('sscc').value; setStatus('sscc-status', validateSSCC(state.sscc), 'SSCC válido', 'SSCC inválido'); save(); });
  $('cuit-prefix').addEventListener('change', () => { state.cuitPrefix = $('cuit-prefix').value; state.cuit = generateCuitWithPrefix(state.cuitPrefix); $('cuit').value = state.cuit; setStatus('cuit-status', validateCuit(state.cuit), 'CUIT válido', 'CUIT inválido');save();});
  $('cuit').addEventListener('input', () => { state.cuit = $('cuit').value; setStatus('cuit-status', validateCuit(state.cuit), 'CUIT válido', 'CUIT inválido'); save(); });
  $('uuidv4').addEventListener('input', () => { state.uuidv4 = $('uuidv4').value; setStatus('uuidv4-status', validateUUIDv4(state.uuidv4), 'UUID v4 válido', 'UUID v4 inválido'); save(); });
  $('ulid').addEventListener('input', () => { state.ulid = $('ulid').value; setStatus('ulid-status', validateULID(state.ulid), 'ULID válido', 'ULID inválido'); save(); });
  $('dni').addEventListener('input', () => { state.dni = $('dni').value; setStatus('dni-status', validateDNI(state.dni), 'DNI válido', 'DNI inválido'); save(); });
  $('cbu').addEventListener('input', () => { state.cbu = $('cbu').value; setStatus('cbu-status', validateCBU(state.cbu), 'CBU válido', 'CBU inválido'); save(); });

  // Barcodes
  $('render-barcodes').addEventListener('click', () => renderBarcodes());

  // Presets fechas
  $('preset-today').addEventListener('click', () => {
    const d = new Date(); const s = d.toISOString().slice(0,10);
    $('date-from').value = s; $('date-to').value = s;
    state.dateFrom = s; state.dateTo = s;
    setStatus('date-status', true, 'Rango OK', '');
    save();
  });
  $('preset-week').addEventListener('click', () => {
    const to = new Date();
    const from = new Date(Date.now() - 6*24*3600*1000);
    const sFrom = from.toISOString().slice(0,10);
    const sTo = to.toISOString().slice(0,10);
    $('date-from').value = sFrom; $('date-to').value = sTo;
    state.dateFrom = sFrom; state.dateTo = sTo;
    setStatus('date-status', true, 'Rango OK', '');
    save();
  });
  $('preset-month').addEventListener('click', () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const sFrom = from.toISOString().slice(0,10);
    const sTo = now.toISOString().slice(0,10);
    $('date-from').value = sFrom; $('date-to').value = sTo;
    state.dateFrom = sFrom; state.dateTo = sTo;
    setStatus('date-status', true, 'Rango OK', '');
    save();
  });
  $('date-from').addEventListener('change', () => {
    state.dateFrom = $('date-from').value;
    const ok = state.dateFrom && state.dateTo && state.dateFrom <= state.dateTo;
    setStatus('date-status', !!ok, 'Rango OK', 'Desde > Hasta');
    save();
  });
  $('date-to').addEventListener('change', () => {
    state.dateTo = $('date-to').value;
    const ok = state.dateFrom && state.dateTo && state.dateFrom <= state.dateTo;
    setStatus('date-status', !!ok, 'Rango OK', 'Desde > Hasta');
    save();
  });

  // Montos
  $('gen-amount').addEventListener('click', () => {
    const ccy = $('currency').value;
    const min = Number($('amount-min').value);
    const max = Number($('amount-max').value);
    if (!isFinite(min) || !isFinite(max) || max <= min) {
      setStatus('amount-status', false, '', 'Rango inválido');
      return;
    }
    const val = randomBetween(min, max);
    state.amountOut = formatMoney(val, ccy);
    $('amount-out').value = state.amountOut;
    setStatus('amount-status', true, 'Monto generado', '');
    save();
  });

  // Pedido
  $('gen-order').addEventListener('click', () => {
    const pref = ($('order-prefix').value || 'ORD').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10);
    const stamp = yyyymmdd(new Date());
    const rnd = Math.floor(Math.random()*1e6).toString().padStart(6,'0');
    state.orderOut = `${pref}-${stamp}-${rnd}`;
    $('order-out').value = state.orderOut;
    setStatus('order-status', true, 'Generado', '');
    save();
  });

  // Patrón
  $('gen-pattern').addEventListener('click', () => {
    const expr = $('pattern-exp').value || '';
    state.patternOut = generateFromPattern(expr);
    $('pattern-out').value = state.patternOut;
    setStatus('pattern-status', true, 'Generado', '');
    save();
  });

  // Export JSON
  $('btn-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'session.json'; a.click();
    URL.revokeObjectURL(url);
  });
  $('btn-export-csv').addEventListener('click', () => exportCSV(state));

  // Reset (si tenés un botón con ese id en el header/footer)
  const resetBtn = $('btn-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem(LS_KEY);
      toast('Datos locales borrados');
      setTimeout(() => window.location.reload(), 400);
    });
  }
});
