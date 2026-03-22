const DEFAULT_FONT_FAMILY = '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Source Han Sans SC", sans-serif';
const BUILTIN_FONT_FAMILY = '"Alibaba PuHuiTi 3", ' + DEFAULT_FONT_FAMILY;

export const state = {
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
  outline: false,
  lastSVG: '',
  lastName: '',
  currentOptions: {},
};

export { DEFAULT_FONT_FAMILY, BUILTIN_FONT_FAMILY };
