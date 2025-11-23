import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import DreamGlobe from '@/components/dream-globe';

export default function Page() {
  return (
    <div className="h-screen flex overflow-hidden w-screen">
      <SidebarProvider>
        {/* These components define the sidebar's width */}
        <AppSidebar />
        <SidebarInset></SidebarInset>
      </SidebarProvider>

      <DreamGlobe />
    </div>
  );
}
