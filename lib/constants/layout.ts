export const LAYOUT = {
  NODE: {
    WIDTH: 216,  // minWidth(180) + padding(32) + border(4)
    HEIGHT: 52,  // padding(24) + text(14) + border(4) + line-height(10)
  },
  GRID: {
    HORIZONTAL_SPACING: 250,  // NODE_WIDTH (180) + margin (70)
    VERTICAL_SPACING: 120,     // row spacing
    COLUMNS: 4,                 // nodes per row
    START_X: 100,
    START_Y: 100,
  },
  MENU: {
    WIDTH: 192,
    HEIGHT: 400,
  },
  VIEWPORT: {
    FULL_HEIGHT: '100vh' as const,
  },
} as const;
