"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios, { formToJSON } from "axios";
import { setCookie } from "cookies-next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
    // loading
    const [loading, setLoading] = useState<boolean>(true);
    if (typeof window !== undefined)
        useEffect(() => {
            window.electronAPI.send("rendererReady", "ready");
            window.electronAPI.receiveTokenFromMain((token) => {
                if (token != "" && token != undefined) {
                    setCookie("token", token);
                    router.replace("/switchProfile");
                }
                setLoading(false);
            });
        }, []);
    const router = useRouter();
    // form message
    const [formStatus, setFormStatus] = useState<{
        type: "success" | "error";
        message: string;
    } | null>();
    const formSchema = z.object({
        email: z
            .string()
            .email({ message: "Please enter a valid email address." }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setSubmitting(true);
            console.log(values);
            const res = await axios.post(
                "https://resultlymsi.pythonanywhere.com/accounts/send_otp/",
                values
            );
            localStorage.setItem("email", values.email);
            if (res.status === 200) {
                setFormStatus({
                    type: "success",
                    message: "OTP has been sent successfully!",
                });
                setTimeout(() => {
                    router.push("/otp");
                    setFormStatus(null);
                }, 1000);
            }
        } catch (error: any) {
            setFormStatus({
                type: "error",
                message: error.response.data.error,
            });
            setTimeout(() => {
                setFormStatus(null);
            }, 3500);
        } finally {
            setSubmitting(false);
        }
    }
    // submitting
    const [submitting, setSubmitting] = useState<boolean>(false);

    return (
        <>
            <div className="h-full flex items-center justify-center">
                {loading ? (
                    <div className="flex gap-4 items-center">
                        <h1>Loading...</h1>
                        <Loader2 className="animate-spin" size={60} />
                    </div>
                ) : (
                    <div className="card">
                        <h1>
                            Welcome to the University Result Analysis Portal!
                        </h1>
                        <p>
                            Please enter your credentials to access the portal.
                        </p>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Email"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            <span>Please wait</span>
                                        </>
                                    ) : (
                                        <span>Submit</span>
                                    )}
                                </Button>
                                {formStatus && (
                                    <Alert
                                        variant={
                                            formStatus.type === "success"
                                                ? "default"
                                                : "destructive"
                                        }
                                    >
                                        <AlertTitle>
                                            {formStatus.type === "success"
                                                ? "Success!"
                                                : "An Error Occurred!"}
                                        </AlertTitle>
                                        <AlertDescription>
                                            {formStatus.message}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </form>
                        </Form>
                    </div>
                )}
            </div>
        </>
    );
}
