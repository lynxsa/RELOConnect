declare module 'react-native' {
  import { ComponentType, ReactNode } from 'react';
  
  // Style types
  export interface ViewStyle {
    [key: string]: any;
  }
  
  export interface TextStyle {
    [key: string]: any;
  }
  
  export interface ImageStyle {
    [key: string]: any;
  }
  
  // Basic component types
  export interface ViewProps {
    children?: ReactNode;
    style?: ViewStyle | ViewStyle[];
    testID?: string;
    accessibilityState?: { disabled?: boolean; [key: string]: any };
  }
  
  export interface TextProps {
    children?: ReactNode;
    style?: TextStyle | TextStyle[];
    testID?: string;
    onPress?: () => void;
    parent?: any;
  }
  
  export interface ScrollViewProps extends ViewProps {
    contentContainerStyle?: ViewStyle;
    horizontal?: boolean;
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
  }
  
  export interface TouchableOpacityProps extends ViewProps {
    onPress?: () => void;
    disabled?: boolean;
    activeOpacity?: number;
  }
  
  export interface TextInputProps {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    style?: TextStyle | TextStyle[];
    multiline?: boolean;
    secureTextEntry?: boolean;
    testID?: string;
  }

  export interface ActivityIndicatorProps {
    size?: 'small' | 'large' | number;
    color?: string;
    testID?: string;
    style?: ViewStyle | ViewStyle[];
  }
  
  // Component declarations
  export const View: ComponentType<ViewProps>;
  export const Text: ComponentType<TextProps>;
  export const ScrollView: ComponentType<ScrollViewProps>;
  export const TouchableOpacity: ComponentType<TouchableOpacityProps>;
  export const TextInput: ComponentType<TextInputProps>;
  export const SafeAreaView: ComponentType<ViewProps>;
  export const FlatList: ComponentType<any>;
  export const Image: ComponentType<any>;
  export const Modal: ComponentType<any>;
  export const ActivityIndicator: ComponentType<ActivityIndicatorProps>;
  export const Alert: {
    alert: (title: string, message?: string, buttons?: any[]) => void;
  };
  
  // Platform
  export const Platform: {
    OS: 'ios' | 'android' | 'web';
    select: <T>(options: { ios?: T; android?: T; web?: T; default?: T }) => T;
  };
  
  // Dimensions
  export const Dimensions: {
    get: (dimension: 'window' | 'screen') => {
      width: number;
      height: number;
      scale: number;
      fontScale: number;
    };
  };
  
  // StyleSheet
  export const StyleSheet: {
    create: <T>(styles: T) => T;
    flatten: (style: any) => any;
  };
  
  // Navigation types
  export interface NavigationProp<ParamList = any> {
    navigate: (name: keyof ParamList, params?: any) => void;
    goBack: () => void;
    reset: (state: any) => void;
  }
  
  export interface RouteProp<ParamList = any, RouteName extends keyof ParamList = keyof ParamList> {
    key: string;
    name: RouteName;
    params: ParamList[RouteName];
  }
  
  export function useColorScheme(): 'light' | 'dark' | null;
}

declare module 'react-native/Libraries/NewAppScreen' {
  export const Header: any;
  export const LearnMoreLinks: any;
  export const Colors: any;
  export const DebugInstructions: any;
  export const ReloadInstructions: any;
}
