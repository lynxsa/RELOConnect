// Admin Dashboard specific type declarations
// This file overrides React Native types for Next.js compatibility

declare module 'react' {
  // Standard React types for Next.js
  export = React;
  export as namespace React;
}

// Disable React Native text rules for Next.js
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Next.js specific declarations
declare module 'next/head' {
  const Head: React.ComponentType<{ children?: React.ReactNode }>;
  export default Head;
}

declare module 'next/image' {
  const Image: React.ComponentType<any>;
  export default Image;
}

declare module 'next/link' {
  const Link: React.ComponentType<any>;
  export default Link;
}

declare module 'next/router' {
  export function useRouter(): any;
  export const Router: any;
}

// Chart.js types
declare module 'chart.js' {
  export const Chart: any;
  export const CategoryScale: any;
  export const LinearScale: any;
  export const PointElement: any;
  export const LineElement: any;
  export const Title: any;
  export const Tooltip: any;
  export const Legend: any;
  export const ArcElement: any;
  export const BarElement: any;
}
