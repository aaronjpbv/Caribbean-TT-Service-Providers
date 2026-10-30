// hooks/useCommissionAgreement.ts
// Requires: @react-native-async-storage/async-storage
//   npx expo install @react-native-async-storage/async-storage

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hardware_commission_accepted";

export function useCommissionAgreement() {
  const [checking, setChecking] = useState(true);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const local = await AsyncStorage.getItem(STORAGE_KEY);
        if (local === "true") {
          setAccepted(true);
        }
      } catch (error) {
        console.error("Error checking commission agreement:", error);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const accept = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, "true");
      setAccepted(true);
    } catch (error) {
      console.error("Error saving commission agreement:", error);
    }
  }, []);

  return { checking, accepted, accept };
} 