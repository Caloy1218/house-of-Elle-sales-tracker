import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAcRuzQ32S6FHMsujr1towoNx9rrgD_2EA",
  authDomain: "houseofelle-sales-tracker.firebaseapp.com",
  projectId: "houseofelle-sales-tracker",
  storageBucket: "houseofelle-sales-tracker.appspot.com",
  messagingSenderId: "535574306288",
  appId: "1:535574306288:web:1b0a7f109dfa9b2301d135"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
