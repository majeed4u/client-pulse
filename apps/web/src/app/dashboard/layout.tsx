import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@client-pulse/ui/components/sidebar";
import { AppSidebar } from "@/components/dashboard/sidebar";
import { WorkspaceGuard } from "@/components/dashboard/workspace-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </WorkspaceGuard>
  );
}
