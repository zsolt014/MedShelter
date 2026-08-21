let users = [
  { id:1, fullName:'Rendszergazda', username:'admin', password:'admin123', role:'Admin' },
  { id:2, fullName:'Kovács Ágnes', username:'agnes', password:'agnes123', role:'Dolgozó' },
  { id:3, fullName:'Nagy Béla', username:'bela', password:'bela123', role:'Vezető' }
];
let nextId = 4;
let currentUser = null;

const roleClassMap = { 'Admin':'role-admin', 'Dolgozó':'role-dolgozo', 'Vezető':'role-vezeto' };

const residents = [
  {
    id:1, name:'Baróti Sándor', room:'12', doctor:'Dr. Demese', status:'Aktív',
    birthDate:'1968.03.14', taj:'123-456-789', phone:'—', notes:'Szoba: napos oldal, mankóval közlekedik.',
    medications:[
      { id:1, name:'Aspenter', dosage:'0-1-0', qty:30, last:'2026.08.01', next:'2026.08.20' },
      { id:2, name:'Dilvas', dosage:'1-0-1', qty:60, last:'2026.07.10', next:'2026.08.10' }
    ],
    letters:[
      { specialty:'Kardiológia', doctor:'Dr. Popescu', valid:'2026.11.15' },
      { specialty:'Neurológia', doctor:'Dr. Farkas', valid:'2026.08.10' }
    ]
  },
  {
    id:2, name:'Márk Zsolt', room:'8', doctor:'Dr. Török', status:'Aktív',
    birthDate:'1975.11.02', taj:'234-567-891', phone:'—', notes:'',
    medications:[
      { id:3, name:'Teotard', dosage:'1-0-0', qty:30, last:'2026.08.15', next:'2026.09.15' }
    ],
    letters:[
      { specialty:'Pszichiátria', doctor:'Dr. Radu', valid:'2026.09.01' }
    ]
  },
  {
    id:3, name:'Nagy Béla', room:'5', doctor:'Dr. Demese', status:'Figyelendő',
    birthDate:'1959.06.21', taj:'345-678-912', phone:'—', notes:'Rendszeres vérnyomás-ellenőrzés szükséges.',
    medications:[
      { id:4, name:'Coversyl', dosage:'1-0-0', qty:30, last:'2026.07.20', next:'2026.08.20' },
      { id:5, name:'Trombex', dosage:'0-1-0', qty:30, last:'2026.07.20', next:'2026.08.20' }
    ],
    letters:[
      { specialty:'Kardiológia', doctor:'Dr. Popescu', valid:'2026.08.05' }
    ]
  },
  {
    id:4, name:'Kelemen Ilona', room:'3', doctor:'Dr. Kiss', status:'Aktív',
    birthDate:'1982.01.30', taj:'456-789-123', phone:'—', notes:'',
    medications:[
      { id:6, name:'Metfogamma', dosage:'1-0-1', qty:60, last:'2026.08.05', next:'2026.09.05' }
    ],
    letters:[
      { specialty:'Endokrinológia', doctor:'Dr. Simon', valid:'2027.02.03' }
    ]
  },
  {
    id:5, name:'Varga Tamás', room:'15', doctor:'Dr. Török', status:'Figyelendő',
    birthDate:'1990.09.12', taj:'567-891-234', phone:'—', notes:'Új beköltöző, adatlap kiegészítése folyamatban.',
    medications:[],
    letters:[]
  }
];

const historyLog = [
  { date:'08.19 10:42', user:'Admin', action:'Gyógyszer módosítva – Baróti Sándor / Aspenter' },
  { date:'08.19 09:15', user:'Kovács Ágnes', action:'Új gyógyszer felvéve – Kelemen Ilona / Metfogamma' },
  { date:'08.18 16:03', user:'Nagy Béla', action:'Szakorvosi levél frissítve – Márk Zsolt / Pszichiátria' },
  { date:'08.17 11:20', user:'Admin', action:'Új lakó felvéve – Varga Tamás' },
  { date:'08.15 08:47', user:'Kovács Ágnes', action:'Gyógyszeriratás rögzítve – Nagy Béla / Coversyl' }
];

let activeResidentId = null;
let nextResidentId = 6;
let nextMedicationId = 100;
let nextLetterId = 200;