"use client";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { FaUser, FaUserCog } from "react-icons/fa";

export default function Home() {
    const router = useRouter();
    return (
        <>
            <div className="h-full flex items-center justify-center">
                <div className="flex gap-4 h-1/5 items-center">
                    <div
                        onClick={() => {
                            router.push("/teacher");
                        }}
                        className="cursor-pointer bg-foreground text-background aspect-square flex flex-col items-center gap-2 justify-center hover:rounded-lg rounded-[2rem] p-8 h-full transition-all duration-150 "
                    >
                        <FaUser size={64} />
                        <h3>Teacher</h3>
                    </div>
                    <Separator
                        orientation="vertical"
                        decorative
                        className="w-0.5"
                    />
                    <div
                        onClick={() => {
                            router.push("/admin");
                        }}
                        className="cursor-pointer bg-foreground text-background aspect-square flex flex-col items-center justify-center gap-2 hover:rounded-lg rounded-[2rem] p-8 h-full transition-all duration-150 "
                    >
                        <FaUserCog size={64} />
                        <h3>Admin</h3>
                    </div>
                </div>
            </div>
        </>
    );
}
