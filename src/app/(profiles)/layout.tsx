import NavBar from "@/components/navbar";
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="flex flex-col h-dvh">
            <NavBar switchProfileEnabled />
            <section className="flex-1 p-2 md:px-20 md:py-5">
                {children}
            </section>
        </main>
    );
}
