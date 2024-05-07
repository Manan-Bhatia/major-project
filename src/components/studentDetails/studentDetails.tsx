import { Button } from "@/components/ui/button";
import axios from "axios";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "../ui/input";
export default function StudentDetails() {
    const [courses, setCourses] = useState<
        {
            abbreviation: string;
            name: string;
            description: string;
            no_of_semesters: number;
            shift: string;
            pk: number;
        }[]
    >();
    const [loading, setLoading] = useState<boolean>(false);
    const getCourses = async () => {
        try {
            let url =
                "https://resultlymsi.pythonanywhere.com/accounts/api_admin/results/course/list/";
            const res = await axios.get(url);
            let data = res.data;
            data = data.map((course: { [key: string]: any }) => {
                let obj = { ...course };
                delete obj["detail_url"];
                return obj;
            });
            setCourses(data);
        } catch (error) {
            console.log("Error getting courses", error);
        }
    };
    let timeout: NodeJS.Timeout;
    useEffect(() => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            getCourses();
        }, 1000);
        return () => clearTimeout(timeout);
    }, []);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const getCourseName = (pk: number) => {
        const course = courses?.find((course) => course.pk === pk);
        if (course) {
            return `${course.abbreviation} (${course.shift}) ${
                course.description && `(${course.description})`
            }`;
        }
    };
    const getCourseLength = (selectedCourse: number): number => {
        const course = courses?.find((course) => course.pk === selectedCourse);
        if (course) {
            return Number(course.no_of_semesters / 2);
        }
        return 0;
    };
    const [passoutYearOptions, setPassoutYearOptions] = useState<number[]>();
    useEffect(() => {
        const courseLength = getCourseLength(Number(selectedCourse));
        const currentYear = new Date().getFullYear();
        let arr: number[] = [];
        for (let i = -courseLength; i <= courseLength; i++)
            arr.push(currentYear + i);
        setPassoutYearOptions(arr);
    }, [selectedCourse]);
    const [selectedPassoutYear, setSelectedPassoutYear] = useState<string>("");

    const [studentDataAvailable, setStudentDataAvailable] =
        useState<boolean>(false);
    const checkStudentDataAvailability = async () => {
        try {
            setLoading(true);
            // replace with student api
            const res = await axios.get(
                `https://resultlymsi.pythonanywhere.com/results/check-student_data?course=${selectedCourse}&passout=${selectedPassoutYear}`
            );
            setStudentDataAvailable(res.data.status);
        } catch (error) {
            console.log("Error in checking student data availability", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (selectedCourse === "" || selectedPassoutYear === "") return;
        checkStudentDataAvailability();
    }, [selectedCourse, selectedPassoutYear]);

    const handleDeleteDocument = async () => {
        try {
            const formData = new FormData();
            formData.append("course", selectedCourse);
            formData.append("passout", selectedPassoutYear);

            const res = await axios.post(
                "https://resultlymsi.pythonanywhere.com/results/delete_student_data/",
                formData
            );
            if (res.status === 200) checkStudentDataAvailability();
        } catch (error) {
            console.log("Error deleting document", error);
        }
    };

    const handleUploadDocument = async (values: z.infer<typeof formSchema>) => {
        try {
            const formData = new FormData();
            formData.append("csv_file", values.excel_file[0]);
            formData.append("course", selectedCourse);
            formData.append("passout", selectedPassoutYear);
            const res = await axios.post(
                "https://resultlymsi.pythonanywhere.com/results/student_data/",
                formData
            );
            console.log(res);
            if (res.status === 200) checkStudentDataAvailability();
        } catch (error) {
            console.log("Error deleting document", error);
        }
    };

    const handleDownloadDocument = async () => {
        try {
            const url = `https://resultlymsi.pythonanywhere.com/results/student_data?action=fetch_file&course=${selectedCourse}&passout=${selectedPassoutYear}`;
            window.electronAPI.send("download-document", url);
        } catch (error) {
            console.log("Error downloading document", error);
        }
    };
    const downloadTemplateFile = async () => {
        try {
            const url =
                "https://resultlymsi.pythonanywhere.com/results/student_data?action=template";
            window.electronAPI.send("download-document", url);
        } catch (error) {
            console.log("Error downloading template file", error);
        }
    };

    const formSchema = z.object({
        excel_file: z
            .any()
            .refine((file) => file?.length === 1, "File is required"),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            excel_file: undefined,
        },
        mode: "onChange",
    });
    const fileRef = form.register("excel_file");

    return (
        <div className="space-y-5">
            <h1>Student Details</h1>
            <Button variant="secondary" onClick={downloadTemplateFile}>
                Download Template File (.csv)
            </Button>
            <div className="flex gap-4 items-center">
                {courses ? (
                    <Select
                        value={selectedCourse}
                        onValueChange={setSelectedCourse}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select course">
                                {getCourseName(Number(selectedCourse))}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map((course) => (
                                <SelectItem
                                    key={course.pk}
                                    value={course.pk.toString()}
                                >
                                    <div className="flex flex-col">
                                        <span>
                                            {course.name} ({course.abbreviation}
                                            )
                                        </span>
                                        {course.description && (
                                            <span>{course.description}</span>
                                        )}
                                        <span>{course.shift}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Skeleton className="w-full h-5" />
                )}

                {passoutYearOptions ? (
                    <Select
                        value={selectedPassoutYear}
                        onValueChange={setSelectedPassoutYear}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select passout year" />
                        </SelectTrigger>
                        <SelectContent>
                            {passoutYearOptions.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Skeleton className="h-5 w-full" />
                )}
                {selectedCourse !== "" &&
                    selectedPassoutYear !== "" &&
                    (loading ? (
                        <Skeleton className="w-1/4 h-5" />
                    ) : studentDataAvailable ? (
                        <>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="default">
                                        Upload Edited Document (.csv)
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
                                            onSubmit={form.handleSubmit(
                                                handleUploadDocument
                                            )}
                                            className="space-y-4"
                                        >
                                            <FormField
                                                control={form.control}
                                                name="excel_file"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            CSV File
                                                        </FormLabel>
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
                                            <Button type="submit">
                                                Submit
                                            </Button>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                            <Button onClick={handleDownloadDocument}>
                                Download CSV
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            <div>
                                                This action cannot be undone.
                                                This will delete the following
                                                document -
                                            </div>
                                            <div>
                                                {getCourseName(
                                                    Number(selectedCourse)
                                                )}
                                            </div>
                                            <div>
                                                Batch{" "}
                                                {Number(selectedPassoutYear) -
                                                    getCourseLength(
                                                        Number(selectedCourse)
                                                    )}{" "}
                                                - {selectedPassoutYear}
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() =>
                                                handleDeleteDocument()
                                            }
                                        >
                                            Confirm
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    ) : (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="default">
                                    Upload File (.csv)
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
                                        onSubmit={form.handleSubmit(
                                            handleUploadDocument
                                        )}
                                        className="space-y-4"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="excel_file"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        CSV File
                                                    </FormLabel>
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
                                        <Button type="submit">Submit</Button>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    ))}
            </div>
        </div>
    );
}
