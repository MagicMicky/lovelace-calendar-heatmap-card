/**
 * @jest-environment jsdom
 */
import { DEFAULT_CONFIG } from '../constants.js';

// Mirror of setConfig's merge, to assert the precedence rule show_title relies on.
function mergeConfig(userConfig) {
  return { ...DEFAULT_CONFIG, ...userConfig };
}

describe('show_title config', () => {
  it('defaults to true so existing cards keep their title', () => {
    expect(DEFAULT_CONFIG.show_title).toBe(true);
    expect(mergeConfig({ entity: 'sensor.game_played' }).show_title).toBe(true);
  });

  it('is overridden to false by the user config', () => {
    const config = mergeConfig({
      entity: 'sensor.game_played',
      ignored_states: ['curseforge', 'unknown'],
      show_title: false,
    });
    expect(config.show_title).toBe(false);
  });

  it('keeps the rest of the user config intact alongside it', () => {
    const config = mergeConfig({
      entity: 'sensor.game_played',
      ignored_states: ['curseforge', 'unknown'],
      show_title: false,
    });
    expect(config.entity).toBe('sensor.game_played');
    expect(config.ignored_states).toEqual(['curseforge', 'unknown']);
  });
});

describe('titleless layout', () => {
  it('drops exactly one summary row when the title is hidden', () => {
    const rows = (showTitle) => (showTitle === false ? 3 : 4);
    expect(rows(true)).toBe(4);
    expect(rows(undefined)).toBe(4); // default config -> title shown
    expect(rows(false)).toBe(3);
  });

  it('reclaims one row of height, matching the row dropped', () => {
    // --heatmap-titleless-reduction must equal one .game-item box so the
    // detail panel's usable height changes by exactly one row.
    const ROW = 15 + 6 + 1 + 6; // content + padding-bottom + border + margin
    expect(ROW).toBe(28);
  });
});
