// Listas para el alias humano (grandes para baja colisión)
const ADJECTIVES = ["roca","noble","soberbio","claro","bravo","pleno","pardo","rápido","sereno","vivo","etéreo","granito","ámbar","cobalto","púrpura","dorado","plata","oculto","crudo","ornato","franco","recto","astro","árido","lunar","óptimo","rústico","silente","rútilo","tímido","férreo","magno","íntegro","sólido","tenaz","laurel","fresco","sabio","fibra","solar","nuevo","nítido","verde","azul","negro","blanco","ocre","seco","grave","manso","tibio","plano","largo","ancho","alto","bajo","suave","duro","limpio","pardo","casto","fiel","diestro","torre","cauto","recto","firme","valle","pampa","andino","litoral","selvático","marino","urbano","río","nube","trueno","brisa","llama","cumbre","bosque","norte","sur","este","oeste","pluma","eco","arcano","clavel","rosa","lirio","árbol","lluvia","naciente","viejo","joven","sabio","raro","clásico","moderno","ágil","ácido","bélico","básico","cóncavo","convexo","óptico","épico","ínfimo","máximo","místico","prístino"];
const NOUNS = ["paragua","castor","tundra","faro","nicho","quimera","plataforma","brújula","fogón","farallón","bastión","talle","bóveda","brote","cuenco","dársena","estuario","fragua","góndola","horno","isla","jardín","kilómetro","lago","margen","nodo","óvalo","pilar","quicio","ribera","sendero","tajo","umbra","válvula","yunque","zaguán","arroyito","barranca","caverna","duna","estepa","fresno","glaciar","hondonada","iglesia","jaula","kiosco","lanza","meandro","nave","órbita","pampa","querencia","rancho","serrana","tambo","urna","vértice","yapeyú","zorzal","puente","balcón","cantera","delta","estación","frontera","galpón","humedal","ingenio","juncal","laguna","monte","naciente","orilla","puerto","quebrada","reserva","salina","terrazas","upland","vereda","yacare","zigurat"];
const ANIMALS = ["zorro","tigre","ñandú","condor","lobo","puma","jaguar","gato","perro","halcón","gorrión","liebre","oso","caballo","yacaré","tortuga","delfín","ballena","búho","carancho","águila","búfalo","ciervo","suricata","colibrí","búfalo","andeano","ñacurutú","gavilán","paloma","cisne","cóndor","flamenco","maguari","huemul","vizcacha","coipo","carpincho","guanaco","llama","alpaca","zorrino","monarca","abeja","avispa","cigarra","langosta","manta","pulpo","salmon","trucha","gallareta","hornero","tordo","tero","pato","ganso","gallina","quebracho","calandria","chercán","martín","zorzal","picaflor","chajá","tucán"];

const LS_KEY = "testgen.session";

// Normaliza (minúsculas + quita acentos). En JS, \p{M} son los diacríticos (Mn)
function normalizeWord(w) {
  return w.toLowerCase().normalize('NFD').replace(/\p{M}+/gu, '');
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateAlias() {
  const p1 = normalizeWord(pick(ADJECTIVES));
  const p2 = normalizeWord(pick(NOUNS));
  const p3 = normalizeWord(pick(ANIMALS));
  return `${p1}.${p2}.${p3}`;
}

function gmailFromAlias(alias) {
  const stamp = new Date().toISOString().slice(0,10).replaceAll('-', '');
  return `${alias}+test${stamp}@gmail.com`;
}
function exampleMailFromAlias(alias) { return `${alias}@example.com`; }

// CUIT: prefijo 30 + 8 dígitos + DV (módulo 11)
function computeCuitDV(base10digits) {
  const weights = [5,4,3,2,7,6,5,4,3,2];
  const sum = base10digits.reduce((acc, d, i) => acc + d * weights[i], 0);
  const mod = sum % 11;
  const dv = 11 - mod;
  if (dv === 11) return 0;
  if (dv === 10) return 9;
  return dv;
}
function generateCuit() {
  const prefix = [3,0]; // empresa
  const middle = Array.from({length:8}, () => Math.floor(Math.random()*10));
  const base = prefix.concat(middle);
  const dv = computeCuitDV(base);
  const cuitDigits = base.concat([dv]);
  const str = cuitDigits.join('');
  return `${str.slice(0,2)}-${str.slice(2,10)}-${str.slice(10)}`;
}
function validateCuit(cuit) {
  const digits = cuit.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  const arr = digits.slice(0,10).split('').map(d=>+d);
  const dv = +digits[10];
  return computeCuitDV(arr) === dv;
}

// GLN (GS1) 13 dígitos — check digit EAN-13
function ean13CheckDigit(first12) {
  let sum = 0;
  for (let i=0;i<12;i++) {
    const d = first12[i];
    sum += (i % 2 === 0) ? d : d*3; // i 0-based: 0,2,4.. suman normal; 1,3,5.. *3
  }
  return (10 - (sum % 10)) % 10;
}
function generateGLN() {
  let arr = Array.from({length:12}, () => Math.floor(Math.random()*10));
  if (arr.every(d=>d===0)) arr[0] = 1;
  const cd = ean13CheckDigit(arr);
  return arr.join('') + cd.toString();
}
function validateGLN(gln) {
  const digits = gln.replace(/\D/g,'');
  if (digits.length !== 13) return false;
  const first12 = digits.slice(0,12).split('').map(d=>+d);
  const cd = +digits[12];
  return ean13CheckDigit(first12) === cd;
}

// Storage + UI helpers
function saveSession(s) { localStorage.setItem(LS_KEY, JSON.stringify(s)); }
function loadSession() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1600);
}
function setStatus(el, ok, msgOk, msgBad) {
  el.className = 'status ' + (ok ? 'ok' : 'error');
  el.textContent = ok ? `✅ ${msgOk}` : `❌ ${msgBad}`;
}

// Render
function render(session) {
  document.getElementById('alias').value = session.alias;
  const mail = session.gmail ? gmailFromAlias(session.alias) : exampleMailFromAlias(session.alias);
  session.email = mail;
  document.getElementById('email').value = mail;
  document.getElementById('use-gmail').checked = session.gmail;

  document.getElementById('cuit').value = session.cuit;
  setStatus(document.getElementById('cuit-status'), validateCuit(session.cuit), 'CUIT válido', 'CUIT inválido');

  document.getElementById('gln').value = session.gln;
  setStatus(document.getElementById('gln-status'), validateGLN(session.gln), 'GLN válido', 'GLN inválido');

  saveSession(session);
}

// Copy + Export
async function copyFrom(targetId) {
  const el = document.getElementById(targetId);
  const value = el.value;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      el.select();
      document.execCommand('copy');
    }
    toast('Copiado al portapapeles');
  } catch {
    toast('No se pudo copiar');
  }
}
function exportJSON(session) {
  const blob = new Blob([JSON.stringify(session, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'session.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  let s = loadSession();
  if (!s) {
    s = {
      alias: generateAlias(),
      email: '',
      cuit: generateCuit(),
      gln: generateGLN(),
      gmail: false,
    };
  }

  render(s);

  document.querySelectorAll('button.copy').forEach(btn => {
    btn.addEventListener('click', () => copyFrom(btn.getAttribute('data-target')));
  });

  document.getElementById('regen-alias').addEventListener('click', () => {
    s.alias = generateAlias();
    render(s);
  });

  document.getElementById('regen-cuit').addEventListener('click', () => {
    s.cuit = generateCuit();
    render(s);
  });

  document.getElementById('regen-gln').addEventListener('click', () => {
    s.gln = generateGLN();
    render(s);
  });

  document.getElementById('use-gmail').addEventListener('change', (e) => {
    s.gmail = e.target.checked;
    render(s);
  });

  document.getElementById('btn-export').addEventListener('click', () => exportJSON(s));

  document.getElementById('btn-reset').addEventListener('click', () => {
    localStorage.removeItem(LS_KEY);
    toast('Datos locales borrados');
    setTimeout(() => window.location.reload(), 400);
  });
});
