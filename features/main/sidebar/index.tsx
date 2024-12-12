"use client";

import * as React from "react";
import {
  ArchiveX,
  ChartBar,
  Command,
  File,
  FileText,
  Home,
  Inbox,
  MessageSquare,
  PanelLeft,
  Search,
  Send,
  Trash2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";

import { Button } from "@/components/ui/button";
import { BetterTooltip } from "@/components/ui/tooltip";
import { cn } from "@/utils";
import { useRouter } from "next/navigation";

// This is sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Chats",
      url: "/chats",
      icon: MessageSquare,
      isActive: true,
    },
    {
      title: "Drafts",
      url: "/drafts",
      icon: Search,
      isActive: false,
    },
    {
      title: "Review",
      url: "/reviews",
      icon: FileText,
      isActive: false,
    },
  ],
};

export function AppSidebar({ ...props }: any) {
  // Note: I'm using state to show active item.

  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = React.useState(data.navMain[0]);
  const { setOpen, toggleSidebar, open } = useSidebar();
  const router = useRouter();

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r !p-0"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="">
          <SidebarGroup>
            <SidebarGroupContent className="">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      size={"lg"}
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      // isActive={activeItem.title === item.title}
                      asChild
                      className="md:px-0 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Button
                        buttonSize="medium"
                        // variant="outline"
                        onClick={() => router.push(item.url)}
                        className={cn(
                          "flex gap-4 justify-start border-0 text-black border-input bg-background hover:bg-accent hover:text-accent-foreground",
                          !open && "gap-0 justify-center"
                        )}
                      >
                        <item.icon className="" />
                        <span className={cn(!open && "hidden")}>
                          {item.title}
                        </span>
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <BetterTooltip content="Toggle Sidebar" align={"end"}>
            {/* <Button
              onClick={toggleSidebar}
              variant="outline"
              className="md:px-2 md:h-fit"
            > */}
            <PanelLeft onClick={toggleSidebar} />
            {/* </Button> */}
          </BetterTooltip>
          {/* <SidebarToggle align=""/> */}
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
    </Sidebar>
  );
}
