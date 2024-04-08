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
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

export default function OTP() {
    const router = useRouter();
    const formSchema = z.object({
        pin: z.string().min(4, {
            message: "Your one-time password must be 4 characters.",
        }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            pin: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setSubmitting(true);
        console.log("otp = ", values);
        setTimeout(() => {
            setSubmitting(false);
            router.replace("/switchProfile");
        }, 2000);
    }
    // submitting
    const [submitting, setSubmitting] = useState<boolean>(false);

    return (
        <>
            <div className="h-full flex items-center justify-center">
                <div className="card">
                    <h1>Welcome to the University Result Analysis Portal!</h1>
                    <p>
                        Please enter the OTP that was sent to your email
                        address.
                    </p>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="pin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>One-Time Password</FormLabel>
                                        <FormControl>
                                            <InputOTP maxLength={4} {...field}>
                                                <InputOTPGroup className="w-1/2 flex">
                                                    <InputOTPSlot
                                                        index={0}
                                                        className="flex-1"
                                                    />
                                                    <InputOTPSlot
                                                        index={1}
                                                        className="flex-1"
                                                    />
                                                    <InputOTPSlot
                                                        index={2}
                                                        className="flex-1"
                                                    />
                                                    <InputOTPSlot
                                                        index={3}
                                                        className="flex-1"
                                                    />
                                                </InputOTPGroup>
                                            </InputOTP>
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
