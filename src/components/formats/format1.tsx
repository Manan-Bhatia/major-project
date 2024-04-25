import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import MultipleSelector, { Option } from "../ui/mutliple-selector";

export default function Format1() {
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
            const res = await axios.get(
                "https://resultlymsi.pythonanywhere.com/results/get_all_courses/"
            );
            console.log(res.data);
            setCourses(res.data);
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

    const [selectedCourse, setSelectedCourse] = useState<string[]>([""]);
    const [passoutYearOptions, setPassoutYearOptions] = useState<number[][]>();
    // useEffect(() => {
    //     const courseLength = getCourseLength(Number(selectedCourse));
    //     const currentYear = new Date().getFullYear();
    //     let arr: number[] = [];
    //     for (let i = -courseLength; i <= courseLength; i++)
    //         arr.push(currentYear + i);
    //     setPassoutYearOptions(arr);
    // }, [selectedCourse]);
    const calculatePassoutYearOptions = () => {};
    const [selectedPassoutYear, setSelectedPassoutYear] = useState<string[]>(
        []
    );
    const [selectedSemester, setSelectedSemester] = useState<string[]>([]);

    const [subjectCodeMapping, setSubjectCodeMapping] = useState<Option[][]>();
    // const getSubjectCodeMapping = async () => {
    //     try {
    //         const res = await axios.get(
    //             `https://resultlymsi.pythonanywhere.com/results/format1?semester=${selectedSemester}&course=${selectedCourse}`
    //         );
    //         let arr: { label: string; value: string }[] = [];
    //         Object.entries<string>(res.data).map(([key, v]) => {
    //             arr.push({
    //                 label: v,
    //                 value: key,
    //             });
    //         });
    //         setSubjectCodeMapping(arr);
    //     } catch (error: any) {
    //         console.log("Error getting subject code mapping", error);
    //     }
    // };
    // useEffect(() => {
    //     if (
    //         selectedCourse === "" ||
    //         selectedPassoutYear === "" ||
    //         selectedSemester === ""
    //     )
    //         return;
    //     getSubjectCodeMapping();
    // }, [selectedCourse, selectedPassoutYear, selectedSemester]);

    const [selectedSubjects, setSelectedSubjects] = useState<Option[][]>();
    const [numberOfEntries, setNumberOfEntries] = useState<number>(1);
    const increaseNumberOfEntries = () => {
        setSelectedCourse([...selectedCourse, ""]);
        setNumberOfEntries(numberOfEntries + 1);
    };
    const decreaseNumberOfEntries = (index: number) => {
        setSelectedCourse(selectedCourse.filter((_, i) => i !== index));
        setNumberOfEntries(numberOfEntries - 1);
    };
    useEffect(() => {
        console.log(selectedCourse);
    }, [selectedCourse]);

    return (
        <div className="border rounded-lg p-4 flex flex-col gap-4">
            <h1 className="capitalize">Faculty wise result analysis</h1>
            <Input
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                placeholder="Enter Faculty Name"
                className="w-[30%]"
            />
            <Button variant="secondary" onClick={increaseNumberOfEntries}>
                Add New Entry
            </Button>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(numberOfEntries)
                    .fill(0)
                    .map((_v, index) => (
                        <div
                            key={index}
                            className="flex flex-col gap-4 border rounded-md p-3"
                        >
                            <div className="flex justify-between">
                                <h3>Entry {index + 1}</h3>
                                <Button
                                    variant="destructive"
                                    onClick={() =>
                                        decreaseNumberOfEntries(index)
                                    }
                                    disabled={numberOfEntries === 1}
                                >
                                    Delete
                                </Button>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                {courses ? (
                                    <Select
                                        value={selectedCourse[index]}
                                        onValueChange={(e) => {
                                            setSelectedCourse([
                                                ...selectedCourse.slice(
                                                    0,
                                                    index
                                                ),
                                                e,
                                                ...selectedCourse.slice(
                                                    index + 1
                                                ),
                                            ]);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select course">
                                                {getCourseName(
                                                    Number(
                                                        selectedCourse[index]
                                                    )
                                                )}
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
                                                            {course.name} (
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
                                                            {course.shift}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Skeleton className="w-full h-5" />
                                )}
                                {/* {passoutYearOptions ? (
                                    <Select
                                        value={selectedPassoutYear}
                                        onValueChange={setSelectedPassoutYear}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select passout year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {passoutYearOptions.map((year) => (
                                                <SelectItem
                                                    key={year}
                                                    value={year.toString()}
                                                >
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Skeleton className="h-5 w-full" />
                                )} */}
                            </div>
                            {/* <div className="flex flex-col items-center gap-4">
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
                                                    getCourseLength(
                                                        Number(selectedCourse)
                                                    ) * 2
                                                )
                                                    .fill(0)
                                                    .map((_v, index) => (
                                                        <SelectItem
                                                            key={index}
                                                            value={(
                                                                index + 1
                                                            ).toString()}
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
                                    <MultipleSelector
                                        value={selectedSubjects}
                                        onChange={setSelectedSubjects}
                                        options={subjectCodeMapping}
                                        hidePlaceholderWhenSelected
                                        placeholder="Select Subjects"
                                        emptyIndicator={
                                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                No Subjects Found
                                            </p>
                                        }
                                    />
                                ) : (
                                    <Skeleton className="h-5 w-full" />
                                )}
                            </div> */}
                        </div>
                    ))}
            </div>

            <Button>Submit</Button>
        </div>
    );
}
