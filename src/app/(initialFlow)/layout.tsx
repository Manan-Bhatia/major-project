import NavBar from "@/components/navbar";
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="flex flex-col h-dvh">
            <NavBar  />
            <section className="flex-1">{children}</section>
        </main>
    );
}
