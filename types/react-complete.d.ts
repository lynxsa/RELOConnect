// Comprehensive React and React Native type declarations

declare module 'react' {
  import { ComponentType, ReactNode, ReactElement, Component as ReactComponent } from 'react';

  // Core React types
  export interface Component<P = {}, S = {}, SS = any> {
    componentDidMount?(): void;
    componentWillUnmount?(): void;
    componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;
    shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
    getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null;
    componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
    setState<K extends keyof S>(
      state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
      callback?: () => void
    ): void;
    forceUpdate(callback?: () => void): void;
    render(): ReactNode;
    readonly props: Readonly<P>;
    state: Readonly<S>;
    context: any;
  }

  export class Component<P = {}, S = {}> implements Component<P, S> {
    constructor(props: P);
    setState<K extends keyof S>(
      state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
      callback?: () => void
    ): void;
    forceUpdate(callback?: () => void): void;
    render(): ReactNode;
    readonly props: Readonly<P>;
    state: Readonly<S>;
    context: any;
  }

  export interface FC<P = {}> {
    (props: P & { children?: ReactNode }): ReactElement | null;
    propTypes?: any;
    contextTypes?: any;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  export type FunctionComponent<P = {}> = FC<P>;

  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  export type ReactNode = ReactElement | string | number | ReactFragment | ReactPortal | boolean | null | undefined;
  export type ReactFragment = {} | Iterable<ReactNode>;
  export type ReactPortal = ReactElement & { key: Key | null; children: ReactNode };
  export type Key = string | number;
  export type JSXElementConstructor<P> = ((props: P) => ReactElement | null) | (new (props: P) => Component<any, any>);

  export function createElement<P extends {}>(
    type: string | ComponentType<P>,
    props?: (Attributes & P) | null,
    ...children: ReactNode[]
  ): ReactElement<P>;

  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useEffect(effect: EffectCallback, deps?: DependencyList): void;
  export function useContext<T>(context: Context<T>): T;
  export function useReducer<R extends Reducer<any, any>>(
    reducer: R,
    initialState: ReducerState<R>,
    initializer?: undefined
  ): [ReducerState<R>, Dispatch<ReducerAction<R>>];
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T;
  export function useMemo<T>(factory: () => T, deps: DependencyList | undefined): T;
  export function useRef<T>(initialValue: T): MutableRefObject<T>;
  export function useRef<T>(initialValue: T | null): RefObject<T>;
  export function useRef<T = undefined>(): MutableRefObject<T | undefined>;

  export type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;
  export type ComponentClass<P = {}> = new (props: P) => Component<P, any>;
  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prevState: S) => S);
  export type EffectCallback = () => (void | (() => void | undefined));
  export type DependencyList = ReadonlyArray<any>;
  export type Context<T> = { Provider: ComponentType<any>; Consumer: ComponentType<any> };
  export type Reducer<S, A> = (prevState: S, action: A) => S;
  export type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
  export type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
  export type MutableRefObject<T> = { current: T };
  export type RefObject<T> = { readonly current: T | null };
  export type Attributes = { key?: Key };
  export type ErrorInfo = { componentStack: string };

  export default React;
}

declare module 'react-native' {
  import { ComponentType, ReactNode } from 'react';

  // Style types
  export interface ViewStyle {
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: number;
    borderWidth?: number;
    flex?: number;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    height?: number | string;
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    margin?: number;
    marginBottom?: number;
    marginHorizontal?: number;
    marginLeft?: number;
    marginRight?: number;
    marginTop?: number;
    marginVertical?: number;
    padding?: number;
    paddingBottom?: number;
    paddingHorizontal?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingVertical?: number;
    position?: 'absolute' | 'relative';
    width?: number | string;
    [key: string]: any;
  }

  export interface TextStyle extends ViewStyle {
    color?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    [key: string]: any;
  }

  export interface ImageStyle extends ViewStyle {
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    [key: string]: any;
  }

  // Component prop types
  export interface ViewProps {
    children?: ReactNode;
    style?: ViewStyle | ViewStyle[];
    testID?: string;
    onLayout?: (event: any) => void;
    [key: string]: any;
  }

  export interface TextProps {
    children?: ReactNode;
    style?: TextStyle | TextStyle[];
    numberOfLines?: number;
    onPress?: () => void;
    testID?: string;
    [key: string]: any;
  }

  export interface ScrollViewProps extends ViewProps {
    contentContainerStyle?: ViewStyle;
    horizontal?: boolean;
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    onScroll?: (event: any) => void;
    [key: string]: any;
  }

  export interface TouchableOpacityProps extends ViewProps {
    onPress?: () => void;
    onPressIn?: () => void;
    onPressOut?: () => void;
    disabled?: boolean;
    activeOpacity?: number;
    [key: string]: any;
  }

  export interface TextInputProps {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    placeholderTextColor?: string;
    style?: TextStyle | TextStyle[];
    multiline?: boolean;
    secureTextEntry?: boolean;
    editable?: boolean;
    testID?: string;
    [key: string]: any;
  }

  // Component exports
  export const View: ComponentType<ViewProps>;
  export const Text: ComponentType<TextProps>;
  export const ScrollView: ComponentType<ScrollViewProps>;
  export const TouchableOpacity: ComponentType<TouchableOpacityProps>;
  export const TextInput: ComponentType<TextInputProps>;
  export const SafeAreaView: ComponentType<ViewProps>;
  export const FlatList: ComponentType<any>;
  export const Image: ComponentType<any>;
  export const Modal: ComponentType<any>;
  export const ActivityIndicator: ComponentType<any>;

  // Utilities
  export const StyleSheet: {
    create: <T extends { [key: string]: ViewStyle | TextStyle | ImageStyle }>(styles: T) => T;
    flatten: (style: any) => any;
    absoluteFill: ViewStyle;
    hairlineWidth: number;
  };

  export const Platform: {
    OS: 'ios' | 'android' | 'web' | 'windows' | 'macos';
    select: <T>(options: { ios?: T; android?: T; web?: T; windows?: T; macos?: T; default?: T }) => T;
  };

  export const Dimensions: {
    get: (dimension: 'window' | 'screen') => {
      width: number;
      height: number;
      scale: number;
      fontScale: number;
    };
    addEventListener: (type: string, handler: any) => void;
    removeEventListener: (type: string, handler: any) => void;
  };

  export const Alert: {
    alert: (title: string, message?: string, buttons?: any[], options?: any) => void;
  };

  // Navigation types
  export interface NavigationProp<ParamList = any> {
    navigate: (name: keyof ParamList, params?: any) => void;
    goBack: () => void;
    reset: (state: any) => void;
    setParams: (params: any) => void;
    dispatch: (action: any) => void;
  }

  export interface RouteProp<ParamList = any, RouteName extends keyof ParamList = keyof ParamList> {
    key: string;
    name: RouteName;
    params: ParamList[RouteName];
  }
}

// JSX types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
