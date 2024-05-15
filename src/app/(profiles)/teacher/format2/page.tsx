"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Format2() {
    const [submitting, setSubmitting] = useState<boolean>(false);

    const [facultyName, setFacultyName] = useState<string>("");
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
    const [sectionOptions, setSectionOptions] = useState<string[]>(["A", "B"]);
    const [selectedSection, setSelectedSection] = useState<string>("");

    const [subjectCodeNameMapping, setSubjectCodeNameMapping] = useState<{
        [key: string]: string;
    }>({});
    const [subjectTeacherMapping, setSubjectTeacherMapping] = useState<{
        [key: string]: string;
    }>({});
    const getSubjectTeacherMapping = async () => {
        try {
            const res = await axios.get(
                `https://resultlymsi.pythonanywhere.com/results/format2?semester=${selectedSemester}&course=${selectedCourse}`
            );
            setSubjectCodeNameMapping(res.data[1]);
            console.log(res.data[1]);
        } catch (error: any) {
            console.log("Error getting subject teacher mapping", error);
        }
    };
    useEffect(() => {
        if (Object.keys(subjectCodeNameMapping).length === 0) return;
        let obj: { [key: string]: string } = {};
        Object.keys(subjectCodeNameMapping).map((key) => {
            obj[key] = "";
        });
        setSubjectTeacherMapping(obj);
    }, [subjectCodeNameMapping]);

    useEffect(() => {
        if (selectedCourse === "" || selectedSemester === "") return;
        getSubjectTeacherMapping();
    }, [selectedCourse, selectedSemester]);

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const removeEmptyValues = (obj: { [key: string]: string }) => {
                for (let key in obj) {
                    if (obj[key] === "") delete obj[key];
                }
                return obj;
            };
            let data: {
                course: number;
                semester: number;
                passing: number;
                section: string;
                faculty_name: string;
                batch: string;
                subjectTeacherMapping: { [key: string]: string };
            } = {
                course: Number(selectedCourse),
                semester: Number(selectedSemester),
                passing: Number(selectedPassoutYear),
                section: selectedSection,
                faculty_name: facultyName,
                batch: String(
                    Number(selectedPassoutYear) -
                        getCourseLength(Number(selectedCourse)) +
                        "-" +
                        Number(selectedPassoutYear)
                ),
                subjectTeacherMapping: removeEmptyValues(subjectTeacherMapping),
            };
            const res = await axios.post(
                "https://resultlymsi.pythonanywhere.com/results/format2/",
                data,
                {
                    responseType: "blob",
                }
            );
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `${getCourseName(
                    Number(selectedCourse)
                )}_Sem${selectedSemester}_Section${selectedSection}-Class_Wise_Result_Analysis.docx`
            );

            document.body.appendChild(link);
            link.click();

            // Clean up
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.log("Error submitting", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="border rounded-lg p-4 flex flex-col gap-4">
            <h1 className="capitalize">Class wise result analysis</h1>
            <Input
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                placeholder="Enter Class Coordinator's Name"
            />
            <div className="flex items-center gap-4">
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
                <Select
                    value={selectedSection}
                    onValueChange={setSelectedSection}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Section">
                            Section {selectedSection}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {sectionOptions.map((section, index) => (
                            <SelectItem key={index} value={section}>
                                {section}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {Object.keys(subjectCodeNameMapping).length > 0 && (
                <>
                    <h2>Enter Teacher(s) Names</h2>
                    {Object.entries(subjectCodeNameMapping).map(
                        ([key, value], index) => (
                            <div
                                key={index}
                                className="flex gap-4 items-center"
                            >
                                <div className="w-2/5">{value}</div>
                                <Input
                                    placeholder="Enter teacher's name"
                                    value={subjectTeacherMapping[key]}
                                    onChange={(e) =>
                                        setSubjectTeacherMapping({
                                            ...subjectTeacherMapping,
                                            [key]: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        )
                    )}
                </>
            )}
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
    );
}
