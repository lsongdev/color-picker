/**
 * ColorPicker
 * @class
 * @param {Object} options
 */
function ColorPicker(options) {
  if (!(this instanceof ColorPicker)) {
    return new ColorPicker(options);
  }
  options = options || {};
  const picker = document.createElement('div');
  picker.className = 'color-picker';
  // palette
  picker.palette = document.createElement('div');
  picker.palette.i = document.createElement('i');
  picker.palette.className = 'color-picker-palette';
  picker.palette.appendChild(picker.palette.i);
  picker.appendChild(picker.palette);
  // hue
  picker.hue = document.createElement('div');
  picker.hue.i = document.createElement('i');
  picker.hue.appendChild(picker.hue.i);
  picker.hue.className = 'color-picker-slider color-picker-hue';
  picker.appendChild(picker.hue);
  // opacity
  picker.opacity = document.createElement('div');
  picker.opacity.i = document.createElement('i');
  picker.opacity.appendChild(picker.opacity.i);
  picker.opacity.className = 'color-picker-slider color-picker-opacity';
  picker.appendChild(picker.opacity);
  // swatches
  picker.swatches = document.createElement('div');
  picker.swatches.className = 'color-picker-swatches';
  (options.swatches || []).forEach(color => {
    const el = document.createElement('button');
    el.style.backgroundColor = color;
    picker.swatches.appendChild(el);
  });
  picker.appendChild(picker.swatches);
  picker.swatches.addEventListener('click', e => {
    this.fire('change', e.target.style.backgroundColor);
  });
  // controls
  picker.controls = document.createElement('div');
  picker.controls.className = 'color-picker-controls';
  // input
  picker.input = document.createElement('input');
  picker.controls.appendChild(picker.input);
  // bnutton - save
  picker.controls.save = document.createElement('button');
  picker.controls.save.innerText = 'save';
  picker.controls.appendChild(picker.controls.save);
  // bnutton - cancel
  picker.controls.cancel = document.createElement('button');
  picker.controls.cancel.innerText = 'cancel';
  picker.controls.appendChild(picker.controls.cancel);
  // 
  picker.appendChild(picker.controls);
  var { element } = options;
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }
  element.appendChild(picker);
  // hue
  moveable(picker.hue.i, e => {
    const value = (e.clientX - picker.hue.offsetLeft) / picker.hue.offsetWidth;
    this.fire('hue', this.hue = range(0, 1)(value) * 360 | 0);
  });
  // opacity
  moveable(picker.opacity.i, e => {
    const value = (e.clientX - picker.opacity.offsetLeft) / picker.opacity.offsetWidth;
    this.fire('opacity', this.opacity = (1 - range(0, 1)(value)).toFixed(2));
  });
  moveable(picker.palette, e => {
    const x = range(0, 1)((e.clientX - picker.palette.offsetLeft) / picker.palette.offsetWidth);
    const y = range(0, 1)((e.clientY - picker.palette.offsetTop) / picker.palette.offsetHeight);
    this.s = (x * 100) | 0;
    this.v = (100 - y * 100) | 0;
    this.fire('pick', this.s, this.v);
    this.update();
  });
  this.on('hue', hue => {
    picker.hue.i.style.left = ((hue / 360) * 200 - 3) + 'px';
    picker.palette.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
    this.update();
  });
  this.on('opacity', opacity => {
    picker.opacity.i.style.left = ((1 - opacity) * 200 - 3) + 'px';
    this.update();
  });
  this.on('change', color => {
    picker.input.value = color;
  });
  return this;
}

/**
 * Create Color Picker
 * @param {Object} options
 */
ColorPicker.create = function (options) {
  return new ColorPicker(options);
};

ColorPicker.prototype.update = function(){
  const { hue = 0, s = 0, v = 0, opacity = 1 } = this;
  // console.log(hue, s, v, opacity);
  const rgb = hsv2rgb(hue, s / 100, v / 100);
  const rgba = `rgba(${rgb}, ${opacity})`;
  const hsva = `hsva(${hue},${s}%,${v}%,${opacity})`;
  return this.fire('change', rgba);
};

/**
 * add event listener
 * @param {String} type
 * @param {Function} handler
 */
ColorPicker.prototype.on = function (type, handler) {
  this.events = this.events || {};
  this.events[type] = this.events[type] || [];
  this.events[type].push(handler);
  return this;
};
/**
 * emit event
 * @param {String} type
 */
ColorPicker.prototype.fire = function (type) {
  const self = this;
  const parameters = [].slice.call(arguments, 1);
  this.events = this.events || {};
  const handlers = this.events[type] || [];
  handlers.forEach(function (handler) {
    handler.apply(self, parameters);
  });
  return this;
};

function range(min, max) {
  return value => {
    return Math.max(min, Math.min(max, value));
  };
}

function moveable(element, onchange) {
  var moving = false;
  element.addEventListener('mousedown', e => {
    if (e.target === element) moving = true
  }, false);
  document.addEventListener('mouseup', () => moving = false, false);
  document.addEventListener('mousemove', e => {
    if (!moving) return;
    onchange && onchange(e);
  }, false);
  return () => {
    // cancel
  };
};

function hsv2rgb(h, s, v) {
  var rgb, i, data = [];
  if (s === 0) {
    rgb = [v, v, v];
  } else {
    h = h / 60;
    i = Math.floor(h);
    data = [v * (1 - s), v * (1 - s * (h - i)), v * (1 - s * (1 - (h - i)))];
    switch (i) {
      case 0:
        rgb = [v, data[2], data[0]];
        break;
      case 1:
        rgb = [data[1], v, data[0]];
        break;
      case 2:
        rgb = [data[0], v, data[2]];
        break;
      case 3:
        rgb = [data[0], data[1], v];
        break;
      case 4:
        rgb = [data[2], data[0], v];
        break;
      default:
        rgb = [v, data[0], data[1]];
        break;
    }
  }
  return rgb.map(x => Math.round(x * 255));
};