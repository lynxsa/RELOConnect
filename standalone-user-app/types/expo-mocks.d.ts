// Mock for expo-image-picker until proper dependency is installed
declare module 'expo-image-picker' {
  export interface ImagePickerResult {
    cancelled: boolean;
    uri?: string;
    width?: number;
    height?: number;
    type?: 'image' | 'video';
  }

  export interface ImagePickerOptions {
    mediaTypes?: 'Images' | 'Videos' | 'All';
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }

  export const MediaTypeOptions: {
    All: 'All';
    Videos: 'Videos';
    Images: 'Images';
  };

  export function launchImageLibraryAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function launchCameraAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function requestMediaLibraryPermissionsAsync(): Promise<{status: string}>;
  export function requestCameraPermissionsAsync(): Promise<{status: string}>;
}

// Mock for @stripe/stripe-react-native  
declare module '@stripe/stripe-react-native' {
  export interface Stripe {
    confirmPayment(clientSecret: string): Promise<{error?: any; paymentIntent?: any}>;
    confirmApplePayPayment(clientSecret: string): Promise<{error?: any}>;
    createPaymentMethod(params: any): Promise<{error?: any; paymentMethod?: any}>;
  }

  export interface PaymentIntent {
    id: string;
    clientSecret: string;
    amount: number;
    currency: string;
  }

  export interface PaymentMethod {
    id: string;
    type: string;
    card?: any;
  }
}
