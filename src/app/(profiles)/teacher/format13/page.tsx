"use client";
import { useState, useEffect } from "react";
import { Option } from "@/components/ui/mutliple-selector";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import axios from "axios";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function Format13() {
    const [facultyName, setFacultyName] = useState<string>("");

    const [submitting, setSubmitting] = useState<boolean>(false);
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
    const getCourses = async () => {
        try {
            let url =
                "https://resultlymsi.pythonanywhere.com/results/get_all_courses/";
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
    const getSubjectName = (code: string) => {
        const subject = subjectCodeMapping?.find(
            (subject) => subject.value === code
        );
        if (subject) {
            return subject.label;
        }
    };
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
    const [selectedSemester, setSelectedSemester] = useState<string>("");
    const [selectedSection, setSelectedSection] = useState<string>("");

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const obj = {
                course: Number(selectedCourse),
                passing: Number(selectedPassoutYear),
                semester: Number(selectedSemester),
                subject: selectedSubject,
                section: selectedSection,
                faculty_name: facultyName,
            };
            console.log(obj);
            const res = await axios.post(
                "https://resultlymsi.pythonanywhere.com/results/format13/",
                obj,
                { responseType: "blob" }
            );
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `${facultyName}-Faculty_Wise_Result_Analysis.docx`
            );

            document.body.appendChild(link);
            link.click();

            // Clean up
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.log("Error in submitting", error);
        } finally {
            setSubmitting(false);
        }
    };
    const [subjectCodeMapping, setSubjectCodeMapping] = useState<Option[]>([]);
    const getSubjectCodeMapping = async () => {
        try {
            const res = await axios.get(
                `https://resultlymsi.pythonanywhere.com/results/format1?semester=${selectedSemester}&course=${selectedCourse}`
            );
            let arr: { label: string; value: string }[] = [];
            Object.entries<string>(res.data).map(([key, v]) => {
                arr.push({
                    label: v,
                    value: key,
                });
            });
            setSubjectCodeMapping(arr);
        } catch (error: any) {
            console.log("Error getting subject code mapping", error);
        }
    };
    useEffect(() => {
        if (
            selectedCourse !== "" &&
            selectedPassoutYear !== "" &&
            selectedSemester !== ""
        ) {
            getSubjectCodeMapping();
        }
    }, [selectedCourse, selectedPassoutYear, selectedSemester]);
    const [selectedSubject, setSelectedSubject] = useState<string>("");

    return (
        <div className="border rounded-lg p-4 flex flex-col gap-4">
            <h1 className="capitalize">New Format Faculty Result Analysis</h1>

            <div className="flex items-center gap-4">
                <Input
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    placeholder="Enter Faculty Name"
                />

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
                {courses ? (
                    <Select
                        value={selectedSemester}
                        onValueChange={setSelectedSemester}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select semster">
                                Semester {selectedSemester}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {selectedCourse === "" ? (
                                <SelectItem value="0" disabled>
                                    Select course first
                                </SelectItem>
                            ) : (
                                Array(
                                    getCourseLength(Number(selectedCourse)) * 2
                                )
                                    .fill(0)
                                    .map((_v, index) => (
                                        <SelectItem
                                            key={index}
                                            value={(index + 1).toString()}
                                        >
                                            Semester {index + 1}
                                        </SelectItem>
                                    ))
                            )}
                        </SelectContent>
                    </Select>
                ) : (
                    <Skeleton className="h-5 w-full" />
                )}
                {courses ? (
                    <Select
                        value={selectedSubject}
                        onValueChange={setSelectedSubject}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Subject">
                                {getSubjectName(selectedSubject) ||
                                    "Select Subject"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {selectedCourse === "" ||
                            selectedSemester === "" ||
                            selectedPassoutYear === "" ? (
                                <SelectItem value="0" disabled>
                                    Select course, passout year and semester
                                    first
                                </SelectItem>
                            ) : subjectCodeMapping ? (
                                subjectCodeMapping.map((subject, index) => (
                                    <SelectItem
                                        key={index}
                                        value={subject.value}
                                    >
                                        {subject.label}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="0" disabled>
                                    Loading...
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                ) : (
                    <Skeleton className="h-5 w-full" />
                )}
                <Select
                    value={selectedSection}
                    onValueChange={setSelectedSection}
                >
                    <SelectTrigger>
                        {selectedSection
                            ? `Section ${selectedSection}`
                            : "Select Section"}
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="A">Section A</SelectItem>
                        <SelectItem value="B">Section B</SelectItem>
                    </SelectContent>
                </Select>

                <Button disabled={submitting} onClick={handleSubmit}>
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Please wait</span>
                        </>
                    ) : (
                        <span>Submit</span>
                    )}
                </Button>
            </div>
        </div>
    );
}
