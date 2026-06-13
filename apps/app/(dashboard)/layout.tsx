import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "var(--color-deep)" }}
    >
      <Sidebar />
      <main className="flex-1 ml-16 p-8">
        {children}
      </main>
    </div>
  );
}