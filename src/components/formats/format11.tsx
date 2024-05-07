import React from "react";
import { Loader2 } from "lucide-react";
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
import axios from "axios";

export default function Format11() {
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

    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [passoutYearOptions, setPassoutYearOptions] = useState<number[]>([
        Number(new Date().getFullYear()),
    ]);
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

    const [selectedSubjects, setSelectedSubjects] = useState<{
        [key: string]: Option[];
    }>({});
    const [sections, setSections] = useState<string[]>(["A", "B"]);
    const [selectedSection, setSelectedSection] = useState<string[]>([""]);
    const [numberOfSections, setNumberOfSections] = useState<number>(1);

    const increaseNumberOfSection = () => {
        console.log("here");
        setNumberOfSections(numberOfSections + 1);
        const updatedSelectedSection = [...selectedSection];
        updatedSelectedSection.push("");
        setSelectedSection(updatedSelectedSection);
    };
    const decreaseNumberOfSection = (sectionIndex: number) => {
        const updatedSelectedSubjects = { ...selectedSubjects };
        delete updatedSelectedSubjects[selectedSection[sectionIndex]];
        setSelectedSubjects(updatedSelectedSubjects);
        setNumberOfSections(numberOfSections - 1);

        const updatedSelectedSection = [...selectedSection];
        updatedSelectedSection.splice(sectionIndex, 1);
        setSelectedSection(updatedSelectedSection);
    };

    const [submitting, setSubmitting] = useState<boolean>(false);
    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            console.log(selectedSection, selectedSubjects);
            let data: {
                [key: string]: {};
            } = {};
            let obj: {
                semester: number;
                passing: number;
                course: number;
                "section-subject": {
                    [key: string]: string[];
                };
                faculty_name: string;
                shift: string;
            } = {
                semester: 0,
                passing: 0,
                course: 0,
                "section-subject": {},
                faculty_name: "",
                shift: "",
            };
            obj.semester = Number(selectedSemester);
            obj.passing = Number(selectedPassoutYear);
            obj.course = Number(selectedCourse);
            obj.faculty_name = facultyName;
            Object.entries(selectedSubjects).map(([key, value]) => {
                obj["section-subject"][key] = value.map((v) => v.value);
            });
            data[0] = obj;
            const res = await axios.post(
                "https://resultlymsi.pythonanywhere.com/results/format11/",
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
                `${facultyName}-Faculty_Wise_Result_Analysis.docx`
            );

            document.body.appendChild(link);
            link.click();

            // Clean up
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.log("Error submitting", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="border rounded-lg p-4 flex flex-col gap-4">
            <h1 className="capitalize">
                Faculty wise result analysis (Internal & External)
            </h1>
            <div className="flex flex-col gap-4 p-3">
                <Input
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    placeholder="Enter Faculty Name"
                />

                <div className="flex flex-col items-center gap-4">
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
                                                {course.name} (
                                                {course.abbreviation})
                                            </span>
                                            {course.description && (
                                                <span>
                                                    {course.description}
                                                </span>
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
                    )}
                </div>
                <div className="flex flex-col items-center gap-4">
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

                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={increaseNumberOfSection}
                    >
                        Add Section
                    </Button>
                    {Array(numberOfSections)
                        .fill(0)
                        .map((_v, sectionIndex) => (
                            <div
                                key={sectionIndex}
                                className="w-full flex flex-col xl:flex-row gap-2 items-stretch"
                            >
                                <div className="xl:w-1/3 w-full">
                                    <Select
                                        value={selectedSection[sectionIndex]}
                                        onValueChange={(e) => {
                                            const updatedSelectedSubjects = {
                                                ...selectedSubjects,
                                            };
                                            updatedSelectedSubjects[e] =
                                                updatedSelectedSubjects[
                                                    selectedSection[
                                                        sectionIndex
                                                    ]
                                                ];
                                            delete updatedSelectedSubjects[
                                                selectedSection[sectionIndex]
                                            ];
                                            setSelectedSubjects(
                                                updatedSelectedSubjects
                                            );
                                            const updatedSelectedSection = [
                                                ...selectedSection,
                                            ];
                                            updatedSelectedSection[
                                                sectionIndex
                                            ] = e;
                                            setSelectedSection(
                                                updatedSelectedSection
                                            );
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sections.map((section, index) => (
                                                <SelectItem
                                                    key={index}
                                                    value={section}
                                                >
                                                    {section}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {courses ? (
                                    <MultipleSelector
                                        value={
                                            selectedSubjects[
                                                selectedSection[sectionIndex]
                                            ]
                                        }
                                        onChange={(e) => {
                                            const updatedSelectedSubjects = {
                                                ...selectedSubjects,
                                            };
                                            updatedSelectedSubjects[
                                                selectedSection[sectionIndex]
                                            ] = e;
                                            setSelectedSubjects(
                                                updatedSelectedSubjects
                                            );
                                        }}
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
                                <Button
                                    variant="destructive"
                                    title="Delete Section"
                                    onClick={() =>
                                        decreaseNumberOfSection(sectionIndex)
                                    }
                                    disabled={numberOfSections === 1}
                                >
                                    Delete
                                </Button>
                            </div>
                        ))}
                </div>
            </div>

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
