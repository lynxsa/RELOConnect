// Immediate fix for React Native types

declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const ScrollView: any;
  export const TouchableOpacity: any;
  export const TextInput: any;
  export const SafeAreaView: any;
  export const FlatList: any;
  export const Image: any;
  export const Modal: any;
  export const ActivityIndicator: any;
  export const StyleSheet: any;
  export const Platform: any;
  export const Dimensions: any;
  export const Alert: any;
}

declare module 'react' {
  export const useState: any;
  export const useEffect: any;
  export const useContext: any;
  export const useMemo: any;
  export const useCallback: any;
  export const useRef: any;
  export const Component: any;
  export const Fragment: any;
  export default React;
}
