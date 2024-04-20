import { Button } from "@/components/ui/button";
import axios from "axios";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import UploadCSV from "./uploadCSV";

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
import { number } from "zod";
export default function Normalize() {
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
            const res = await axios.get(
                "https://resultlymsi.pythonanywhere.com/accounts/api_admin/results/course/list/"
            );
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

    const [resultsAvailable, setResultsAvailable] = useState<number[]>([]);
    const [resultsPkMapping, setResultsPkMapping] = useState<
        {
            [key: number]: number;
        }[]
    >([]);
    const checkResults = async () => {
        try {
            setLoading(true);
            const res = await axios.post(
                "https://resultlymsi.pythonanywhere.com/results/check-result/",
                {
                    course: Number(selectedCourse),
                    passing: Number(selectedPassoutYear),
                }
            );
            setResultsPkMapping(res.data);
            setResultsAvailable(Object.keys(res.data).map((x) => Number(x)));
        } catch (error) {
            console.log("Error in getting results", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (selectedCourse === "" || selectedPassoutYear === "") return;
        checkResults();
    }, [selectedCourse, selectedPassoutYear]);
    useEffect(() => {
        if (selectedCourse === "") return;
        getSubjectsData();
    }, [selectedCourse]);
    const [subjects, setSubjects] = useState<
        {
            subject: string;
            code: string;
            semester: string;
        }[]
    >([]);
    const getSubjectsData = async () => {
        try {
            const res = await axios.get(
                "https://resultlymsi.pythonanywhere.com/accounts/api_admin/results/subject/list/"
            );
            if (res.status === 200) {
                let data = res.data;
                data = data.map((subject: { [key: string]: [value: any] }) => {
                    let obj: {
                        [key: string]: any;
                    } = {};
                    const Fields = ["subject", "code", "semester"];
                    Fields.forEach((field) => {
                        if (subject.hasOwnProperty(field)) {
                            obj[field] = subject[field];
                        }
                    });
                    return obj;
                });
                setSubjects(data);
            }
        } catch (error) {
            console.log("Error getting users data", error);
        }
    };

    const handleDeleteDocument = async (semester: number) => {
        try {
            const pk = resultsPkMapping[Number(semester)];
            const res = await axios.delete(
                `https://resultlymsi.pythonanywhere.com/accounts/api_admin/results/result/${pk}/delete/`
            );
            console.log(res);
            if (res.status === 200) checkResults();
        } catch (error) {
            console.log("Error deleting document", error);
        }
    };

    const handleDownloadDocument = async (semester: number) => {
        try {
            const pk = resultsPkMapping[Number(semester)];
            if (pk !== undefined) {
                const url = `https://resultlymsi.pythonanywhere.com/results/download-result/${pk}`;
                window.electronAPI.send("download-document", url);
            } else {
                throw new Error("No Document is present");
            }
        } catch (error) {
            console.log("Error downloading document", error);
        }
    };

    return (
        <div className="space-y-5">
            <h1>Normalize Documents</h1>
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
            </div>
            {selectedCourse != "" &&
                selectedPassoutYear != "" &&
                (loading ? (
                    <div className="border rounded-lg flex py-4">
                        <Table className="w-2/5 mx-auto border">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-5">
                                        Semester
                                    </TableHead>
                                    <TableHead className="w-48">
                                        Upload or Edit
                                    </TableHead>
                                    <TableHead className="w-48">
                                        Download
                                    </TableHead>
                                    <TableHead className="w-48">
                                        Delete
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array(6)
                                    .fill(0)
                                    .map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="p-6">
                                                <Skeleton className="h-5" />
                                            </TableCell>
                                            <TableCell className="p-6">
                                                <Skeleton className="h-5" />
                                            </TableCell>
                                            <TableCell className="p-6">
                                                <Skeleton className="h-5" />
                                            </TableCell>
                                            <TableCell className="p-6">
                                                <Skeleton className="h-5" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="border rounded-lg flex py-4">
                        <Table className="w-2/5 mx-auto border">
                            <TableCaption>
                                {getCourseName(Number(selectedCourse))} Batch{" "}
                                {Number(selectedPassoutYear) -
                                    getCourseLength(Number(selectedCourse))}
                                -{Number(selectedPassoutYear)} Documents
                            </TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-5">
                                        Semester
                                    </TableHead>
                                    <TableHead className="w-48">
                                        Upload or Edit
                                    </TableHead>
                                    <TableHead className="w-48">
                                        Download
                                    </TableHead>
                                    <TableHead className="w-48">
                                        Delete
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedCourse &&
                                    Array(
                                        getCourseLength(
                                            Number(selectedCourse)
                                        ) * 2
                                    )
                                        .fill(0)
                                        .map((v, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    {resultsAvailable.includes(
                                                        index + 1
                                                    ) ? (
                                                        <Button
                                                            variant="outline"
                                                            className="w-full"
                                                        >
                                                            Edit
                                                        </Button>
                                                    ) : (
                                                        <UploadCSV
                                                            props={{
                                                                course: Number(
                                                                    selectedCourse
                                                                ),
                                                                courseName:
                                                                    getCourseName(
                                                                        Number(
                                                                            selectedCourse
                                                                        )
                                                                    ),
                                                                passing:
                                                                    Number(
                                                                        selectedPassoutYear
                                                                    ),
                                                                semester:
                                                                    index + 1,
                                                                shift: courses?.find(
                                                                    (course) =>
                                                                        course.pk ===
                                                                        Number(
                                                                            selectedCourse
                                                                        )
                                                                )?.shift,
                                                                courseLength:
                                                                    getCourseLength(
                                                                        Number(
                                                                            selectedCourse
                                                                        )
                                                                    ),
                                                                courseAbbreviation:
                                                                    courses?.find(
                                                                        (
                                                                            course
                                                                        ) =>
                                                                            course.pk ===
                                                                            Number(
                                                                                selectedCourse
                                                                            )
                                                                    )
                                                                        ?.abbreviation,
                                                                subjects:
                                                                    subjects.filter(
                                                                        (
                                                                            subject
                                                                        ) =>
                                                                            subject.semester ===
                                                                            String(
                                                                                index +
                                                                                    1
                                                                            )
                                                                    ),
                                                            }}
                                                            refreshData={
                                                                checkResults
                                                            }
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                        disabled={
                                                            !resultsAvailable.includes(
                                                                index + 1
                                                            )
                                                        }
                                                        onClick={() =>
                                                            handleDownloadDocument(
                                                                index + 1
                                                            )
                                                        }
                                                    >
                                                        Download
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    {resultsAvailable.includes(
                                                        index + 1
                                                    ) && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="destructive"
                                                                    className="w-full"
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        Are you
                                                                        absolutely
                                                                        sure?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        <div>
                                                                            This
                                                                            action
                                                                            cannot
                                                                            be
                                                                            undone.
                                                                            This
                                                                            will
                                                                            delete
                                                                            the
                                                                            following
                                                                            document
                                                                            -
                                                                        </div>
                                                                        <div>
                                                                            {getCourseName(
                                                                                Number(
                                                                                    selectedCourse
                                                                                )
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            Semester{" "}
                                                                            {index +
                                                                                1}
                                                                        </div>
                                                                        <div>
                                                                            Batch{" "}
                                                                            {Number(
                                                                                selectedPassoutYear
                                                                            ) -
                                                                                getCourseLength(
                                                                                    Number(
                                                                                        selectedCourse
                                                                                    )
                                                                                )}{" "}
                                                                            -{" "}
                                                                            {
                                                                                selectedPassoutYear
                                                                            }
                                                                        </div>
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>
                                                                        Cancel
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() =>
                                                                            handleDeleteDocument(
                                                                                index +
                                                                                    1
                                                                            )
                                                                        }
                                                                    >
                                                                        Confirm
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                            </TableBody>
                        </Table>
                    </div>
                ))}
        </div>
    );
}
