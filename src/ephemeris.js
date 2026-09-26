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
// The genitive the impressum's own daily row sets a date in — 'die octava Septembris', not 'die octava
// September' — kept beside the nominative rather than derived from it, since the twelve months split
// across three different declensions and no one regular rule covers all of them.
const MONTHS_LATIN_GEN=['Ianuarii','Februarii','Martii','Aprilis','Maii','Iunii','Iulii','Augusti','Septembris','Octobris','Novembris','Decembris'];
// The planetary week, as an almanac heads its columns: dies Solis through dies Saturni.
const WEEKDAYS_LATIN=['Solis','Lunæ','Martis','Mercurii','Iovis','Veneris','Saturni'];
const ROMAN_SIGNS=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
function roman(value){
  let left=Math.max(0,Math.floor(Number(value)||0)),out='';
  for(const [step,sign] of ROMAN_SIGNS)while(left>=step){out+=sign;left-=step;}
  return out||'—';
}
const pad2=n=>String(n).padStart(2,'0');
const dayKey=(y,m,d)=>y+'-'+pad2(m+1)+'-'+pad2(d);
const monthOf=date=>({y:Number(date.slice(0,4)),m:Number(date.slice(5,7))-1});
// Augsburg — the city the imprint claims — is the one place the Gregorian reform actually produced a
// riot: the city's Protestant half refused the new calendar in 1583 and kept the old one running
// alongside it, through lawsuits and an imperial standoff, until 1700. Ten days is the whole of the
// difference for the span this atlas is dated in; the leaf states both rather than picking a side.
function julianOf(y,m,d){
  const j=new Date(Date.UTC(y,m,d-10));
  return {y:j.getUTCFullYear(),m:j.getUTCMonth(),d:j.getUTCDate()};
}
// The sun's place in the zodiac is the first column of every printed ephemeris of the century; it is what
// the genre is for. The leaf names the sign the sun stands in on the month's first day and the day it
// enters the next, read off the low-precision solar longitude (the mean longitude and anomaly from J2000
// with the two leading terms of the equation of centre), which is good to a hundredth of a degree — far
// finer than a whole day needs. The day of entry is the UTC day across whose midnights the sign changes,
// the same day the rest of this leaf keeps. It is plain calendar arithmetic and never touches the RNG.
const SIGNS_IN=['Ariete','Tauro','Geminis','Cancro','Leone','Virgine','Libra','Scorpione','Sagittario','Capricorno','Aquario','Piscibus'];
const SIGNS_INTO=['Arietem','Taurum','Geminos','Cancrum','Leonem','Virginem','Libram','Scorpionem','Sagittarium','Capricornum','Aquarium','Pisces'];
const SIGNS_EN=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
function sunSign(y,m,d){
  const n=Date.UTC(y,m,d)/864e5-10957.5,g=(357.528+.9856003*n)*Math.PI/180;
  const l=280.46+.9856474*n+1.915*Math.sin(g)+.02*Math.sin(2*g);
  return Math.floor((l%360+360)%360/30);
}
function sunPlace(y,m){
  const sign=sunSign(y,m,1),days=new Date(Date.UTC(y,m+1,0)).getUTCDate();
  for(let d=1;d<=days;d++){const into=sunSign(y,m,d+1);if(into!==sign)return {sign,into,day:d};}
  return {sign,into:null,day:0};
}
// The sun's own sign, the circle with its point, is cut as a mark rather than set as a character, so the
// cut faces never have to carry a glyph only this line would use.
const SUN_MARK='<svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.4"/><circle cx="6" cy="6" r="1.05" class="eph-sun-point"/></svg>';
// The weekday columns are headed with the seven planetary characters, as every printed almanac of the
// century heads them, drawn rather than set: the cut Fell faces carry none of them, and a character a face
// never cut falls through to the phone's colour emoji. Each is a small closed or open burin figure on a
// twelve-unit square, in the order of the planetary week from dies Solis to dies Saturni.
const PLANET_SIGNS=[
  '<circle cx="6" cy="6" r="4.3"/><circle cx="6" cy="6" r="1" class="eph-sign-fill"/>',
  '<path d="M7.6 1.7A4.4 4.4 0 1 0 7.6 10.3A3.5 3.5 0 1 1 7.6 1.7Z"/>',
  '<circle cx="4.9" cy="7.2" r="3.1"/><path d="M7.1 5 10.3 1.8M7.4 1.8H10.3V4.7"/>',
  '<path d="M3.9 1C4.3 2.6 7.7 2.6 8.1 1"/><circle cx="6" cy="5" r="2.3"/><path d="M6 7.3V11.3M4.3 9.5H7.7"/>',
  '<path d="M2.6 3.3C2.8 1.4 5.8 1.3 5.7 3.5C5.6 5.3 3.4 6.7 2.4 8.1H10.2M8.2 2.3V11.2"/>',
  '<circle cx="6" cy="4.4" r="3"/><path d="M6 7.4V11.4M4.1 9.6H7.9"/>',
  '<path d="M4 1V8.2C4.6 5.8 8.5 5.4 8.4 7.8C8.3 9.3 6.8 9.8 7.6 11.3M2.3 3H5.9"/>'
];
const planetSign=i=>'<svg viewBox="0 0 12 12" aria-hidden="true">'+PLANET_SIGNS[i]+'</svg>';
// The moon's age is the first thing an almanac tells its reader, and it is a function of the date alone:
// days since the new moon of 6 January 2000 at 18:14 UTC, over the mean synodic month, read at noon UTC.
// The mean month runs up to half a day either side of the true moon, well within a day, which is all a square of the month can show. Each square gets a roundel filled
// from one limb: a hollow ring at new, a solid disc at full, the quarters half filled — lit on the right
// while the moon waxes and on the left while it wanes, as it stands in a northern sky.
const SYNODIC_MONTH=29.530588853,NEW_MOON_EPOCH=Date.UTC(2000,0,6,18,14);
function moonAge(y,m,d){const age=(Date.UTC(y,m,d,12)-NEW_MOON_EPOCH)/864e5%SYNODIC_MONTH;return age<0?age+SYNODIC_MONTH:age;}
function moonRoundel(y,m,d){
  const f=moonAge(y,m,d)/SYNODIC_MONTH,R=3.3,c=4,lit=(1-Math.cos(f*2*Math.PI))/2,t=(R*Math.abs(Math.cos(f*2*Math.PI))).toFixed(2);
  const waxing=f<.5,gibbous=lit>.5;
  let fill='';
  if(lit>.97)fill=`<circle cx="${c}" cy="${c}" r="${R}" class="eph-sign-fill"/>`;
  else if(lit>.03)fill=`<path class="eph-sign-fill" d="M${c} ${c-R}A${R} ${R} 0 0 ${waxing?1:0} ${c} ${c+R}A${t} ${R} 0 0 ${waxing===gibbous?1:0} ${c} ${c-R}Z"/>`;
  return `<svg class="eph-moon" viewBox="0 0 8 8" aria-hidden="true"><circle cx="${c}" cy="${c}" r="${R}"/>${fill}</svg>`;
}
// A streak read at the stroke of midnight would look broken before the player has had any chance to
// draw today's plate, so a blank today counts from yesterday instead; a blank yesterday too is a real
// break, and reads as zero. Longest scans every run the log holds, not only the one still open, since
// a broken streak still stands as a past record. Calendar maths is left to Date.UTC so a run crossing
// a month or year end (or February in a leap year) still counts as consecutive.
function dailyStreak(){
  const dates=new Set(dailyDates());
  const shift=(key,by)=>{
    const [y,m,d]=key.split('-').map(Number);
    const next=new Date(Date.UTC(y,m-1,d+by));
    return dayKey(next.getUTCFullYear(),next.getUTCMonth(),next.getUTCDate());
  };
  let current=0,probe=utcDay();
  if(!dates.has(probe))probe=shift(probe,-1);
  while(dates.has(probe)){current++;probe=shift(probe,-1);}
  let longest=0;
  for(const date of dates){
    if(dates.has(shift(date,-1)))continue;
    let length=1,cursor=date;
    while(dates.has(shift(cursor,1))){length++;cursor=shift(cursor,1);}
    longest=Math.max(longest,length);
  }
  return {current,longest:Math.max(longest,current)};
}
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
  WEEKDAYS_LATIN.forEach((name,i)=>{html+=`<span class="eph-head" title="dies ${name}" role="columnheader" aria-label="dies ${name}">${planetSign(i)}</span>`;});
  for(let i=0;i<lead;i++)html+='<span class="eph-cell eph-void" aria-hidden="true"></span>';
  for(let d=1;d<=days;d++){
    const date=dayKey(ephMonth.y,ephMonth.m,d),entry=dailyLog[date],jul=julianOf(ephMonth.y,ephMonth.m,d);
    const numeral=moonRoundel(ephMonth.y,ephMonth.m,d)+`<span class="eph-num">${d}</span><span class="eph-julian">${jul.d}</span>`,julLabel=`stylo veteri ${jul.d} ${MONTHS_LATIN[jul.m].slice(0,3)}.`;
    if(date>today){html+=`<span class="eph-cell eph-hence">${numeral}</span>`;continue;}
    if(!entry&&date!==today){html+=`<span class="eph-cell eph-blank">${numeral}<span class="eph-rule" aria-hidden="true"></span></span>`;continue;}
    const chosen=dailyOn&&dailyDay===date;
    const foot=entry?`<span class="eph-best">${entry.best}</span>`:'<span class="eph-best eph-hodie">hodie</span>';
    const label=(entry?`Draw the plate of ${date} again, best ${entry.best}`:`Draw today’s plate, ${date}`)+`, ${julLabel}`;
    html+=`<button class="eph-cell eph-drawn${date===today?' eph-today':''}" type="button" data-date="${date}" aria-pressed="${chosen}" aria-label="${label}">${numeral}${foot}</button>`;
  }
  // The table is ruled square: the squares either side of the month are printed empty rather than left off.
  for(let i=(lead+days)%7;i&&i<7;i++)html+='<span class="eph-cell eph-void" aria-hidden="true"></span>';
  html+='</div>';
  body.innerHTML=html;
  paintLeafFrame('eph-leaf-frame');
  const title=$('eph-title');if(title)title.textContent=MONTHS_LATIN[ephMonth.m]+' · '+roman(ephMonth.y);
  // The grid's own first ten squares always fall stylo veteri in the month before — ten days never
  // reaches back further than that, since no month this calendar keeps is shorter than twenty-eight —
  // so the header names it too, the same two-column reckoning every square in the body already keeps.
  const oldMonth=julianOf(ephMonth.y,ephMonth.m,1),titleOld=$('eph-title-old');
  if(titleOld)titleOld.textContent=MONTHS_LATIN[oldMonth.m]+' · '+roman(oldMonth.y);
  const sun=$('eph-sun');
  if(sun){
    const place=sunPlace(ephMonth.y,ephMonth.m),enters=place.into!==null;
    sun.innerHTML=SUN_MARK+'in '+SIGNS_IN[place.sign]+(enters?' · '+SIGNS_INTO[place.into]+' intrat die '+roman(place.day):'');
    sun.setAttribute('aria-label','The sun stands in '+SIGNS_EN[place.sign]+(enters?' and enters '+SIGNS_EN[place.into]+' on day '+place.day:''));
  }
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
