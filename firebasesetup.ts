import functions from '@react-native-firebase/functions';
import { Platform } from 'react-native';

if (__DEV__) {
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  functions().useEmulator(host, 5001);
}

export default functions;
