// React type declarations to fix module resolution issues

declare global {
  namespace React {
    export interface Component<P = {}, S = {}, SS = any> {}
    export interface FunctionComponent<P = {}> {
      (props: P): ReactElement | null;
      propTypes?: any;
      contextTypes?: any;
      defaultProps?: Partial<P>;
      displayName?: string;
    }
    export type FC<P = {}> = FunctionComponent<P>;
    export type ReactElement<P = any> = {
      type: any;
      props: P;
      key: string | number | null;
    };
    export type ReactNode = ReactElement | string | number | boolean | null | undefined | ReactNode[];
    export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
    export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
    export function useContext<T>(context: any): T;
    export function useMemo<T>(factory: () => T, deps: any[]): T;
    export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
    export function useRef<T>(initialValue?: T): { current: T };
  }
}

// React module declaration
declare module 'react' {
  const React: {
    FC: React.FunctionComponent;
    Component: typeof React.Component;
    useEffect: typeof React.useEffect;
    useState: typeof React.useState;
    useContext: typeof React.useContext;
    useMemo: typeof React.useMemo;
    useCallback: typeof React.useCallback;
    useRef: typeof React.useRef;
    ReactNode: React.ReactNode;
    ReactElement: React.ReactElement;
  };
  export = React;
}

// React JSX Runtime
declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: any): React.ReactElement;
  export function jsxs(type: any, props: any, key?: any): React.ReactElement;
  export namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// React Native module declaration
declare module 'react-native' {
  export interface ViewStyle {
    [key: string]: any;
  }
  
  export interface TextStyle {
    [key: string]: any;
  }
  
  export interface ImageStyle {
    [key: string]: any;
  }
  
  export interface ViewProps {
    style?: ViewStyle | ViewStyle[];
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface TextProps {
    style?: TextStyle | TextStyle[];
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface TouchableOpacityProps extends ViewProps {
    onPress?: () => void;
    disabled?: boolean;
    activeOpacity?: number;
  }
  
  export const View: React.FC<ViewProps>;
  export const Text: React.FC<TextProps>;
  export const TouchableOpacity: React.FC<TouchableOpacityProps>;
  export const ScrollView: React.FC<any>;
  export const SafeAreaView: React.FC<ViewProps>;
  export const ActivityIndicator: React.FC<any>;
  export const Image: React.FC<any>;
  export const TextInput: React.FC<any>;
  export const FlatList: React.FC<any>;
  export const Modal: React.FC<any>;
  export const StyleSheet: {
    create<T>(styles: T): T;
    absoluteFill: ViewStyle;
    hairlineWidth: number;
  };
  export const Dimensions: {
    get(dimension: 'window' | 'screen'): { width: number; height: number; scale: number; fontScale: number };
  };
  export const Platform: {
    OS: 'ios' | 'android' | 'web' | 'windows' | 'macos';
    select<T>(spec: { ios?: T; android?: T; web?: T; default?: T }): T;
  };
  export const Alert: {
    alert(title: string, message?: string, buttons?: any[], options?: any): void;
  };
}
