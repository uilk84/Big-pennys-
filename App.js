const API_KEY = "ulQA9P7NZIQgGpYn5vNT7TUsDptthjP_";
const REFRESH_MS = 15000;

let audioUnlocked = false;
let alertSound;

/* ---------- UTIL ---------- */
function fmt(v){
  if(v==null) return '-';
  return v>=1e6?(v/1e6).toFixed(1)+'M'
       :v>=1e3?(v/1e3).toFixed(0)+'K'
       :v;
}

/* ---------- AUDIO + VIBRATION ---------- */
function unlockAudio(){
  if(audioUnlocked) return;
  alertSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
  alertSound.play().then(()=>{
    audioUnlocked = true;
    alert("Sound alerts enabled");
  }).catch(()=>{
    alert("Tap again to enable sound");
  });
}

function playAlert(){
  if(alertSound){
    alertSound.currentTime = 0;
    alertSound.play().catch(()=>{});
  }
  if(navigator.vibrate){
    navigator.vibrate([300,100,300]);
  }
}

/* ---------- TIME WINDOW ---------- */
function premarketEnabled(){
  return localStorage.getItem('premarket') === 'on';
}

function inTradeWindow(){
  if(premarketEnabled()) return true;
  const d=new Date(), t=d.getHours()*60+d.getMinutes();
  return (t>=570&&t<=690)||(t>=930&&t<=960);
}

/* ---------- SCORING ---------- */
function score(x){
  let s=0;
  s+=Math.min(35,x.vs*20);
  s+=Math.max(0,25-(Math.abs((x.p/x.hod)-1)*800));
  s+=Math.min(20,x.c*2);
  s+=x.p>=0.3&&x.p<=5?10:0;
  return Math.round(s);
}

/* ---------- ALERT STORAGE ---------- */
function getAlerts(){
  return JSON.parse(localStorage.getItem('alerts') || '[]');
}
function saveAlerts(a){
  localStorage.setItem('alerts', JSON.stringify(a));
}
function addAlert(sym, breakout, invalid){
  if(!sym || !breakout || !invalid){
    alert("Symbol, breakout, and invalidation required");
    return;
  }
  const a = getAlerts();
  a.push({sym:sym.toUpperCase(), breakout:+breakout, invalid:+invalid, hit:false});
  saveAlerts(a);
  alert(sym.toUpperCase()+" alert saved");
}

function checkAlerts(stocks){
  const alerts = getAlerts();
  let fired = false;

  alerts.forEach(a=>{
    if(a.hit) return;
    const s = stocks.find(x=>x.sym===a.sym);
    if(!s) return;

    if(s.p >= a.breakout){
      a.hit = true;
      playAlert();
      alert(`🚨 ${a.sym} BREAKOUT @ ${a.breakout}`);
      fired = true;
    }
    if(s.p <= a.invalid){
      a.hit = true;
      playAlert();
      alert(`❌ ${a.sym} INVALIDATED @ ${a.invalid}`);
      fired = true;
    }
  });

  if(fired) saveAlerts(alerts);
}
