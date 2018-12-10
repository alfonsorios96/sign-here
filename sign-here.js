import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 * `sign-here`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class SignHere extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <canvas id="canvas"></canvas>
    `;
  }

  static get properties() {
    return {
      /**
       * Width of the signature pad in pixels
       */
      width: Number,

      /**
       * Height of the signature pad in pixels
       */
      height: Number,

      /**
       * Radius of a single dot
       */
      dotSize: {
        type: Number,
        observer: '_dotSizeChanged'
      },

      /**
       * Minimum width of a line. Defaults to 0.5
       */
      minWidth: {
        type: Number,
        observer: '_minWidthChanged'
      },

      /**
       * Maximum width of a line. Defaults to 2.5
       */
      maxWidth: {
        type: Number,
        observer: '_maxWidthChanged'
      },

      /**
       * Color used to clear the background.
       * Can be any color format accepted by context.fillStyle.
       * Defaults to "rgba(0,0,0,0)" (transparent black).
       * Use a non-transparent color e.g. "rgb(255,255,255)" (opaque white)
       * if you'd like to save signatures as JPEG images.
       */
      backgroundColor: {
        type: String,
        value: 'rgb(255, 255, 255)',
        observer: '_backgroundColorChanged'
      },

      /**
       * Color used to draw the lines.
       * Can be any color format accepted by context.fillStyle.
       * Defaults to "black".
       */
      penColor: {
        type: String,
        value: 'rgb(0, 0, 0)',
        observer: '_penColorChanged'
      },

      /**
       * Weight used to modify new velocity based on the previous velocity. Defaults to 0.7
       */
      velocityFilterWeight: {
        type: Number,
        observer: '_velocityFilterWeightChanged'
      },

      /**
       * toDataUrl encoding format
       */
      type: {
        type: String,
        value: 'image/png'
      },

      /**
       * toDataUrl encoding image quality between 0 and 1
       */
      encoderOptions: {
        type: Number,
        value: 0.85
      },

      /**
       * Data uri encoded image data
       */
      image: {
        type: String,
        notify: true
      },

      /**
       * Indicates if the signature pad is currently active
       */
      active: {
        type: Boolean,
        notify: true,
        readOnly: true
      },

      /**
       * Indicates if the signature pad is empty
       */
      empty: {
        type: Boolean,
        notify: true,
        readOnly: true
      }
    };
  }

  ready() {
    super.ready();

    const script = document.createElement('script');  // create a script DOM node
    script.src = 'https://cdn.jsdelivr.net/npm/signature_pad@3.0.0-beta.3/dist/signature_pad.umd.min.js';  // set its src to the provided URL

    script.onreadystatechange = callback.bind(this);
    script.onload = callback.bind(this);

    function callback() {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);

      this.$.canvas.style.width = this.width + 'px';
      this.$.canvas.style.height = this.height + 'px';
      this.$.canvas.width = this.width * ratio;
      this.$.canvas.height = this.height * ratio;
      this.$.canvas.getContext('2d').scale(ratio, ratio);

      this.signaturePad = new SignaturePad(this.$.canvas, {
        dotSize: this.dotSize,
        minWidth: this.minWidth,
        maxWidth: this.maxWidth,
        backgroundColor: this.backgroundColor,
        penColor: this.penColor,
        velocityFilterWeight: this.velocityFilterWeight,
        onBegin: this._onBegin.bind(this),
        onEnd: this._onEnd.bind(this)
      });

      this.signaturePad.clear();

      if (this.image) {
        this.signaturePad.fromDataURL(this.image);
      }

      this._setEmpty(this.signaturePad.isEmpty());
    }

    document.head.appendChild(script);
  }

  clear() {
    this.signaturePad.clear();
    this.encodeImage();
  }

  encodeImage() {
    this.image = this.$.canvas.toDataURL(this.type, this.encodingOptions);
    this._setEmpty(this.signaturePad.isEmpty());
  }

  _onBegin() {
    this._setActive(true);
  }

  _onEnd() {
    this._setActive(false);
    this.encodeImage();
  }

  _dotSizeChanged(newValue, oldValue) {
    if (!this.signaturePad) return;
    this.signaturePad.dotSize = newValue;
  }

  _minWidthChanged(newValue, oldValue) {
    if (!this.signaturePad) return;
    this.signaturePad.minWidth = newValue;
  }

  _maxWidthChanged(newValue, oldValue) {
    if (!this.signaturePad) return;
    this.signaturePad.maxWidth = newValue;
  }

  _backgroundColorChanged(newValue, oldValue) {
    if (!this.signaturePad) return;
    this.signaturePad.backgroundColor = newValue;
  }

  _penColorChanged(newValue, oldValue) {
    if (!this.signaturePad) return;
    this.signaturePad.penColor = newValue;
  }

  _velocityFilterWeightChanged(newValue, oldValue) {
    if (!this.signaturePad) return;
    this.signaturePad.velocityFilterWeight = newValue;
  }

  _onEncodingChanged(type, encoderOptions) {
    if (this.signaturePad) {
      this.encodeImage();
    }
  }
}

window.customElements.define('sign-here', SignHere);
