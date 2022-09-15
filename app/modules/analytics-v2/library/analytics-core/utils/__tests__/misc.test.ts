import {
  createPluginsState,
  fitlerDisabledPlugins,
  makeContext,
} from '../misc';

const PLUGINS = [
  {
    name: 'test-plugin-1',
    loaded: () => true,
    enabled: true,
  },
  {
    name: 'test-plugin-2',
    loaded: () => true,
    enabled: false,
  },
];

describe('Misc Utils', () => {
  describe('createPluginState', () => {
    test('it should create correct initial plugin state from plugins', () => {
      const pluginsState = createPluginsState(PLUGINS);
      expect(pluginsState).toMatchObject({
        [PLUGINS[0].name]: {
          enabled: PLUGINS[0].enabled,
          loaded: expect.any(Function),
          eventQ: [],
          pendingQ: [],
          config: {
            name: PLUGINS[0].name,
            loaded: expect.any(Function),
            enabled: PLUGINS[0].enabled,
          },
        },
        [PLUGINS[1].name]: {
          enabled: PLUGINS[1].enabled,
          loaded: expect.any(Function),
          eventQ: [],
          pendingQ: [],
          config: {
            name: PLUGINS[1].name,
            loaded: expect.any(Function),
            enabled: PLUGINS[1].enabled,
          },
        },
      });
    });
  });

  describe('makeContext', () => {
    test('it should create correct default context for events', () => {
      const context = makeContext();
      expect(context).toMatchObject({
        locale: expect.any(String),
        userAgent: expect.any(String),
        referrer: expect.any(String),
        screen: {
          height: expect.any(Number),
          width: expect.any(Number),
          availHeight: expect.any(Number),
          availWidth: expect.any(Number),
          innerHeight: expect.any(Number),
          innerWidth: expect.any(Number),
        },
        platform: expect.any(String),
      });
    });
  });

  describe('filterDisabledPlugins', () => {
    test('should return all enabled plugins', () => {
      const allPlugins = createPluginsState(PLUGINS);
      const enabledPlugins = fitlerDisabledPlugins(allPlugins);

      expect(enabledPlugins).toEqual(
        expect.arrayContaining([
          // @ts-ignore
          expect.objectContaining(allPlugins['test-plugin-1']),
        ])
      );
    });
  });
});
