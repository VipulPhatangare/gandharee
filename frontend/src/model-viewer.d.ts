// Type declarations for Google model-viewer custom web component
// This prevents React from throwing "unknown prop" warnings

declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      alt?: string;
      'auto-rotate'?: boolean | string;
      'camera-controls'?: boolean | string;
      ar?: boolean | string;
      'ar-modes'?: string;
      'shadow-intensity'?: string;
      'environment-image'?: string;
      loading?: string;
      poster?: string;
      slot?: string;
    };
  }
}
