import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { auth } from "@/app/(auth)/auth";
import { ChatSidebar } from "./_components/chat-sidebar";

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get("chat-sidebar:state")?.value !== "true";

  return (
    <SidebarProvider  name="chat-sidebar" defaultOpen={!isCollapsed}>
      <ChatSidebar user={session?.user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
