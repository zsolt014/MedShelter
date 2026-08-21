/* ================= NAPTÁR ================= */
let calendarYear = 2026;
let calendarMonth = 7; // 0-indexelt: 7 = augusztus

const monthNames = ['Január','Február','Március','Április','Május','Június','Július','Augusztus','Szeptember','Október','November','December'];

function shiftMonth(delta){
  calendarMonth += delta;
  if(calendarMonth > 11){ calendarMonth = 0; calendarYear++; }
  if(calendarMonth < 0){ calendarMonth = 11; calendarYear--; }
  renderCalendar();
}

function getCalendarEvents(){
  const events = {}; // 'YYYY.MM.DD' -> [{label, color}]
  function addEvent(dateStr, label, color){
    if(!events[dateStr]) events[dateStr] = [];
    events[dateStr].push({ label, color });
  }
  residents.forEach(r => {
    r.medications.forEach(m => addEvent(m.next, `${r.name.split(' ')[0]} – ${m.name}`, 'red'));
    r.letters.forEach(l => addEvent(l.valid, `${r.name.split(' ')[0]} – ${l.specialty}`, 'orange'));
  });
  addEvent('2026.08.24', 'Tervezett kardiológiai vizsgálat', 'blue');
  addEvent('2026.08.27', 'Tervezett pszichiátriai vizit', 'blue');
  return events;
}

function renderCalendar(){
  document.getElementById('calendarMonthLabel').textContent = `${monthNames[calendarMonth]} ${calendarYear}`;
  const grid = document.getElementById('calendarGrid');
  const events = getCalendarEvents();

  const dows = ['H','K','Sze','Cs','P','Szo','V'];
  let html = dows.map(d => `<div class="calendar-dow">${d}</div>`).join('');

  const firstDay = new Date(calendarYear, calendarMonth, 1);
  let startOffset = firstDay.getDay() - 1; // hétfő=0
  if(startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

  for(let i = 0; i < startOffset; i++){
    html += `<div class="calendar-cell empty"></div>`;
  }

  const isCurrentMonth = (calendarYear === 2026 && calendarMonth === 7);

  for(let day = 1; day <= daysInMonth; day++){
    const dateStr = `${calendarYear}.${String(calendarMonth+1).padStart(2,'0')}.${String(day).padStart(2,'0')}`;
    const dayEvents = events[dateStr] || [];
    const isToday = isCurrentMonth && day === 20;

    const eventsHtml = dayEvents.slice(0, 3).map(ev => `<div class="calendar-event ${ev.color}">${escapeHtml(ev.label)}</div>`).join('');

    html += `
      <div class="calendar-cell ${isToday ? 'today' : ''}">
        <div class="calendar-daynum">${day}</div>
        <div class="calendar-events">${eventsHtml}</div>
      </div>`;
  }

  grid.innerHTML = html;
}