import { shuffleArray, generateId, formatTime, calculatePercentage } from '../utils';

describe('shuffleArray', () => {
  it('zwraca tablicę tej samej długości', () => {
    expect(shuffleArray([1, 2, 3, 4, 5])).toHaveLength(5);
  });

  it('zawiera te same elementy co oryginał', () => {
    const input = [1, 2, 3, 4, 5];
    expect(shuffleArray(input).sort()).toEqual([...input].sort());
  });

  it('nie mutuje oryginalnej tablicy', () => {
    const input = [1, 2, 3];
    const copy = [...input];
    shuffleArray(input);
    expect(input).toEqual(copy);
  });

  it('pusta tablica zwraca pustą tablicę', () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it('tablica z jednym elementem zwraca ten sam element', () => {
    expect(shuffleArray([42])).toEqual([42]);
  });
});

describe('generateId', () => {
  it('zwraca niepusty string', () => {
    expect(typeof generateId()).toBe('string');
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('kolejne wywołania zwracają różne id', () => {
    const ids = Array.from({ length: 20 }, generateId);
    const unique = new Set(ids);
    expect(unique.size).toBe(20);
  });
});

describe('formatTime', () => {
  it('0 sekund → "0:00"', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('59 sekund → "0:59"', () => {
    expect(formatTime(59)).toBe('0:59');
  });

  it('60 sekund → "1:00"', () => {
    expect(formatTime(60)).toBe('1:00');
  });

  it('65 sekund → "1:05"', () => {
    expect(formatTime(65)).toBe('1:05');
  });

  it('120 sekund → "2:00"', () => {
    expect(formatTime(120)).toBe('2:00');
  });
});

describe('calculatePercentage', () => {
  it('zwraca 0 gdy total = 0', () => {
    expect(calculatePercentage(0, 0)).toBe(0);
  });

  it('zwraca 50 dla (5, 10)', () => {
    expect(calculatePercentage(5, 10)).toBe(50);
  });

  it('zaokrągla do pełnych procent', () => {
    expect(calculatePercentage(1, 3)).toBe(33);
  });

  it('zwraca 100 gdy value = total', () => {
    expect(calculatePercentage(7, 7)).toBe(100);
  });
});
