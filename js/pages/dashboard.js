/* ================= DASHBOARD ================= */
/* Minden számot és figyelmeztetést a ténylegesen felvitt lakó-, gyógyszer-,
   szakorvosi levél- és buletin-adatokból számol ki, minden alkalommal amikor
   meghívódik (belépéskor, fülváltáskor, és minden adatmódosítás után). */

function setStatValue(id, value){
  const el = document.getElementById(id);
  if(el) el.textContent = value;
}

function renderAlertList(containerId, items, dotClass, emptyText){
  const el = document.getElementById(containerId);
  if(!el) return;
  if(items.length === 0){
    el.innerHTML = `<li class="empty">${escapeHtml(emptyText)}</li>`;
    return;
  }
  el.innerHTML = items.map(text => `<li><span class="dot ${dotClass}"></span>${escapeHtml(text)}</li>`).join('');
}

function renderDashboard(){
  if(typeof residents === 'undefined') return;

  let activeMedsCount = 0;
  let expiringMedsCount = 0;
  let expiringLettersCount = 0;
  let expiringBuletinCount = 0;

  const urgentItems = [];
  const todayItems = [];
  const soonItems = [];

  function classify(diff, urgentText, todayText, soonText){
    if(diff < 0) urgentItems.push(urgentText);
    else if(diff <= 3) todayItems.push(todayText);
    else if(diff <= 30) soonItems.push(soonText);
  }

  residents.forEach(r => {
    activeMedsCount += r.medications.length;

    r.medications.forEach(m => {
      const diff = daysUntil(m.next);
      if(diff <= 30) expiringMedsCount++;
      classify(
        diff,
        `${r.name} gyógyszeriratása (${m.name}) ${Math.abs(diff)} napja lejárt.`,
        diff === 0
          ? `${r.name} – ${m.name} gyógyszert ma kell íratni.`
          : `${r.name} – ${m.name} gyógyszeriratás ${diff} nap múlva esedékes.`,
        `${r.name} – ${m.name} gyógyszeriratás ${diff} nap múlva esedékes.`
      );
    });

    r.letters.forEach(l => {
      const diff = daysUntil(l.valid);
      if(diff <= 30) expiringLettersCount++;
      classify(
        diff,
        `${r.name} ${l.specialty} szakorvosi levele ${Math.abs(diff)} napja lejárt.`,
        `${r.name} – ${l.specialty} levél ${diff === 0 ? 'ma jár le' : diff + ' nap múlva jár le'}.`,
        `${r.name} – ${l.specialty} levele ${diff} nap múlva jár le.`
      );
    });

    if(r.buletinExpiry){
      const diff = daysUntil(r.buletinExpiry);
      if(diff <= 30) expiringBuletinCount++;
      classify(
        diff,
        `${r.name} buletinje (${r.buletinNumber || 'szám nélkül'}) ${Math.abs(diff)} napja lejárt.`,
        `${r.name} buletinje ${diff === 0 ? 'ma jár le' : diff + ' nap múlva jár le'}.`,
        `${r.name} buletinje ${diff} nap múlva jár le.`
      );
    }
  });

  setStatValue('statResidentsCount', residents.length);
  setStatValue('statActiveMedsCount', activeMedsCount);
  setStatValue('statExpiringMedsCount', expiringMedsCount);
  setStatValue('statExpiringLettersCount', expiringLettersCount);
  setStatValue('statExpiringBuletinCount', expiringBuletinCount);

  renderAlertList('alertUrgentList', urgentItems, 'urgent', 'Nincs lejárt tétel.');
  renderAlertList('alertTodayList', todayItems, 'today', 'Nincs ma esedékes teendő.');
  renderAlertList('alertSoonList', soonItems, 'soon', 'Nincs 30 napon belül lejáró tétel.');
}
