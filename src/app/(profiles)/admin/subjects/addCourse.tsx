"use client";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import axios from "axios";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
const formSchema = z.object({
    name: z.string(),
    abbreviation: z.string(),
    no_of_semesters: z.coerce
        .number()
        .min(0, { message: "Number of semesters must be greater than 0" })
        .max(10, {
            message: "Number of semesters must be less than or equal to 10",
        }),
    no_shifts: z.coerce
        .number()
        .min(0, { message: "Number of shifts must be greater than 0" })
        .max(2, { message: "Number of shifts must be less than or equal to 2" }),
});
export default function AddCourse({
    callRefresh,
}: {
    callRefresh: () => void;
}) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            abbreviation: "",
            no_of_semesters: 0,
            no_shifts: 0,
        },
    });
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const data = { ...values, password: "password" };
            const res = await axios.post(
                "https://resultlymsi.pythonanywhere.com/accounts/api_admin/results/course/add/",
                { data }
            );
            if (res.status === 201) {
                setFormStatus({
                    type: "success",
                    message: ["Course added successfully!"],
                });
                callRefresh();
                setTimeout(() => {
                    setFormStatus(null);
                }, 2000);
            }
        } catch (error: any) {
            let message: string[] = [];
            Object.keys(error.response.data.errors).forEach((key) => {
                message.push(`${key}: ${error.response.data.errors[key][0]}`);
            });

            setFormStatus({
                type: "error",
                message,
            });
            setTimeout(() => {
                setFormStatus(null);
            }, 5000);
        }
    }
    const [formStatus, setFormStatus] = useState<{
        type: "success" | "error";
        message: string[];
    } | null>();
    return (
        <div>
            <div className="w-2/5 space-y-6 rounded-lg border p-4">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="abbreviation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Abbreviation</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Abbreviation"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="no_of_semesters"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Semesters</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            className="appearance-none"
                                            placeholder="Semesters"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="no_shifts"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Shifts</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            className="appearance-none"
                                            placeholder="Shifts"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            Submit
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
                                        : "Error Occurred!"}
                                </AlertTitle>
                                <AlertDescription>
                                    {formStatus.message.map((message) => (
                                        <div
                                            className="capitalize"
                                            key={message}
                                        >
                                            {message}
                                        </div>
                                    ))}
                                </AlertDescription>
                            </Alert>
                        )}
                    </form>
                </Form>
            </div>
        </div>
    );
}
