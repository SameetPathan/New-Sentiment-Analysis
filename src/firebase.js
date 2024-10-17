import { initializeApp } from "firebase/app";
import { getDatabase, set, ref,get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAiJf1SDTPpfRHr4NwckDu_1ImNpju6y14",
  authDomain: "jarvis-systems-commons.firebaseapp.com",
  databaseURL: "https://jarvis-systems-commons-default-rtdb.firebaseio.com",
  projectId: "jarvis-systems-commons",
  storageBucket: "jarvis-systems-commons.appspot.com",
  messagingSenderId: "383480447879",
  appId: "1:383480447879:web:45baeaa9517cbb97088922",
};

const app = initializeApp(firebaseConfig);
const firebase = initializeApp(firebaseConfig);

export default firebase;

export const database = getDatabase(app);

export function register(registerData) {
  try {
    const dbb = getDatabase();
    set(ref(dbb, "NewsSentimentAnalysis/users/" + registerData.phoneNumber), {
      name: registerData.name,
      phoneNumber: registerData.phoneNumber,
      email: registerData.email,
      password: registerData.password,
      confirmPassword: registerData.confirmPassword,
      userType: registerData.userType,
      collegeName: registerData.collegeName,
      secretKey:registerData.secretKey
    });
    return true;
  } catch (error) {
    return false;
  }
}

export const login = async (loginData) => {
  const { phoneNumber } = loginData;
  
  try {
    const db = getDatabase();
    const userRef = ref(db, `NewsSentimentAnalysis/users/${phoneNumber}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      // User exists
      const userData = snapshot.val();
      console.log("User found:", userData);
      return true; // User is registered
    } else {
      console.log("No user found with this phone number");
      return false; // User is not registered
    }
  } catch (error) {
    console.error("Error checking user:", error.message);
    return false; // Error occurred
  }
};
