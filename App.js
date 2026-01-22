const API_KEY = "ulQA9P7NZIQgGpYn5vNT7TUsDptthjP_";
const REFRESH_MS = 15000;

function fmt(v){
  if(v==null) return '-';
  return v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'K':v;
}

function premarketEnabled(){
  return localStorage.getItem('premarket') === 'on';
}

function inTradeWindow(){
  if (premarketEnabled()) return true;
  const d=new Date(), t=d.getHours()*60+d.getMinutes();
  return (t>=570&&t<=690)||(t>=930&&t<=960);
}

function score(x){
  let s=0;
  s+=Math.min(35,x.vs*20);
  s+=Math.max(0,25-(Math.abs((x.p/x.hod)-1)*800));
  s+=Math.min(20,x.c*2);
  s+=x.p>=0.3&&x.p<=5?10:0;
  return Math.round(s);
}