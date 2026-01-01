
import { createClient } from "@lib/supabase/client";
import { redirect } from "next/navigation";

export function LogoutButton() {
  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/");
  };

  return <p onClick={logout}>Logout</p>;
}
