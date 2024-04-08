"use client";
import { useRouter } from "next/navigation";
import { FaUser, FaUserCog } from "react-icons/fa";

export default function Home() {
    const router = useRouter();
    return (
        <>
            <div className="h-full flex flex-col items-center justify-center gap-8">
                <h1>Choose Profile</h1>
                <div className="flex gap-4 items-center justify-center">
                    <div
                        onClick={() => {
                            router.push("/teacher");
                        }}
                        className="cursor-pointer bg-foreground text-background aspect-square flex flex-col items-center gap-2 justify-center hover:rounded-lg rounded-[2rem] p-8 h-full transition-all duration-150 "
                    >
                        <FaUser size={64} />
                        <h3>Teacher</h3>
                    </div>
                    <h3>OR</h3>
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
