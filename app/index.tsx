import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/map"); 
      } else {
        router.replace("/login"); 
      }
    });

    return unsubscribe; 
  }, []);

  return null;
}
