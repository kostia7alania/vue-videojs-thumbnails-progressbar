let defaults = {
  0: {
    src: 'example-thumbnail.png'
  }
}

function extend() {
  var target, i, object, property; 
  let args =  Array.prototype.slice.call(arguments);
  //console.log('after аргс-',args,"после аргум - ",arguments)
  target = args.shift() || {};
  for (i in args) {
    object = args[i];
    for (property in object) {
      if (object.hasOwnProperty(property)) {
        if (typeof object[property] === 'object') {
          target[property] = extend(target[property], object[property]);
        } else {
          target[property] = object[property];
        }
      }
    }
  }
  return target;
};

let getComputedStyle = (el, pseudo) => prop => window.getComputedStyle ? window.getComputedStyle(el, pseudo)[prop] : el.currentStyle[prop];

let offsetParent = (el) => (el.nodeName !== 'HTML' && getComputedStyle(el)('position') === 'static') ?
  offsetParent(el.offsetParent) : el;

let getVisibleWidth = (el, width) => {
  let clip;
  if (width) return parseFloat(width);
  clip = getComputedStyle(el)('clip');
  if (clip !== 'auto' && clip !== 'inherit') {
    console.log(clip)
    clip = clip.split(/(?:\(|\))/)[1].split(/(?:,| )/); // rect(0px, 120px, 68px, 0px) -> ["0px", "", "120px", "", "68px", "", "0px"]
    if (clip.length === 4) return (parseFloat(clip[1]) - parseFloat(clip[3]));
  }
  return 0;
}

let getScrollOffset = () => {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop
  };
};

//videojs.plugin('thumbnails', )




export default function (options) {

  console.log('PLUGIN', arguments)

  let settings = {
    ...defaults,
    ...options
  }; //settings = extend({}, defaults, options); 

  //let player = this;
  (() => {
    // Android doesn't support :active and :hover on non-anchor and non-button elements
    // so, we need to fake the :active selector for thumbnails to show up.
    if (navigator.userAgent.toLowerCase().indexOf("android") !== -1) {
      let progressControl = this.controlBar.progressControl;
      let addFakeActive = () => progressControl.addClass('fake-active');
      let removeFakeActive = () => progressControl.removeClass('fake-active');
      progressControl.on('touchstart', addFakeActive);
      progressControl.on('touchend', removeFakeActive);
      progressControl.on('touchcancel', removeFakeActive);
    }
  })();

  // create the thumbnail
  let div = document.createElement('div');
  div.className = 'vjs-thumbnail-holder'; // let img = document.createElement('img'); div.appendChild(img); img.src = settings['0'].src;img.className = 'vjs-thumbnail';
  div.innerHTML = `<img class="vjs-thumbnail" src="${settings['0'].src}">`;
  let img = div.querySelector('img')
  extend(img.style, settings['0'].style);

  // center the thumbnail over the cursor if an offset wasn't provided
  if (!img.style.left && !img.style.right)
    img.onload = () => img.style.left = -(img.naturalWidth / 2) + 'px';

  // keep track of the duration to calculate correct thumbnail to display
  let duration = this.duration();
  // when the container is MP4
  this.on('durationchange', event => duration = this.duration());
  // when the container is HLS
  this.on('loadedmetadata', event => duration = this.duration());

  // add the thumbnail to the player

  let progressControl = this.controlBar.progressControl;
  progressControl.el().appendChild(div);

  let moveListener = event => {
    let active = 0;
    let pageXOffset = getScrollOffset().x;
    let clientRect = offsetParent(progressControl.el()).getBoundingClientRect();
    let right = (clientRect.width || clientRect.right) + pageXOffset;

    let pageX = event.pageX;
    if (event.changedTouches)
      pageX = event.changedTouches[0].pageX;
    window.pageX = pageX
    // find the page offset of the mouse
    let left = pageX || (event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft);
    // subtract the page offset of the positioned offset parent
    left -= offsetParent(progressControl.el()).getBoundingClientRect().left + pageXOffset - 100; // KOSTIA: костыли

    // apply updated styles to the thumbnail if necessary
    // mouseTime is the position of the mouse along the progress control bar
    // `left` applies to the mouse position relative to the player so we need
    // to remove the progress control's left offset to know the mouse position
    // relative to the progress control
    let mouseTime = Math.floor((left - progressControl.el().offsetLeft) / progressControl.width() * duration);
    for (let time in settings) {
      if (mouseTime > time) active = Math.max(active, time);
    }
    let setting = settings[active];
    if (setting.src && img.src != setting.src) img.src = setting.src;
    if (setting.style && img.style != setting.style) extend(img.style, setting.style);

    let width = getVisibleWidth(img, setting.width || settings[0].width);
    console.log('width',width)
    let halfWidth = width / 2;

    // make sure that the thumbnail doesn't fall off the right side of the left side of the player
    if ((left + halfWidth) > right) left -= (left + halfWidth) - right;
    else if (left < halfWidth) left = halfWidth;

    div.style.left = left - 100  + 'px'; // KOSTIA: костыли
  };

  // update the thumbnail while hovering
  progressControl.on('mousemove', moveListener);
  progressControl.on('touchmove', moveListener);

  let moveCancel = event => div.style.left = '-1000px';
  // move the placeholder out of the way when not hovering
  progressControl.on('mouseout', moveCancel);
  progressControl.on('touchcancel', moveCancel);
  progressControl.on('touchend', moveCancel);
  this.on('userinactive', moveCancel);
}