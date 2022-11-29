import { timeConverter } from 'common/formatDate';

describe('#TimeConverter', () => {
  test('should have date as 15th Nov, 2022', () => {
    const date = 1668495062;
    expect(timeConverter(date)).toBe('15th Nov, 2022');
  });
  test('should have date as 22nd Aug, 2022', () => {
    const date = 1661158262;
    expect(timeConverter(date)).toBe('22nd Aug, 2022');
  });
  test('should have date as 31st July, 2022', () => {
    const date = 1627725062;
    expect(timeConverter(date)).toBe('31st Jul, 2021');
  });
  test('should have date as 3nd Jan, 1998', () => {
    const date = 883795862;
    expect(timeConverter(date)).toBe('3rd Jan, 1998');
  });
  test('should have date as 15th Apr, 2024', () => {
    const date = 1713174662;
    expect(timeConverter(date)).toBe('15th Apr, 2024');
  });
});
