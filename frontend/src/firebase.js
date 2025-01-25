// Importar las funciones necesarias de los SDKs de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Importar Firestore

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCrLZlZTolpiieNyJuozbPalKWw7N24-D0",
  authDomain: "partner15-0.firebaseapp.com",
  projectId: "partner15-0",
  storageBucket: "partner15-0.appspot.com", // Corregí el storageBucket, parece que había un error tipográfico.
  messagingSenderId: "589731085732",
  appId: "1:589731085732:web:ab6c61e0351ee3f281d531",
  measurementId: "G-HRC70GN6X1",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
const db = getFirestore(app);

// Exportar Firestore para usarlo en otros archivos
export default db;
