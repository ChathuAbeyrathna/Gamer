import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import {getStorage} from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCdoRQLIVBCoR9RXRDD4vz48JKNs_qzOyA",
  authDomain: "trivia-18f82.firebaseapp.com",
  projectId: "trivia-18f82",
  storageBucket: "trivia-18f82.appspot.com",
  messagingSenderId: "499335176871",
  appId: "1:499335176871:web:662b12155609f4648bf182",
  measurementId: "G-T5P16Y7KP0"
};


const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export const storage = getStorage(app)