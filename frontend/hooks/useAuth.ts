"use client";

import { useEffect, useState } from "react";

export function useIsAuthenticated() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  return isAuthenticated; // null tant que non déterminé (évite un flash côté serveur)
}