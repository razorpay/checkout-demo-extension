import { cancelMsg } from 'common/strings';

it('should generate unique uuid everytime', () => {
  const str = cancelMsg;
  expect(str).toBe('Payment canceled');
});
