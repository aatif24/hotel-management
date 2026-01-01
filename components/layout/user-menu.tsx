"use client";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Divider,
  DropdownSection,
} from "@heroui/react";

import { LogoutButton } from "./logout";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function UserMenu() {
  return (
    <Dropdown placement="bottom-start">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          size="sm"
          className="transition-transform"
          src="https://i.pravatar.cc/150"
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="User Actions" variant="flat">
        <DropdownItem key="settings">My Settings</DropdownItem>
        <DropdownItem key="team_settings">Team Settings</DropdownItem>
        <DropdownItem showDivider key="analytics">
          Analytics
        </DropdownItem>
        <DropdownSection title="Danger zone">
          <DropdownItem key="logout" color="danger">
            <LogoutButton />
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
