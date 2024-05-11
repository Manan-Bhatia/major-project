"use client";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useEffect, useState } from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
    is_not_university: z.coerce.boolean(),
    is_practical: z.coerce.boolean(),
    course: z.string(),
});
import { Subject } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";

export default function UpdateCourse({
    subject,
    callRefresh,
}: {
    subject: Subject;
    callRefresh: () => void;
}) {
    const [courses, setCourses] = useState<
        {
            name: string;
            description: string;
            abbreviation: string;
            pk: number;
            shift: number;
        }[]
    >();
    const getCourses = async () => {
        try {
            const res = await axios.get(
                "https://resultlymsi.pythonanywhere.com/accounts/api_admin/results/course/list/"
            );
            let data = res.data;
            const Fields = [
                "name",
                "description",
                "abbreviation",
                "pk",
                "shift",
            ];
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
            console.log(data, subject);
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
            subject: subject.subject,
            code: subject.code,
            credit: subject.credit,
            semester: subject.semester,
            is_not_university: subject.is_not_university,
            is_practical: subject.is_practical,
            course: subject.course.toString(),
        },
    });
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const data = { ...values, password: "password" };
            const res = await axios.put(subject.update_url, { data });
            if (res.status === 200) {
                setFormStatus({
                    type: "success",
                    message: ["Subject updated successfully!"],
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
            setTimeout(() => {
                setFormStatus(null);
            }, 5000);
        }
    }
    const [formStatus, setFormStatus] = useState<{
        type: "success" | "error";
        message: string[];
    } | null>();
    const getCourseName = (pk: number) => {
        const course = courses?.find((course) => course.pk === pk);
        if (course) {
            return `${course.abbreviation} (${course.shift}) ${
                course.description && `(${course.description})`
            }`;
        }
    };
    const [selectedCourse, setselectedCourse] = useState<string>(
        subject.course.toString()
    );

    return (
        <div>
            <div>
                {courses && courses.length > 0 ? (
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
                                            <Input
                                                placeholder="Name"
                                                {...field}
                                            />
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
                                        <Select
                                            value={selectedCourse}
                                            onValueChange={setselectedCourse}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Course">
                                                        {getCourseName(
                                                            Number(
                                                                selectedCourse
                                                            )
                                                        )}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {courses &&
                                                    courses.map((course) => (
                                                        <SelectItem
                                                            key={course.pk}
                                                            value={course.pk.toString()}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span>
                                                                    {
                                                                        course.name
                                                                    }{" "}
                                                                    (
                                                                    {
                                                                        course.abbreviation
                                                                    }
                                                                    )
                                                                </span>
                                                                {course.description && (
                                                                    <span>
                                                                        {
                                                                            course.description
                                                                        }
                                                                    </span>
                                                                )}
                                                                <span>
                                                                    {
                                                                        course.shift
                                                                    }
                                                                </span>
                                                            </div>
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
                                                placeholder="Shifts"
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
                                                placeholder="Shifts"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="is_not_university"
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
                ) : (
                    <Skeleton className="w-full h-5" />
                )}
            </div>
        </div>
    );
}
