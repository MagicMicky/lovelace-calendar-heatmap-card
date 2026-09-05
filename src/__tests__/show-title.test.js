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
