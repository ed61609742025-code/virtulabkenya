const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function getLocalDateString(d = new Date()) {
  const date = d instanceof Date ? d : new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysBetween(dateStrA, dateStrB) {
  const [y1, m1, d1] = dateStrA.split('-').map(Number);
  const [y2, m2, d2] = dateStrB.split('-').map(Number);
  const t1 = Date.UTC(y1, m1 - 1, d1);
  const t2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((t1 - t2) / (1000 * 60 * 60 * 24));
}

function createStreakEngine(initialStorage = {}) {
  let storage = { ...initialStorage };
  const STORAGE_KEY = 'vlk_streak_data';

  function getStreakData() {
    try {
      const raw = storage[STORAGE_KEY];
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      count: 1,
      longest: 1,
      lastActiveDate: null,
      freezeCount: 1
    };
  }

  function saveStreakData(data) {
    storage[STORAGE_KEY] = JSON.stringify(data);
  }

  function logPracticeActivity(simulatedDate) {
    const data = getStreakData();
    const todayStr = simulatedDate ? getLocalDateString(simulatedDate) : getLocalDateString();

    if (!data.lastActiveDate) {
      data.count = 1;
      data.longest = 1;
      data.lastActiveDate = todayStr;
      saveStreakData(data);
      return data;
    }

    if (data.lastActiveDate === todayStr) {
      saveStreakData(data);
      return data; // Already counted for today
    }

    const diffDays = getDaysBetween(todayStr, data.lastActiveDate);

    if (diffDays === 1) {
      data.count += 1;
    } else if (diffDays === 2 && data.freezeCount > 0) {
      data.freezeCount -= 1;
      data.count += 1;
    } else if (diffDays > 1) {
      data.count = 1;
    }

    data.longest = Math.max(data.longest || 1, data.count);
    data.lastActiveDate = todayStr;
    saveStreakData(data);
    return data;
  }

  function calculateStreakFromSessions(sessions, simulatedToday) {
    if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
      return getStreakData();
    }

    const dateSet = new Set();
    sessions.forEach(s => {
      const raw = s.created_at || s.date || s.timestamp;
      if (raw) {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
          dateSet.add(getLocalDateString(d));
        }
      }
    });

    const uniqueDates = Array.from(dateSet).sort().reverse();
    if (uniqueDates.length === 0) {
      return getStreakData();
    }

    const todayStr = simulatedToday ? getLocalDateString(simulatedToday) : getLocalDateString();
    const latestDate = uniqueDates[0];
    const diffFromToday = getDaysBetween(todayStr, latestDate);

    let count = 1;
    if (diffFromToday === 0 || diffFromToday === 1) {
      count = 1;
      let currDate = latestDate;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = uniqueDates[i];
        const diff = getDaysBetween(currDate, prevDate);
        if (diff === 1) {
          count++;
          currDate = prevDate;
        } else {
          break;
        }
      }
    } else {
      count = 1;
    }

    const data = getStreakData();
    data.count = Math.max(data.count, count);
    data.longest = Math.max(data.longest || 1, data.count);
    data.lastActiveDate = latestDate;
    saveStreakData(data);
    return data;
  }

  return { getStreakData, saveStreakData, logPracticeActivity, calculateStreakFromSessions, getStorage: () => storage };
}

describe('Gamification Streak Engine Standards', () => {
  it('1. should persist streak on first call instead of staying null', () => {
    const engine = createStreakEngine();
    assert.strictEqual(engine.getStorage()['vlk_streak_data'], undefined);
    const res = engine.logPracticeActivity();
    assert.strictEqual(res.count, 1);
    assert.ok(engine.getStorage()['vlk_streak_data'], 'Streak must be saved to localStorage on first call');
  });

  it('2. should increment streak on consecutive days', () => {
    const engine = createStreakEngine();
    const day1 = new Date('2026-11-01T10:00:00');
    const day2 = new Date('2026-11-02T14:30:00');
    const day3 = new Date('2026-11-03T09:15:00');

    engine.logPracticeActivity(day1);
    assert.strictEqual(engine.getStreakData().count, 1);

    engine.logPracticeActivity(day2);
    assert.strictEqual(engine.getStreakData().count, 2);

    engine.logPracticeActivity(day3);
    assert.strictEqual(engine.getStreakData().count, 3);
  });

  it('3. should maintain streak if practiced multiple times on the same day', () => {
    const engine = createStreakEngine();
    const day1_am = new Date('2026-11-01T08:00:00');
    const day1_pm = new Date('2026-11-01T19:00:00');

    engine.logPracticeActivity(day1_am);
    assert.strictEqual(engine.getStreakData().count, 1);

    engine.logPracticeActivity(day1_pm);
    assert.strictEqual(engine.getStreakData().count, 1);
  });

  it('4. should use streak freeze when 1 day is missed', () => {
    const engine = createStreakEngine();
    const day1 = new Date('2026-11-01T10:00:00');
    const day3 = new Date('2026-11-03T10:00:00'); // missed Nov 2

    engine.logPracticeActivity(day1);
    assert.strictEqual(engine.getStreakData().count, 1);
    assert.strictEqual(engine.getStreakData().freezeCount, 1);

    engine.logPracticeActivity(day3);
    assert.strictEqual(engine.getStreakData().count, 2, 'Streak should increment using freeze');
    assert.strictEqual(engine.getStreakData().freezeCount, 0, 'Streak freeze should be consumed');
  });

  it('5. should reset streak if multiple days are missed without freeze', () => {
    const engine = createStreakEngine();
    const day1 = new Date('2026-11-01T10:00:00');
    const day5 = new Date('2026-11-05T10:00:00');

    engine.logPracticeActivity(day1);
    engine.logPracticeActivity(day5);
    assert.strictEqual(engine.getStreakData().count, 1);
  });

  it('6. should calculate multi-day streak accurately from historical database sessions', () => {
    const engine = createStreakEngine();
    const simulatedToday = new Date('2026-11-04T12:00:00');
    const sessions = [
      { created_at: '2026-11-04T10:00:00Z' },
      { created_at: '2026-11-04T08:00:00Z' },
      { created_at: '2026-11-03T14:00:00Z' },
      { created_at: '2026-11-02T16:00:00Z' },
      { created_at: '2026-11-01T11:00:00Z' },
      { created_at: '2026-10-25T09:00:00Z' } // gap before Nov 1
    ];

    const result = engine.calculateStreakFromSessions(sessions, simulatedToday);
    assert.strictEqual(result.count, 4, 'Should detect 4-day consecutive active streak (Nov 1-4)');
    assert.strictEqual(result.longest, 4);
    assert.ok(engine.getStorage()['vlk_streak_data']);
  });
});
