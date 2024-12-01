import type { ComponentProps } from "react";

import { type SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { BetterTooltip } from "@/components/ui/tooltip";

import { SidebarLeftIcon } from "./icons";
import { Button } from "./ui/button";
import { useSidebarStore } from "@/features/main/hooks";

export function SidebarToggle({
  className,
  align = "end",
}: ComponentProps<typeof SidebarTrigger> & {
  align: "center" | "end" | "start" | undefined;
}) {
  const { toggle_chat_sidebar } = useSidebarStore();

  return (
    <BetterTooltip content="Toggle Sidebar" align={align}>
      <Button
        onClick={toggle_chat_sidebar}
        // variant="outline"
        className="md:px-2 md:h-fit"
      >
        <SidebarLeftIcon size={16} />
      </Button>
    </BetterTooltip>
  );
}
