// ─────────────────────────────────────────────────────────────────
//  CONFIGURACIÓN FIREBASE
//  Reemplazá los valores de abajo con los de tu proyecto Firebase.
//
//  Cómo obtenerlos:
//   1. console.firebase.google.com → tu proyecto
//   2. ⚙️ Configuración → Tus apps → </> (Web) → Registrar app
//   3. Copiá el objeto firebaseConfig y pegalo acá
// ─────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyBJWX7s2-FkjxL4uRGweBrC8kBdYeRSIJM",
  authDomain: "quiz-simulacion.firebaseapp.com",
  databaseURL: "https://quiz-simulacion-default-rtdb.firebaseio.com",
  projectId: "quiz-simulacion",
  storageBucket: "quiz-simulacion.firebasestorage.app",
  messagingSenderId: "376554611961",
  appId: "1:376554611961:web:dae8a5d519a282d8e56e28",
  measurementId: "G-VNXLN0RKFK"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
