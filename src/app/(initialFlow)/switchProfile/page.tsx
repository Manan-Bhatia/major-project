"use client";
import { useRouter } from "next/navigation";
import { FaUser, FaUserCog } from "react-icons/fa";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
    const router = useRouter();
    const formSchema = z.object({
        email: z.string().email(),
        password: z.string(),
    });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const [formStatus, setformStatus] = useState<{
        type: "success" | "error";
        message: string;
    } | null>();
    const [submitting, setSubmitting] = useState<boolean>(false);
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setSubmitting(true);
            const res = await axios.post(
                "https://resultlymsi.pythonanywhere.com/accounts/api_admin/login/",
                values
            );

            if (res.status === 200) {
                console.log(res);
                setformStatus({
                    type: "success",
                    message: res.data.detail,
                });
                setTimeout(() => {
                    router.push("/admin");
                }, 2000);
                setformStatus(null);
            }
        } catch (error) {
            setformStatus({
                type: "error",
                message: "An Error Occurred!",
            });
            setTimeout(() => {
                setformStatus(null);
            }, 2000);
        } finally {
            setSubmitting(false);
        }
    }
    const [adminLoggedIn, setadminLoggedIn] = useState<boolean>(false);

    let timeout: NodeJS.Timeout;

    useEffect(() => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            checkAdminLogin();
        }, 1000);
        return () => {
            clearTimeout(timeout);
        };
    }, []);
    const checkAdminLogin = async () => {
        try {
            const res = await axios.get(
                "https://resultlymsi.pythonanywhere.com/accounts/api_admin/index/"
            );
            if (res.status === 200) setadminLoggedIn(true);
            if (res.status === 403) setadminLoggedIn(false);
        } catch (error) {}
    };
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
                    <Dialog>
                        <DialogTrigger className="cursor-pointer bg-foreground text-background aspect-square flex flex-col items-center justify-center gap-2 hover:rounded-lg rounded-[2rem] p-8 h-full transition-all duration-150 ">
                            <div>
                                <FaUserCog size={64} />
                                <h3>Admin</h3>
                            </div>
                        </DialogTrigger>

                        <DialogContent>
                            {adminLoggedIn ? (
                                <>
                                    <DialogHeader className="space-y-3">
                                        <DialogTitle className="capitalize">
                                            Already Logged In
                                        </DialogTitle>
                                        <h3>Already Logged In</h3>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button
                                            variant="default"
                                            className="capitalize"
                                            onClick={() =>
                                                router.push("/admin")
                                            }
                                        >
                                            Go to admin panel
                                        </Button>
                                    </DialogFooter>
                                </>
                            ) : (
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                    >
                                        <DialogHeader className="space-y-3">
                                            <DialogTitle className="capitalize">
                                                Enter Admin Credentials
                                            </DialogTitle>
                                            <DialogDescription className="capitalize">
                                                Enter admin credentials to
                                                access the admin dashboard
                                            </DialogDescription>

                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Email
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder=""
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Password
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="password"
                                                                placeholder=""
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {formStatus && (
                                                <Alert
                                                    variant={
                                                        formStatus.type ===
                                                        "success"
                                                            ? "default"
                                                            : "destructive"
                                                    }
                                                >
                                                    <AlertTitle>
                                                        {formStatus.type ===
                                                        "success"
                                                            ? "Success!"
                                                            : "An Error Occurred!"}
                                                    </AlertTitle>
                                                    <AlertDescription>
                                                        {formStatus.message}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                    >
                                                        Close
                                                    </Button>
                                                </DialogClose>
                                                <Button
                                                    type="submit"
                                                    variant="default"
                                                    disabled={submitting}
                                                >
                                                    {submitting ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            <span>
                                                                Please wait
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span>Login</span>
                                                    )}
                                                </Button>
                                            </DialogFooter>
                                        </DialogHeader>
                                    </form>
                                </Form>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    );
}
