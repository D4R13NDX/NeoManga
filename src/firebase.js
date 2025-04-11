import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions"; 

const firebaseConfig = {
  apiKey: "AIzaSyB-B5tBqEGeNYbXfa6L2kNARvTCdeDGprY",
  authDomain: "neomanga-5fedc.firebaseapp.com",
  projectId: "neomanga-5fedc",
  storageBucket: "neomanga-5fedc.appspot.com",
  messagingSenderId: "254495612451",
  appId: "1:254495612451:web:569db65a24a7088b619b96"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("Persistencia configurada correctamente"))
  .catch((error) => console.error("Error al configurar persistencia:", error));

export { auth, app , functions };
export const db = getFirestore(app);
export const storage = getStorage(app);