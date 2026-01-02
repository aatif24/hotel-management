import { ThemeSwitcher } from "@components/theme-switcher";
import { getCurrentUser } from "@lib/auth/helpers";
import Image from "next/image";
import UserMenu from "./user-menu";
export default async function HeaderComponent() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="sticky top-0 z-50 backdrop-blur-sm w-screen shadow-sm">
      <section className="container mx-auto px-4 md:px-6 h-12 flex items-center justify-between">
        <Image
          src="/logo.png"
          className="dark:hidden inline-block w-16"
          alt="Logo"
          width={100}
          height={0}
        />
        <Image
          src="/logo-dark.png"
          className="hidden dark:inline-block w-16"
          alt="Logo"
          width={100}
          height={0}
        />
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          {/*<User description={user.email} name={"Staff"} />*/}
          <UserMenu />
        </div>
      </section>
    </div>
  );
}
