"use client";
import { IoChevronBack } from "react-icons/io5";
import { ThemeToggle } from "@/components/ui/themeToggle";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function NavBar({ switchProfileEnabled = false }) {
    const router = useRouter();
    const goBack = () => {
        router.back();
    };
    const pathName = usePathname();
    const [defaultValue, setDefaultValue] = useState<string>("");
    useEffect(() => {
        if (pathName) {
            if (pathName.split("/")[1] === "teacher")
                setDefaultValue("Teacher");
            if (pathName.split("/")[1] === "admin") setDefaultValue("Admin");
        }
    }, []);
    const handleProfileChange = (e: string) => {
        router.push(`/${e.toLowerCase()}`);
    };
    return (
        <header className="flex items-center justify-between border-b px-2 md:px-20 md:py-5 py-4">
            <IoChevronBack
                size={36}
                className="cursor-pointer"
                onClick={goBack}
            />
            <span className="text-4xl font-extrabold">ResultLy</span>
            <span className="flex items-center gap-4 relative">
                {switchProfileEnabled && defaultValue && (
                    <Select
                        defaultValue={defaultValue}
                        onValueChange={(e) => handleProfileChange(e)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Switch Profile" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Teacher">Teacher</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                )}
                <ThemeToggle />
            </span>
        </header>
    );
}
