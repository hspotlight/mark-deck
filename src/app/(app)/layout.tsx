import AuthGuard from "@/components/AuthGuard";
import AppNavBar from "@/components/AppNavBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <AppNavBar />
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
