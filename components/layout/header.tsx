"use client";
import { ThemeSwitcher } from "@components/theme-switcher";
import Image from "next/image";

export default function HeaderComponent() {
  return (
    <div className="w-screen shadow-sm">
      <section className="container mx-auto px-4 md:px-6 h-12 flex items-center justify-between">
        <Image
          src="/logo.png"
          className="dark:hidden inline-block"
          alt="Logo"
          width={32}
          height={32}
        />
        <Image
          src="/logo-dark.png"
          className="hidden dark:inline-block"
          alt="Logo"
          width={32}
          height={32}
        />
        <ThemeSwitcher />
      </section>
    </div>
  );
}
