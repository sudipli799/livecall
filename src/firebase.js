import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  databaseURL: "https://openbox-8f7c1-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);