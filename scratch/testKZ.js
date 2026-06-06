function checkSessions(data) {
  const SESSIONS = [
    { name: 'Asia', startH: 20, startM: 0, endH: 23, endM: 59, color: 'rgba(59, 130, 246, 0.15)', pivotColor: '#3b82f6' },
    { name: 'London', startH: 2, startM: 0, endH: 5, endM: 0, color: 'rgba(239, 68, 68, 0.15)', pivotColor: '#ef4444' },
    { name: 'NY AM', startH: 9, startM: 30, endH: 11, endM: 0, color: 'rgba(16, 185, 129, 0.15)', pivotColor: '#10b981' },
    { name: 'NY Lunch', startH: 12, startM: 0, endH: 13, endM: 0, color: 'rgba(234, 179, 8, 0.15)', pivotColor: '#eab308' },
    { name: 'NY PM', startH: 13, startM: 30, endH: 16, endM: 0, color: 'rgba(168, 85, 247, 0.15)', pivotColor: '#a855f7' },
  ];

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  });

  const boxes = [];
  let activeSession = null;
  let activeSessionIndex = -1;

  for (let i = 0; i < data.length; i++) {
    const candle = data[i];
    const parts = formatter.formatToParts(candle.timestamp);
    const hour = parseInt(parts.find(p => p.type === 'hour').value);
    const minute = parseInt(parts.find(p => p.type === 'minute').value);
    const timeValue = hour * 60 + minute;

    if (!activeSession) {
      for (const s of SESSIONS) {
        const sStart = s.startH * 60 + s.startM;
        const sEnd = s.endH * 60 + s.endM;
        if (timeValue >= sStart && timeValue <= sEnd) {
          activeSession = { ...s, startIdx: candle.timestamp, endIdx: candle.timestamp, high: candle.high, low: candle.low, highMitigatedAt: null, lowMitigatedAt: null };
          activeSessionIndex = i;
          break;
        }
      }
    } else {
      const sStart = activeSession.startH * 60 + activeSession.startM;
      const sEnd = activeSession.endH * 60 + activeSession.endM;
      
      let isInside = false;
      if (sStart <= sEnd) {
        isInside = timeValue >= sStart && timeValue <= sEnd;
      } else {
        isInside = timeValue >= sStart || timeValue <= sEnd;
      }

      if (isInside) {
        activeSession.endIdx = candle.timestamp;
        activeSession.high = Math.max(activeSession.high, candle.high);
        activeSession.low = Math.min(activeSession.low, candle.low);
      } else {
        boxes.push({ ...activeSession });
        activeSession = null;
      }
    }

    // Check for mitigations on existing boxes
    for (const box of boxes) {
      if (!box.highMitigatedAt && candle.timestamp > box.endIdx) {
        if (candle.high >= box.high) box.highMitigatedAt = candle.timestamp;
      }
      if (!box.lowMitigatedAt && candle.timestamp > box.endIdx) {
        if (candle.low <= box.low) box.lowMitigatedAt = candle.timestamp;
      }
    }
  }
  
  if (activeSession) {
    boxes.push(activeSession);
  }

  // Extend unmitigated lines to the end of the data
  for (const box of boxes) {
    if (!box.highMitigatedAt) box.highMitigatedAt = data[data.length - 1].timestamp;
    if (!box.lowMitigatedAt) box.lowMitigatedAt = data[data.length - 1].timestamp;
  }

  return boxes;
}

const fakeData = [
  { timestamp: new Date('2023-01-01T13:00:00Z').getTime(), high: 100, low: 90 }, // NY 08:00
  { timestamp: new Date('2023-01-01T14:30:00Z').getTime(), high: 110, low: 95 }, // NY 09:30 (NY AM START)
  { timestamp: new Date('2023-01-01T15:00:00Z').getTime(), high: 120, low: 100 }, // NY 10:00
  { timestamp: new Date('2023-01-01T16:00:00Z').getTime(), high: 105, low: 95 }, // NY 11:00 (NY AM END)
  { timestamp: new Date('2023-01-01T16:30:00Z').getTime(), high: 100, low: 90 }, // NY 11:30 
  { timestamp: new Date('2023-01-01T17:30:00Z').getTime(), high: 125, low: 90 }, // NY 12:30 (Mitigates High)
]

console.log(checkSessions(fakeData));
