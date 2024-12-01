"use client";

import type { User } from "next-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import {
  PlusIcon,
  FileTextIcon,
  MessageSquareIcon,
  BookOpenIcon,
  SettingsIcon,
} from "lucide-react";

import { SidebarHistory } from "@/components/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSidebarStore } from "../hooks";
import { cn } from "@/utils";
import { buttonVariants } from "@/components/ui/button";

const menuItems = [
  {
    icon: <PlusIcon className="h-5 w-5" />,
    label: "New Conversation",
    path: "/",
  },
  {
    icon: <FileTextIcon className="h-5 w-5" />,
    label: "Drafts",
    path: "/drafts",
  },
  {
    icon: <MessageSquareIcon className="h-5 w-5" />,
    label: "Conversations",
    path: "/conversations",
  },
  {
    icon: <BookOpenIcon className="h-5 w-5" />,
    label: "Knowledge Base",
    path: "/knowledge-base",
  },
  {
    icon: <SettingsIcon className="h-5 w-5" />,
    label: "Settings",
    path: "/settings",
  },
];

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile, open, toggleSidebar } = useSidebar();
  const { main_sidebar_state } = useSidebarStore();

  useEffect(() => {
    if (!open && main_sidebar_state) {
      toggleSidebar();
    } else if (open && !main_sidebar_state) {
      toggleSidebar();
    }
  }, [open, main_sidebar_state, toggleSidebar]);

  return (
    <Sidebar
      collapsible="icon"
      className="group-data-[side=left]:border-r-0 z-[99999] w-64 bg-gray-50 dark:bg-gray-900"
    >
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <Link
            href="/"
            onClick={() => setOpenMobile(false)}
            className="flex items-center"
          >
            <span className="text-2xl font-bold px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors duration-200">
              Law AI
            </span>
          </Link>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-2 py-4">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <div
                    onClick={() => {
                      router.push(item.path);
                      setOpenMobile(false);
                    }}
                    className={cn(
                      buttonVariants({
                        variant: "ghost",
                        className: "justify-start w-full cursor-pointer",
                      })
                    )}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t z-[500] border-gray-200 dark:border-gray-700 p-4">
        {user && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarUserNav user={user} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
