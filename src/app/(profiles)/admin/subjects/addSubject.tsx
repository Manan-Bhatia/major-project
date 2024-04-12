"use client";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useState, useEffect } from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    subject: z.string(),
    code: z.string(),
    credit: z.coerce.number(),
    semester: z.coerce
        .number()
        .min(0, {
            message: "Semester must be greater than 0",
        })
        .max(10, {
            message: "Semester must be less than or equal to 10",
        }),
    non_university: z.coerce.boolean(),
    is_practical: z.coerce.boolean(),
    course: z.string(),
});
export default function AddSubject({
    callRefresh,
}: {
    callRefresh: () => void;
}) {
    const [courses, setCourses] = useState<
        {
            name: string;
            description: string;
            abbreviation: string;
            pk: number;
        }[]
    >();
    const getCourses = async () => {
        try {
            const res = await axios.get(
                "https://resultlymsi.pythonanywhere.com/accounts/api_admin/results/course/list/"
            );
            let data = res.data;
            const Fields = ["name", "description", "abbreviation", "pk"];
            data = data.map((course: { [key: string]: [value: any] }) => {
                let obj: {
                    [key: string]: any;
                } = {};
                Fields.forEach((field) => {
                    if (course.hasOwnProperty(field)) {
                        obj[field] = course[field];
                    }
                });
                return obj;
            });
            console.log(data);
            setCourses(data);
        } catch (error) {
            console.log("Error getting courses", error);
        }
    };
    let timeout: NodeJS.Timeout;
    useEffect(() => {
        if (timeout) clearTimeout(timeout);
        setTimeout(() => {
            getCourses();
        }, 500);
        return () => clearTimeout(timeout);
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            subject: "",
            code: "",
            credit: 0,
            semester: 0,
            non_university: false,
            is_practical: false,
            course: "",
        },
    });
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const res = await axios.post(
                "https://resultlymsi.pythonanywhere.com/accounts/api_admin/results/subject/add/",
                { data: { ...values } }
            );
            if (res.status === 201) {
                setFormStatus({
                    type: "success",
                    message: ["Subject added successfully!"],
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
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Code</FormLabel>
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
                            name="course"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course</FormLabel>
                                    <Select onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Course" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {courses &&
                                                courses.map((course, index) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={course.pk.toString()}
                                                    >
                                                        {course.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="semester"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Semester</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Semester"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="credit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Credit</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Credit"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="non_university"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-2">
                                    <FormLabel>
                                        Non University Subject
                                    </FormLabel>
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
                        <FormField
                            control={form.control}
                            name="is_practical"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-2">
                                    <FormLabel>Practical Subject</FormLabel>
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
