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
    first_name: z.string(),
    last_name: z.string(),
    username: z.string(),
    email: z.string().email(),
    is_superuser: z.boolean(),
});
import { Teacher } from "./columns";

export default function UpdateTeacher({
    teacher,
    callRefresh,
}: {
    teacher: Teacher;
    callRefresh: () => void;
}) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            email: teacher.email,
            username: teacher.username,
            is_superuser: teacher.is_superuser,
        },
    });
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const data = { ...values, password: "password" };
            const res = await axios.put(teacher.update_url, { data });
            if (res.status === 200) {
                setFormStatus({
                    type: "success",
                    message: ["User updated successfully!"],
                });
                callRefresh();
                setTimeout(() => {
                    setFormStatus(null);
                }, 2000);
            }
        } catch (error: any) {
            let message: string[] = [];
            Object.keys(error.response.data).forEach((key) => {
                message.push(`${key}: ${error.response.data[key][0]}`);
            });

            setFormStatus({
                type: "error",
                message,
            });
            // setTimeout(() => {
            //     setFormStatus(null);
            // }, 5000);
        }
    }
    const [formStatus, setFormStatus] = useState<{
        type: "success" | "error";
        message: string[];
    } | null>();
    return (
        <div>
            <div>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Username"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="First Name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Last Name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="is_superuser"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-2">
                                    <FormLabel>Is Admin</FormLabel>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
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
