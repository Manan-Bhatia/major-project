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
import { BiLogOut } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import { getCookie, deleteCookie } from "cookies-next";
import axios from "axios";
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

    // token
    const [token, setToken] = useState<boolean>(false);
    useEffect(() => {
        const token = getCookie("token");
        if (token != "" && token != undefined) setToken(true);
        else setToken(false);
    }, [pathName]);

    const handleAdminLogout = async () => {
        try {
            const res = await axios.get(
                "https://resultlymsi.pythonanywhere.com/accounts/api_admin/logout/"
            );
        } catch (error) {
            console.log("Error logging out admin", error);
        }
    };

    return (
        <header className="flex items-center justify-between border-b px-2 md:px-20 md:py-5 py-4">
            {pathName === "/" || (
                <IoChevronBack
                    size={36}
                    className="cursor-pointer"
                    onClick={goBack}
                />
            )}
            <span className="text-4xl font-extrabold select-none">
                ResultLy
            </span>
            <span className="flex items-center gap-4 relative">
                {switchProfileEnabled && defaultValue && (
                    <Button
                        variant="outline"
                        onClick={() => router.push("/switchProfile")}
                    >
                        Switch Profile
                    </Button>
                )}
                <ThemeToggle />
                {token && (
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 capitalize text-base"
                        onClick={() => {
                            window.electronAPI.send("logout", "logout");
                            handleAdminLogout();
                            deleteCookie("token");
                            router.replace("/");
                        }}
                    >
                        Logout
                        <BiLogOut size={20} />
                    </Button>
                )}
            </span>
        </header>
    );
}
