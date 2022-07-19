import { uuid4 } from 'sentry/uuid';

describe('uuidv4', () => {
  it('should generate unique uuid everytime', () => {
    const uuid1 = uuid4();
    const uuid2 = uuid4();

    expect(uuid1).not.toEqual(uuid2);
    expect(uuid1.length).toBe(32);
  });
});
