"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function Home() {
    const router = useRouter();
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

    function onSubmit(values: z.infer<typeof formSchema>) {
        setSubmitting(true);
        console.log("email = ", values);
        setTimeout(() => {
            setSubmitting(false);
            router.push("/otp");
        }, 2000);
    }
    // submitting
    const [submitting, setSubmitting] = useState<boolean>(false);

    return (
        <>
            <div className="h-full flex items-center justify-center">
                <div className="card">
                    <h1>Welcome to the University Result Analysis Portal!</h1>
                    <h2>Login</h2>
                    <p>Please enter your credentials to access the portal.</p>
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
                        </form>
                    </Form>
                </div>
            </div>
        </>
    );
}
