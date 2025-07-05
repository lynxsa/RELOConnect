/// <reference types="react" />
/// <reference types="react-native" />
/// <reference types="expo" />
/// <reference types="jest" />

// React and React Native type overrides
declare module 'react' {
  import React from 'react';
  export = React;
  export as namespace React;
}

declare module 'react/jsx-runtime' {
  import { ReactElement } from 'react';
  export function jsx(type: any, props: any, key?: any): ReactElement;
  export function jsxs(type: any, props: any, key?: any): ReactElement;
  export namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'react-native' {
  export * from 'react-native/types';
  
  // Core Components
  export const View: any;
  export const Text: any;
  export const TouchableOpacity: any;
  export const ScrollView: any;
  export const SafeAreaView: any;
  export const ActivityIndicator: any;
  export const Image: any;
  export const TextInput: any;
  export const FlatList: any;
  export const SectionList: any;
  export const Modal: any;
  export const Alert: any;
  export const Dimensions: any;
  export const StyleSheet: any;
  export const Platform: any;
  export const StatusBar: any;
  
  // Type interfaces
  export interface ViewStyle {
    [key: string]: any;
  }
  
  export interface TextStyle {
    [key: string]: any;
  }
  
  export interface ImageStyle {
    [key: string]: any;
  }
  
  export type ViewProps = {
    style?: ViewStyle | ViewStyle[];
    children?: any;
    [key: string]: any;
  };
  
  export type TextProps = {
    style?: TextStyle | TextStyle[];
    children?: any;
    [key: string]: any;
  };
}

declare module 'expo-font' {
  export function useFonts(fontMap: Record<string, any>): [boolean, Error | null];
  export function loadAsync(fontMap: Record<string, any>): Promise<void>;
  export function isLoaded(fontFamily: string): boolean;
}

declare module 'expo-splash-screen' {
  export function preventAutoHideAsync(): Promise<boolean>;
  export function hideAsync(): Promise<boolean>;
  export function setOptions(options: any): void;
}

declare module 'expo-constants' {
  interface ExpoConfig {
    name?: string;
    slug?: string;
    version?: string;
    [key: string]: any;
  }
  
  interface Constants {
    expoConfig?: ExpoConfig;
    manifest?: any;
    [key: string]: any;
  }
  
  const Constants: Constants;
  export default Constants;
}

declare module 'expo-router' {
  import { ComponentType } from 'react';
  
  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
    canGoBack: () => boolean;
  };
  
  export function useLocalSearchParams<T = Record<string, string>>(): T;
  
  export const Slot: ComponentType<any>;
  export const Link: ComponentType<any>;
  export const Stack: ComponentType<any>;
  export const Tabs: ComponentType<any>;
  
  export function ErrorBoundary(props: any): JSX.Element;
}

declare module '@react-navigation/native' {
  export * from '@react-navigation/core';
  export function useNavigation(): any;
  export function useFocusEffect(callback: () => void): void;
  export function NavigationContainer(props: any): JSX.Element;
}

declare module '@react-navigation/stack' {
  export function createStackNavigator(): any;
  export const CardStyleInterpolators: any;
  export const TransitionSpecs: any;
}

declare module '@react-navigation/bottom-tabs' {
  export function createBottomTabNavigator(): any;
}

declare module '@expo/vector-icons' {
  import { ComponentType } from 'react';
  
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  export const Ionicons: ComponentType<IconProps>;
  export const MaterialIcons: ComponentType<IconProps>;
  export const FontAwesome: ComponentType<IconProps>;
  export const Feather: ComponentType<IconProps>;
}

declare module 'expo-linear-gradient' {
  import { ComponentType } from 'react';
  
  interface LinearGradientProps {
    colors: string[];
    start?: [number, number];
    end?: [number, number];
    style?: any;
    children?: any;
  }
  
  export const LinearGradient: ComponentType<LinearGradientProps>;
}

declare module '@testing-library/react-native' {
  export function render(component: any, options?: any): any;
  export function fireEvent(element: any, eventName: string, eventData?: any): void;
  export function waitFor(callback: () => void, options?: any): Promise<void>;
  export function screen(): any;
  export function getByText(text: string): any;
  export function getByTestId(testId: string): any;
  export function queryByText(text: string): any;
  export function queryByTestId(testId: string): any;
}

declare module '@testing-library/jest-native' {
  export function extend(expect: any): void;
}

// Global Jest declarations
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOnTheScreen(): R;
      toHaveTextContent(text: string): R;
      toHaveProp(prop: string, value?: any): R;
      toHaveStyle(style: any): R;
    }

    interface Mock<T = any, Y extends any[] = any> {
      (...args: Y): T;
      mockClear(): void;
      mockReset(): void;
      mockRestore(): void;
      mockImplementation(fn: (...args: Y) => T): Mock<T, Y>;
      mockReturnValue(value: T): Mock<T, Y>;
      mockReturnValueOnce(value: T): Mock<T, Y>;
    }
  }

  function describe(name: string, fn: () => void): void;
  function it(name: string, fn: () => void | Promise<void>): void;
  function test(name: string, fn: () => void | Promise<void>): void;
  function expect(value: any): any;
  function beforeEach(fn: () => void | Promise<void>): void;
  function afterEach(fn: () => void | Promise<void>): void;
  function beforeAll(fn: () => void | Promise<void>): void;
  function afterAll(fn: () => void | Promise<void>): void;

  const jest: {
    fn<T extends (...args: any[]) => any>(implementation?: T): jest.Mock<ReturnType<T>, Parameters<T>>;
    mock(moduleName: string, factory?: () => any, options?: any): void;
    clearAllMocks(): void;
    resetAllMocks(): void;
    restoreAllMocks(): void;
    spyOn<T extends {}, M extends keyof T>(object: T, method: M): jest.Mock<any, any>;
    Mock: typeof jest.Mock;
  };
}

declare module 'react-native' {
  import * as ReactNative from 'react-native';
  export = ReactNative;
}

declare module 'expo-font' {
  export function useFonts(fontMap: Record<string, any>): [boolean, Error | null];
  export function loadAsync(fontMap: Record<string, any>): Promise<void>;
  export function isLoaded(fontFamily: string): boolean;
}

declare module 'expo-splash-screen' {
  export function preventAutoHideAsync(): Promise<boolean>;
  export function hideAsync(): Promise<boolean>;
  export function setOptions(options: any): void;
}

declare module 'expo-constants' {
  interface ExpoConfig {
    name?: string;
    slug?: string;
    version?: string;
    [key: string]: any;
  }
  
  interface Constants {
    expoConfig?: ExpoConfig;
    manifest?: any;
    [key: string]: any;
  }
  
  const Constants: Constants;
  export default Constants;
}

declare module 'expo-router' {
  import { ComponentType } from 'react';
  
  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
    canGoBack: () => boolean;
  };
  
  export function useLocalSearchParams<T = Record<string, string>>(): T;
  
  export const Slot: ComponentType<any>;
  export const Link: ComponentType<any>;
  export const Stack: ComponentType<any>;
  export const Tabs: ComponentType<any>;
  
  export function ErrorBoundary(props: any): JSX.Element;
}

declare module '@react-navigation/native' {
  export * from '@react-navigation/core';
  export function useNavigation(): any;
  export function useFocusEffect(callback: () => void): void;
  export function NavigationContainer(props: any): JSX.Element;
}

declare module '@react-navigation/stack' {
  export function createStackNavigator(): any;
  export const CardStyleInterpolators: any;
  export const TransitionSpecs: any;
}

declare module '@react-navigation/bottom-tabs' {
  export function createBottomTabNavigator(): any;
}

declare module '@expo/vector-icons' {
  import { ComponentType } from 'react';
  
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  export const Ionicons: ComponentType<IconProps>;
  export const MaterialIcons: ComponentType<IconProps>;
  export const FontAwesome: ComponentType<IconProps>;
  export const Feather: ComponentType<IconProps>;
}

declare module 'expo-linear-gradient' {
  import { ComponentType } from 'react';
  
  interface LinearGradientProps {
    colors: string[];
    start?: [number, number];
    end?: [number, number];
    style?: any;
    children?: any;
  }
  
  export const LinearGradient: ComponentType<LinearGradientProps>;
}

declare module '@testing-library/react-native' {
  export function render(component: any, options?: any): any;
  export function fireEvent(element: any, eventName: string, eventData?: any): void;
  export function waitFor(callback: () => void, options?: any): Promise<void>;
  export function screen(): any;
  export function getByText(text: string): any;
  export function getByTestId(testId: string): any;
  export function queryByText(text: string): any;
  export function queryByTestId(testId: string): any;
}

declare module '@testing-library/jest-native' {
  export function extend(expect: any): void;
}

// Global Jest declarations
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOnTheScreen(): R;
      toHaveTextContent(text: string): R;
      toHaveProp(prop: string, value?: any): R;
      toHaveStyle(style: any): R;
    }

    interface Mock<T = any, Y extends any[] = any> {
      (...args: Y): T;
      mockClear(): void;
      mockReset(): void;
      mockRestore(): void;
      mockImplementation(fn: (...args: Y) => T): Mock<T, Y>;
      mockReturnValue(value: T): Mock<T, Y>;
      mockReturnValueOnce(value: T): Mock<T, Y>;
    }
  }

  function describe(name: string, fn: () => void): void;
  function it(name: string, fn: () => void | Promise<void>): void;
  function test(name: string, fn: () => void | Promise<void>): void;
  function expect(value: any): any;
  function beforeEach(fn: () => void | Promise<void>): void;
  function afterEach(fn: () => void | Promise<void>): void;
  function beforeAll(fn: () => void | Promise<void>): void;
  function afterAll(fn: () => void | Promise<void>): void;

  const jest: {
    fn<T extends (...args: any[]) => any>(implementation?: T): jest.Mock<ReturnType<T>, Parameters<T>>;
    mock(moduleName: string, factory?: () => any, options?: any): void;
    clearAllMocks(): void;
    resetAllMocks(): void;
    restoreAllMocks(): void;
    spyOn<T extends {}, M extends keyof T>(object: T, method: M): jest.Mock<any, any>;
    Mock: typeof jest.Mock;
  };
}
