'use strict';
/* Orbit · src/ephemeris.js
   The ephemeris: an almanac leaf of the daily plates, month by month, and the way back into any plate
   the player drew on the day it was current. */
// ---------- The ephemeris: a ruled almanac of the daily plates ----------
// A month table over the plate, in the same hand as the catalogue leaf. Every square of the month is
// printed; only the days the log holds — which is to say the days that were drawn while they were the
// current day — are set as entries that can be drawn again, and today's square is always open. Nothing
// here reaches the simulation: choosing a day only names the plate the next run is dealt from.
const MONTHS_LATIN=['Ianuarius','Februarius','Martius','Aprilis','Maius','Iunius','Iulius','Augustus','September','October','November','December'];
// The planetary week, as an almanac heads its columns: dies Solis through dies Saturni.
const WEEKDAYS_LATIN=['Solis','Lunae','Martis','Mercurii','Iovis','Veneris','Saturni'];
const ROMAN_SIGNS=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
function roman(value){
  let left=Math.max(0,Math.floor(Number(value)||0)),out='';
  for(const [step,sign] of ROMAN_SIGNS)while(left>=step){out+=sign;left-=step;}
  return out||'—';
}
const pad2=n=>String(n).padStart(2,'0');
const dayKey=(y,m,d)=>y+'-'+pad2(m+1)+'-'+pad2(d);
const monthOf=date=>({y:Number(date.slice(0,4)),m:Number(date.slice(5,7))-1});
const monthIndex=month=>month.y*12+month.m;
// Both ends of the almanac: the month of the earliest plate on record, and the current month. There is
// nothing to leaf to on either side of those.
function ephemerisSpan(){
  const drawn=dailyDates(),last=monthOf(utcDay());
  return {first:monthOf(drawn.length?drawn[0]:utcDay()),last};
}
let ephemerisOpen=false,ephMonth=monthOf(utcDay());
function monthDays(month){return new Date(Date.UTC(month.y,month.m+1,0)).getUTCDate();}
function monthLead(month){return new Date(Date.UTC(month.y,month.m,1)).getUTCDay();}
function renderEphemeris(){
  const body=$('ephemeris-body');if(!body)return;
  const today=utcDay(),lead=monthLead(ephMonth),days=monthDays(ephMonth);
  let html='<div class="eph-grid">';
  for(const name of WEEKDAYS_LATIN)html+=`<span class="eph-head" title="dies ${name}">${name.slice(0,3)}</span>`;
  for(let i=0;i<lead;i++)html+='<span class="eph-cell eph-void" aria-hidden="true"></span>';
  for(let d=1;d<=days;d++){
    const date=dayKey(ephMonth.y,ephMonth.m,d),entry=dailyLog[date],numeral=`<span class="eph-num">${d}</span>`;
    if(date>today){html+=`<span class="eph-cell eph-hence">${numeral}</span>`;continue;}
    if(!entry&&date!==today){html+=`<span class="eph-cell eph-blank">${numeral}<span class="eph-rule" aria-hidden="true"></span></span>`;continue;}
    const chosen=dailyOn&&dailyDay===date;
    const foot=entry?`<span class="eph-best">${entry.best}</span>`:'<span class="eph-best eph-hodie">hodie</span>';
    const label=entry?`Draw the plate of ${date} again, best ${entry.best}`:`Draw today’s plate, ${date}`;
    html+=`<button class="eph-cell eph-drawn${date===today?' eph-today':''}" type="button" data-date="${date}" aria-pressed="${chosen}" aria-label="${label}">${numeral}${foot}</button>`;
  }
  // The table is ruled square: the squares either side of the month are printed empty rather than left off.
  for(let i=(lead+days)%7;i&&i<7;i++)html+='<span class="eph-cell eph-void" aria-hidden="true"></span>';
  html+='</div>';
  body.innerHTML=html;
  const title=$('eph-title');if(title)title.textContent=MONTHS_LATIN[ephMonth.m]+' · '+roman(ephMonth.y);
  const span=ephemerisSpan(),here=monthIndex(ephMonth);
  for(const [id,spent] of [['eph-prev',here<=monthIndex(span.first)],['eph-next',here>=monthIndex(span.last)]]){
    const arrow=$(id);if(!arrow)continue;
    arrow.disabled=spent;arrow.classList.toggle('spent',spent);
  }
  const note=$('eph-note');
  if(note){
    const count=dailyDates().length;
    note.textContent=count?count+' plate'+(count===1?'':'s')+' drawn · a plate opens here only on the day it was drawn'
      :'No plate drawn yet · a plate opens here only on the day it was drawn';
  }
}
function leafMonth(by){
  const span=ephemerisSpan(),moved=new Date(Date.UTC(ephMonth.y,ephMonth.m+by,1));
  const next={y:moved.getUTCFullYear(),m:moved.getUTCMonth()};
  if(monthIndex(next)<monthIndex(span.first)||monthIndex(next)>monthIndex(span.last))return;
  ephMonth=next;renderEphemeris();
  if(audio.enabled)audio.brush(1400,.1);
}
function openEphemeris(){
  if(catalogueOpen)closeCatalogue();
  ephemerisOpen=true;ephMonth=monthOf(dailyOn?dailyDay:utcDay());renderEphemeris();
  $('ephemeris').classList.remove('hidden');$('ephemeris').setAttribute('aria-hidden','false');
  $('ephemeris-open').setAttribute('aria-expanded','true');
  game.classList.add('cataloguing');
  if(audio.enabled)audio.brush(1200,.14);
}
function closeEphemeris(){
  ephemerisOpen=false;
  $('ephemeris').classList.add('hidden');$('ephemeris').setAttribute('aria-hidden','true');
  $('ephemeris-open').setAttribute('aria-expanded','false');
  game.classList.remove('cataloguing');
}
$('ephemeris-open').addEventListener('click',()=>{if(ephemerisOpen)closeEphemeris();else openEphemeris();});
$('ephemeris-close').addEventListener('click',()=>closeEphemeris());
$('eph-prev').addEventListener('click',()=>leafMonth(-1));
$('eph-next').addEventListener('click',()=>leafMonth(1));
$('ephemeris').addEventListener('pointerdown',e=>{if(e.stopPropagation)e.stopPropagation();});
// A day is chosen, the plate is dealt from it, and the leaf is closed onto the frontispiece so the next
// tap begins that plate rather than the ordinary one.
$('ephemeris-body').addEventListener('click',e=>{
  const cell=e.target&&e.target.closest?e.target.closest('button[data-date]'):null;
  if(!cell)return;
  if(!replayDaily(cell.getAttribute('data-date')))return;
  renderEphemeris();closeEphemeris();
  if(audio.enabled)audio.tone(659.25,.3,0,.16);
});
