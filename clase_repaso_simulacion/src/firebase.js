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
  apiKey:            "PASTE_YOUR_API_KEY",
  authDomain:        "PASTE_YOUR_PROJECT.firebaseapp.com",
  databaseURL:       "https://PASTE_YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId:         "PASTE_YOUR_PROJECT",
  storageBucket:     "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId:             "PASTE_YOUR_APP_ID"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
