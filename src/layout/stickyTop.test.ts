import { stickyTop } from './stickyTop';

describe('stickyTop', () => {
  it.each([
    ['short column pins to the top offset', 88, 800, 300, 24, 88],
    ['column fitting exactly below the offset', 88, 800, 688, 24, 88],
    ['tall column stops when its bottom is visible', 88, 800, 2000, 24, -1224],
    ['column slightly taller than the space', 88, 800, 720, 24, 56],
  ])('%s', (_name, offset, viewport, height, gap, expected) => {
    expect(stickyTop(offset, viewport, height, gap)).toBe(expected);
  });
});
