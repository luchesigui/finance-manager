"use client";

import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { usePeople } from "@/components/finance/contexts/PeopleContext";

type DefaultPayerContextValue = {
  defaultPayerId: string;
  setDefaultPayerId: React.Dispatch<React.SetStateAction<string>>;
};

const DefaultPayerContext = createContext<DefaultPayerContextValue | null>(null);

export function DefaultPayerProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { people } = usePeople();
  const [defaultPayerId, setDefaultPayerId] = useState<string>("p1");

  useEffect(() => {
    if (people.length === 0) return;

    setDefaultPayerId((previousDefaultPayerId) => {
      if (people.some((person) => person.id === previousDefaultPayerId)) {
        return previousDefaultPayerId;
      }
      return people[0].id;
    });
  }, [people]);

  const contextValue = useMemo<DefaultPayerContextValue>(
    () => ({ defaultPayerId, setDefaultPayerId }),
    [defaultPayerId],
  );

  return (
    <DefaultPayerContext.Provider value={contextValue}>{children}</DefaultPayerContext.Provider>
  );
}

export function useDefaultPayer(): DefaultPayerContextValue {
  const contextValue = useContext(DefaultPayerContext);
  if (!contextValue) {
    throw new Error("useDefaultPayer must be used within DefaultPayerProvider");
  }
  return contextValue;
}
