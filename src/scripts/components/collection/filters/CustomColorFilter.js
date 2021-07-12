import { OperativeFilter, COLOR_OPTIONS } from '@process-creative/slate-ajax-collection';
import { handlize } from '@process-creative/slate-theme-tools';

export const COLOR_MODE_PRODUCT = 'check-product';
export const COLOR_MODE_VARIANT = 'check-variant';
export const COLOR_MODE_COLOR = 'check-color';

export class CustomColorFilter extends OperativeFilter {
  constructor(template, handle, operation, initialColors, defaultMode) {
    super(template, handle, operation);

    if(!Swatches) throw new Error("Failed to find swatches, color filter cannot function.");

    this.colors = (initialColors||[]).map(c => c.toLowerCase());
    this.colors = this.colors.filter((c,i) => this.colors.indexOf(c) === i);
    this.mode = defaultMode || COLOR_MODE_PRODUCT;
  }

  getSetting(color) {
    if(!color) return this.colors;
    return this.colors.indexOf(color.toLowerCase()) !== -1;
  }

  getSettings() { return this.colors; }

  getSwatchByColor(color) {
    if(!color) return null;
    color = handlize(color);
    return Swatches.find(s => {
      if(s.name.toLowerCase() == color) return true;
      return (s.handles||[]).find(h => h.toLowerCase() == color);
    })
  }

  isColorSelected(color) {
    let swatch = this.getSwatchByColor(color);
    if(!swatch) return false;
    return this.colors.some(c => {
      let s2 = this.getSwatchByColor(c);
      return swatch === s2;
    })
  }

  setSetting(color, value) {
    if(value) return this.addColor(color);
    this.removeColor(color);
  }

  setSettings(colors) {
    if(!Array.isArray(colors)) colors = [ colors ];
    this.colors = colors.filter(c => c).map(c => c.toLowerCase());
    this.colors = this.colors.filter((c,i) => this.colors.indexOf(c) === i);
    this.filters.onFilterUpdate();
  }

  setColorMode(mode) {
    this.mode = mode;
    this.filters.onFilterUpdate();
  }


  addColor(c) {
    c = c.toLowerCase();
    if(this.getSetting(c)) return;
    this.colors.push(c.toLowerCase());
    this.filters.onFilterUpdate();
  }

  removeColor(c) {
    c = c.toLowerCase();
    let index = this.colors.indexOf(c);
    if(index === -1) return;
    this.colors.splice(index, 1);
    this.filters.onFilterUpdate();
  }

  filterAnd(p,v) {
    if(!this.colors.length) return true;
    let ci = this.template.getOptionIndex(p, COLOR_OPTIONS);
    if(ci === -1) return false;
    if(this.mode == COLOR_MODE_VARIANT) return this.filterAndVariant(p,v,ci);
    return this.filterAndProduct(p,v,ci);
  }

  filterAndProduct(p,v,ci) {
    return this.colors.every(c => {
      let swatch = this.getSwatchByColor(c);
      return p.variants.some(v => {
        return this.getSwatchByColor(v.options[ci]) === swatch;
      });
    })
  }

  filterAndVariant(p,v,ci) {
    return this.colors.every(c => {
      let swatch = this.getSwatchByColor(c);
      return p.variants.every(v => this.getSwatchByColor(v.options[ci]) === swatch);
    })
  }

  filterOr(p,v) {
    if(!this.colors.length) return true;
    let ci = this.template.getOptionIndex(p, COLOR_OPTIONS);
    if(ci === -1) return false;
    if(this.mode == COLOR_MODE_VARIANT) return this.filterOrVariant(p,v,ci);
    if(this.mode == COLOR_MODE_COLOR) return this.filterOrColor(p,v,ci);
    return this.filterOrProduct(p,v,ci);
  }

  filterOrProduct(p,v,ci) {
    return this.colors.some(c => {
      let swatch = this.getSwatchByColor(c);
      return p.variants.some(v => {
        return this.getSwatchByColor(v.options[ci]) === swatch;
      });
    });
  }

  filterOrColor(p,v,ci) {
    let vc = v.options[ci] || null;

    //Used for when there is a display mode of color. We need to check all variants
    //of a product, find the color that is being displayed then check all sizes of
    //that color.
    return this.colors.some(c => {
      let swatch = this.getSwatchByColor(c);
      return p.variants.some(v2 => {
        let v2c = v2.options[ci] || null;
        if(this.template.draw.displayMode.toLowerCase().indexOf('available') !== -1 && !v2.available) return false;
        if(vc && vc != v2c) return false;
        return this.getSwatchByColor(v2.options[ci]) === swatch;
      });
    });
  }

  filterOrVariant(p,v,ci) {
    return this.colors.some(c => {
      let swatch = this.getSwatchByColor(c);
      return this.getSwatchByColor(v.options[ci]) === swatch;
    })
  }
}
