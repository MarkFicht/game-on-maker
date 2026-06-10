// @react-native-firebase initializes automatically from:
//   Android: google-services.json (in mobile/ root)
//   iOS:     GoogleService-Info.plist (in mobile/ root)
// These files must NOT be committed to git — add to EAS Secrets for CI builds.
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export { auth, firestore };
