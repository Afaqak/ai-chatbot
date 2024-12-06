"use client";

import type { User } from "next-auth";
import { useRouter } from "next/navigation";

import { PlusIcon } from "@/components/icons";
import { SidebarHistory } from "@/components/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { BetterTooltip } from "@/components/ui/tooltip";
import Link from "next/link";
import { Bot } from "lucide-react";
import { useSidebarStore } from "@/features/main/hooks";
import { useEffect } from "react";

export function ChatSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile ,open} = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold flex gap-2  px-2 hover:bg-muted rounded-md cursor-pointer">
                <Bot /> Chat
              </span>
            </Link>
            <BetterTooltip content="New Chat" align="end">
              <Button
                variant="ghost"
                type="button"
                className="p-2 h-fit"
                onClick={() => {
                  setOpenMobile(false);
                  router.push("/chat");
                  router.refresh();
                }}
              >
                <PlusIcon />
              </Button>
            </BetterTooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="-mx-2">
          <SidebarHistory user={user} />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
