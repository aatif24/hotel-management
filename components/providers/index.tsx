"use client";
import * as React from "react";
import { HeroProvider } from "./hero.provider";


export default function BaseProvider({
  children,
}: React.PropsWithChildren<{ children: React.ReactNode }>) {
  // 2. Wrap HeroUIProvider at the root of your app
  return <HeroProvider>{children}</HeroProvider>;
}
