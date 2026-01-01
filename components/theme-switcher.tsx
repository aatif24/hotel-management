"use client";

import { Switch } from "@heroui/react";
import { Moon, Sun } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div>
      <Switch
        defaultSelected={theme === "dark"}
        color="default"
        onValueChange={(value) => setTheme(value ? "dark" : "light")}
        endContent={<HugeiconsIcon icon={Moon} />}
        size="sm"
        startContent={<HugeiconsIcon icon={Sun} />}
      />
    </div>
  );
}
