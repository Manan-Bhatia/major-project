import MultipleSelector from "../ui/mutliple-selector";
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
import { Toaster } from "../ui/toaster";
import { useToast } from "../ui/use-toast";

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
    const { toast } = useToast();
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
    const [isElective, setIsElective] = useState<boolean>(false);
    const [studentEnrollmentMapping, setStudentEnrollmentMapping] = useState<
        { label: string; value: string }[]
    >([]);
    const [electiveSubjects, setElectiveSubjects] = useState<
        { [key: string]: string }[]
    >([]);
    const [elective_list, setElective_list] = useState<
        { [key: string]: string[] }[]
    >([]);
    async function checkElective(values: z.infer<typeof formSchema>) {
        try {
            const formData = new FormData();
            formData.append("excel_file", values.excel_file[0]);
            formData.append("course", values.course.toString());
            formData.append("passing", values.passing.toString());
            formData.append("semester", values.semester.toString());
            const res = await axios.post(
                "https://resultlymsi.pythonanywhere.com/results/check_elective/",
                formData
            );
            if (res.status === 200) {
                if (res.data.status && !isElective) {
                    setIsElective(true);
                    toast({
                        title: "Elective subjects found",
                        description:
                            "Please enter elective student details before proceeding further",
                    });
                    const data: { label: string; value: string }[] = [];
                    Object.entries(
                        res.data.enrollment_name_mapping as Record<
                            string,
                            string
                        >
                    ).map(([key, value]) => {
                        let obj: {
                            label: string;
                            value: string;
                        } = {
                            label: key.slice(0, 3) + "-" + value,
                            value: key,
                        };
                        data.push(obj);
                    });
                    setStudentEnrollmentMapping(data);
                    let subject_name_mapping: { [key: string]: string }[] = [];
                    (
                        res.data.elective_list as {
                            [key: string]: string;
                        }[]
                    ).map((entry) => {
                        let obj: { [key: string]: string } = {};
                        Object.keys(entry).map((subjectCode) => {
                            obj[subjectCode] =
                                subjectCode +
                                " - " +
                                (
                                    res.data.subject_name_mapping as {
                                        [key: string]: string;
                                    }
                                )[subjectCode];
                        });
                        subject_name_mapping.push(obj);
                    });
                    setElectiveSubjects(subject_name_mapping);
                    setElective_list(
                        res.data.elective_list as { [key: string]: string[] }[]
                    );
                } else {
                    await Normlize(values);
                }
            }
        } catch (error: any) {
            console.log("Error in check elective", error);
        }
    }
    async function Normlize(values: z.infer<typeof formSchema>) {
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
            formData.append("is_elective", isElective.valueOf().toString());
            formData.append(
                "json_string_data",
                JSON.stringify({ elective_list })
            );
            const res = await axios.post(
                "https://resultlymsi.pythonanywhere.com/results/normalize/",
                formData
            );
            if (res.status === 200) refreshData();
        } catch (error) {
            console.log("Error in normalize", error);
        }
    }
    const fileRef = form.register("excel_file");
    const [formStatus, setFormStatus] = useState<{
        type: "success" | "error";
        message: string;
    } | null>();

    return (
        <div>
            <Toaster />
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        Upload
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[70%] overflow-y-scroll">
                    <DialogHeader>
                        <DialogTitle className="capitalize">
                            Upload new document
                        </DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(checkElective)}
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
                                            key={index}
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
                            {isElective && (
                                <>
                                    <h2>
                                        Enter Student Details for Elective
                                        Subjects
                                    </h2>
                                    {electiveSubjects.map((subjects, index) => (
                                        <div key={index} className="space-y-4">
                                            {Object.entries(subjects).map(
                                                ([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className="flex flex-col gap-2"
                                                    >
                                                        <div>{value}</div>
                                                        <MultipleSelector
                                                            options={
                                                                studentEnrollmentMapping
                                                            }
                                                            hidePlaceholderWhenSelected
                                                            placeholder="Select Students"
                                                            emptyIndicator={
                                                                <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                                    No Student
                                                                    Found
                                                                </p>
                                                            }
                                                            onChange={(e) => {
                                                                let data: string[] =
                                                                    [];
                                                                e.map(
                                                                    (subject) =>
                                                                        data.push(
                                                                            subject.value
                                                                        )
                                                                );
                                                                const updatedElectiveList =
                                                                    [
                                                                        ...elective_list,
                                                                    ];
                                                                updatedElectiveList[
                                                                    index
                                                                ][key] = data;
                                                                setElective_list(
                                                                    updatedElectiveList
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                            <Button className="w-full" type="submit">
                                Submit
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
