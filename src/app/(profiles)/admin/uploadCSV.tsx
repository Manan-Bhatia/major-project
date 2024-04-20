import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function UploadCSV({
    props,
    refreshData,
}: {
    props: {
        course: number;
        passing: number;
        shift: string | undefined;
        semester: number;
        courseName: string | undefined;
        courseLength: number;
        courseAbbreviation: string | undefined;
        subjects: { subject: string; code: string }[];
    };
    refreshData: () => void;
}) {
    const subjectFields: Record<string, z.ZodType<string>> = {};
    props.subjects.forEach((subject) => {
        subjectFields[subject.code] = z.string();
    });
    const formSchema = z.object({
        course: z.coerce.number(),
        passing: z.coerce.number(),
        shift: z.string(),
        semester: z.coerce.number(),
        headers_to_add: z.string(),
        footers_to_add: z.string(),
        excel_file: z
            .any()
            .refine((file) => file?.length === 1, "File is required"),
        ...subjectFields,
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            course: props.course,
            passing: props.passing,
            shift: props.shift || "",
            semester: props.semester,
            headers_to_add: "",
            footers_to_add: "",
            excel_file: undefined,
            ...Object.fromEntries(
                props.subjects.map((subject) => [subject.code, ""])
            ),
        },
        mode: "onChange",
    });
    useEffect(() => {
        form.setValue("course", props.course);
        form.setValue("passing", props.passing);
        form.setValue("shift", props.shift || "");
        form.setValue("semester", props.semester);
    }, [props]);
    const generateHeaders = () => {
        let headers: [string][] = [["Maharaja Surajmal Institute"]];
        let courseAndBatch: [string] = [
            props.courseName +
                " Batch " +
                String(props.passing - props.courseLength) +
                "-" +
                String(props.passing),
        ];
        headers.push(courseAndBatch);
        let classInfo: [string] = [
            "Class-: " +
                props.courseAbbreviation +
                ` Semester ${props.semester} Batch [${
                    props.passing - props.courseLength
                }-${props.passing}]`,
        ];
        headers.push(classInfo);
        return headers;
    };
    let footers = [["102-Applied Maths Dr. Anchal Tehlan (Sec A & B)"]];
    const generateFooters = (
        subjects: { subject: string; code: string }[],
        values: z.infer<typeof formSchema>
    ) => {
        let footers: [string][] = [];
        subjects.forEach((subject) => {
            let subjectInfo: [string];
            subjectInfo = [
                `${subject.code}-${subject.subject}: ${
                    values[subject.code as keyof typeof values]
                }`,
            ];
            footers.push(subjectInfo);
        });
        return footers;
    };
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const formData = new FormData();
            formData.append("excel_file", values.excel_file[0]);
            formData.append("course", values.course.toString());
            formData.append("passing", values.passing.toString());
            formData.append("semester", values.semester.toString());
            formData.append(
                "headers_to_add",
                JSON.stringify(generateHeaders())
            );
            formData.append(
                "footers_to_add",
                JSON.stringify(generateFooters(props.subjects, values))
            );
            const res = await axios.post(
                "https://resultlymsi.pythonanywhere.com/results/normalize/",
                formData
            );
            if (res.status === 200) refreshData();
        } catch (error: any) {
            console.log("Error in normalization", error);
        }
    }
    const fileRef = form.register("excel_file");

    return (
        <div>
            <Dialog>
                <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
                    Upload
                </DialogTrigger>
                <DialogContent className="max-h-[70%] overflow-y-scroll">
                    <DialogHeader>
                        <DialogTitle className="capitalize">
                            Upload new document
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="excel_file"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CSV File</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                placeholder="File"
                                                {...fileRef}
                                                accept=".csv"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {props.subjects && props.subjects.length > 0 && (
                                <>
                                    <div>Subject Teachers (optional)</div>
                                    {props.subjects.map((subject, index) => (
                                        <FormField
                                            control={form.control}
                                            name={subject.code as any}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {`${subject.code}-${subject.subject}`}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={
                                                                subject.subject
                                                            }
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </>
                            )}
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
