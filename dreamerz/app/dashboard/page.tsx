'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import dynamic from 'next/dynamic';

const DreamGlobe = dynamic(() => import('@/components/dream-globe'), {
  ssr: false,
});
const VoiceForm = dynamic(() => import("@/components/voice-form"), {
  ssr: false,
});

export default function Page() {
  return (
    <div className="h-screen flex overflow-hidden w-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset></SidebarInset>
      </SidebarProvider>
      <DreamGlobe />
      <div className="fixed flex bottom-8 left-1/2 transform -translate-x-1/2  space-x-4 z-50">
        <UploadDream />
        <VoiceForm />
      </div>
    </div>
  );
}
