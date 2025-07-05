declare module 'react-native' {
  import { ComponentType, ReactNode } from 'react';
  
  // Basic component types
  export interface ViewProps {
    children?: ReactNode;
    style?: any;
    testID?: string;
  }
  
  export interface TextProps {
    children?: ReactNode;
    style?: any;
    testID?: string;
  }
  
  export interface ScrollViewProps extends ViewProps {
    contentContainerStyle?: any;
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
    style?: any;
    multiline?: boolean;
    secureTextEntry?: boolean;
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
}

declare module 'react-native/Libraries/NewAppScreen' {
  export const Header: any;
  export const LearnMoreLinks: any;
  export const Colors: any;
  export const DebugInstructions: any;
  export const ReloadInstructions: any;
}
