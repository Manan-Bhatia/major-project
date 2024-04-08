"use client";
import NavBar from "@/components/navbar";
import { usePathname } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const path = usePathname();
    const [routes, setRoutes] = useState<string[]>([]);
    useEffect(() => {
        setRoutes(path.split("/").filter((item) => item != ""));
    }, [path]);
    return (
        <main className="flex flex-col h-dvh">
            <NavBar switchProfileEnabled />
            <section className="flex-1 p-2 md:px-20 md:py-5 space-y-6">
                <div>
                    <Breadcrumb>
                        <BreadcrumbList className="capitalize">
                            {routes.map((route, index) => {
                                console.log(route);
                                if (routes.length === index + 1) return;
                                return (
                                    <>
                                        <BreadcrumbItem>
                                            <BreadcrumbLink asChild>
                                                <Link href={`/${route}`}>
                                                    {route}
                                                </Link>
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator />
                                    </>
                                );
                            })}
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    {routes[routes.length - 1]}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                {children}
            </section>
        </main>
    );
}
