import { Button } from "@/components/ui/button";
import axios from "axios";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
export default function Normalize() {
    const handleUploadCSV = async () => {
        const filepath = await window.electronAPI.OpenFile();
        console.log(filepath);
    };
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

    const checkResults = async () => {
        try {
            const res = await axios.post(
                "https://resultlymsi.pythonanywhere.com/results/check-result/",
                {
                    course: Number(selectedCourse),
                    passing: Number(selectedPassoutYear),
                }
            );
            console.log(res);
        } catch (error) {
            console.log("Error in getting results", error);
        }
    };
    return (
        <div className="space-y-5">
            <h1>Normalize Documents</h1>
            {/* <Button onClick={handleUploadCSV}>Upload csv</Button> */}
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
                <Button
                    variant="secondary"
                    disabled={!selectedCourse || !selectedPassoutYear}
                    className="capitalize"
                    onClick={checkResults}
                >
                    Refresh Data
                </Button>
            </div>
        </div>
    );
}
