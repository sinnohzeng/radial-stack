const DEFAULT_FONT_FAMILY =
  '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Source Han Sans SC", sans-serif';
const BUILTIN_FONT_FAMILY = '"Alibaba PuHuiTi 3", ' + DEFAULT_FONT_FAMILY;

function createState(initial) {
  const listeners = new Set();
  const proxy = new Proxy(initial, {
    set(target, key, value) {
      const old = target[key];
      target[key] = value;
      if (old !== value) listeners.forEach((fn) => fn(key, value, old));
      return true;
    },
  });
  proxy.onChange = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };
  return proxy;
}

export const state = createState({
  palette: 'warm',
  textStyle: 'pill',
  preset: 'square',
  resolution: '4k',
  locale: 'zh-CN',
  theme: 'dark',
  noiseLevel: 'medium',
  autoTextColor: true,
  fontFamily: BUILTIN_FONT_FAMILY,
  fontObj: null,
  outline: true,
  lastSVG: '',
  lastName: '',
  currentOptions: {},
});

export { DEFAULT_FONT_FAMILY, BUILTIN_FONT_FAMILY };
