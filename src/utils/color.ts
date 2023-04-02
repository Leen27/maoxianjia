export function getColor(value: number, _hue: number = 360) {
    // 将数字映射到 0-240 的色相范围内
    const hue = Math.round(value * _hue);
  
    // 将饱和度设为 100%
    const saturation = 100;
  
    // 将亮度设为 50%
    const lightness = 70;
  
    // 将 HSL 颜色转换成 RGB 颜色
    const rgbColor = hslToRgb(hue, saturation, lightness);
  
    // 将 RGB 颜色值转换成 CSS 颜色格式（如 #RRGGBB）
    const cssColor = rgbToCss(rgbColor);
  
    return cssColor;
  }
  
  // 将 HSL 颜色转换成 RGB 颜色
  function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
  
    let r, g, b;
  
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
  
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
  
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
  
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  
  // 将 RGB 颜色值转换成 CSS 颜色格式（如 #RRGGBB）
  function rgbToCss(rgbColor) {
    const r = rgbColor[0];
    const g = rgbColor[1];
    const b = rgbColor[2];
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }