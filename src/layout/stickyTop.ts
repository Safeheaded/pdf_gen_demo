/**
 * Top offset for a sticky column so that a column taller than the viewport
 * stops scrolling once its bottom edge is visible, while a shorter column
 * pins to the top offset.
 */
export const stickyTop = (
  topOffset: number,
  viewportHeight: number,
  elementHeight: number,
  bottomGap: number,
): number => Math.min(topOffset, viewportHeight - elementHeight - bottomGap);
