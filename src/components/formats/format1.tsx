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
    const [passoutYearOptions, setPassoutYearOptions] = useState<number[][]>([
        [Number(new Date().getFullYear())],
    ]);
    const calculatePassoutYearOptions = (
        index: number,
        courseSelected: string
    ) => {
        const courseLength = getCourseLength(Number(courseSelected));
        const currentYear = new Date().getFullYear();
        let arr: number[] = [];
        for (let i = -courseLength; i <= courseLength; i++)
            arr.push(currentYear + i);

        setPassoutYearOptions([
            ...passoutYearOptions.slice(0, index),
            arr,
            ...passoutYearOptions.slice(index + 1),
        ]);
    };
    const [selectedPassoutYear, setSelectedPassoutYear] = useState<string[]>([
        "",
    ]);
    const [selectedSemester, setSelectedSemester] = useState<string[]>([""]);

    const [subjectCodeMapping, setSubjectCodeMapping] = useState<Option[][]>([
        [],
    ]);
    const getSubjectCodeMapping = async (index: number) => {
        try {
            const res = await axios.get(
                `https://resultlymsi.pythonanywhere.com/results/format1?semester=${selectedSemester[index]}&course=${selectedCourse[index]}`
            );
            let arr: { label: string; value: string }[] = [];
            Object.entries<string>(res.data).map(([key, v]) => {
                arr.push({
                    label: v,
                    value: key,
                });
            });
            setSubjectCodeMapping([
                ...subjectCodeMapping.slice(0, index),
                arr,
                ...subjectCodeMapping.slice(index + 1),
            ]);
        } catch (error: any) {
            console.log("Error getting subject code mapping", error);
        }
    };
    useEffect(() => {
        for (let index = 0; index < numberOfEntries; index++) {
            if (
                selectedCourse[index] !== "" &&
                selectedPassoutYear[index] !== "" &&
                selectedSemester[index] !== ""
            ) {
                getSubjectCodeMapping(index);
            }
        }
    }, [selectedCourse, selectedPassoutYear, selectedSemester]);

    const [selectedSubjects, setSelectedSubjects] = useState<
        { [key: string]: Option[] }[]
    >([{}]);
    const [numberOfEntries, setNumberOfEntries] = useState<number>(1);
    const [sections, setSections] = useState<string[]>(["A", "B", "C"]);
    const [selectedSection, setSelectedSection] = useState<string[][]>([[""]]);
    const increaseNumberOfEntries = () => {
        setSelectedCourse([...selectedCourse, ""]);
        setPassoutYearOptions([
            ...passoutYearOptions,
            [Number(new Date().getFullYear())],
        ]);
        setSelectedPassoutYear([...selectedPassoutYear, ""]);
        setSelectedSemester([...selectedSemester, ""]);
        setSubjectCodeMapping([...subjectCodeMapping, []]);
        setSelectedSubjects([...selectedSubjects, {}]);
        setNumberOfSections([...numberOfSections, 1]);
        setSelectedSection([...selectedSection, [""]]);
        setNumberOfEntries(numberOfEntries + 1);
    };
    const decreaseNumberOfEntries = (index: number) => {
        setSelectedCourse(selectedCourse.filter((_, i) => i !== index));
        setPassoutYearOptions(passoutYearOptions.filter((_, i) => i !== index));
        setSelectedPassoutYear(
            selectedPassoutYear.filter((_, i) => i !== index)
        );
        setSelectedSemester(selectedSemester.filter((_, i) => i !== index));
        setSubjectCodeMapping(subjectCodeMapping.filter((_, i) => i !== index));
        setSelectedSubjects(selectedSubjects.filter((_, i) => i !== index));
        setNumberOfSections(numberOfSections.filter((_, i) => i !== index));
        setSelectedSection(selectedSection.filter((_, i) => i !== index));
        setNumberOfEntries(numberOfEntries - 1);
    };
    const [numberOfSections, setNumberOfSections] = useState<number[]>([1]);

    const increaseNumberOfSection = (index: number) => {
        const updatedNumberOfSections = [...numberOfSections];
        updatedNumberOfSections[index] = updatedNumberOfSections[index] + 1;
        setNumberOfSections(updatedNumberOfSections);
        const updatedSelectedSection = [...selectedSection];
        updatedSelectedSection[index].push("");
        setSelectedSection(updatedSelectedSection);
    };
    const decreaseNumberOfSection = (index: number, sectionIndex: number) => {
        const updatedSelectedSubjects = [...selectedSubjects];
        delete updatedSelectedSubjects[index][
            selectedSection[index][sectionIndex]
        ];
        setSelectedSubjects(updatedSelectedSubjects);
        const updatedNumberOfSections = [...numberOfSections];
        updatedNumberOfSections[index] = updatedNumberOfSections[index] - 1;
        setNumberOfSections(updatedNumberOfSections);

        const updatedSelectedSection = [...selectedSection];
        updatedSelectedSection[index].splice(sectionIndex, 1);
        setSelectedSection(updatedSelectedSection);
    };

    const [submitting, setSubmitting] = useState<boolean>(false);
    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            let data: {
                [key: string]: {};
            } = {};
            for (let index = 0; index < numberOfEntries; index++) {
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
                obj.semester = Number(selectedSemester[index]);
                obj.passing = Number(selectedPassoutYear[index]);
                obj.course = Number(selectedCourse[index]);
                obj.faculty_name = facultyName;
                obj.shift = "Morning";
                Object.entries(selectedSubjects[index]).map(([key, value]) => {
                    obj["section-subject"][key] = value.map((v) => v.value);
                });
                data[index] = obj;
            }
            const res = await axios.post(
                "https://resultlymsi.pythonanywhere.com/results/format1/",
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
                                    title="Delete Entry"
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
                                            calculatePassoutYearOptions(
                                                index,
                                                e
                                            );
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
                                {passoutYearOptions ? (
                                    <Select
                                        value={selectedPassoutYear[index]}
                                        onValueChange={(e) => {
                                            setSelectedPassoutYear([
                                                ...selectedPassoutYear.slice(
                                                    0,
                                                    index
                                                ),
                                                e,
                                                ...selectedPassoutYear.slice(
                                                    index + 1
                                                ),
                                            ]);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select passout year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {passoutYearOptions[index].map(
                                                (year) => (
                                                    <SelectItem
                                                        key={year}
                                                        value={year.toString()}
                                                    >
                                                        {year}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Skeleton className="h-5 w-full" />
                                )}
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                {courses ? (
                                    <Select
                                        value={selectedSemester[index]}
                                        onValueChange={(e) => {
                                            setSelectedSemester([
                                                ...selectedSemester.slice(
                                                    0,
                                                    index
                                                ),
                                                e,
                                                ...selectedSemester.slice(
                                                    index + 1
                                                ),
                                            ]);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select semster">
                                                Semester{" "}
                                                {selectedSemester[index]}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedCourse[index] === "" ? (
                                                <SelectItem value="0" disabled>
                                                    Select course first
                                                </SelectItem>
                                            ) : (
                                                Array(
                                                    getCourseLength(
                                                        Number(
                                                            selectedCourse[
                                                                index
                                                            ]
                                                        )
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

                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() =>
                                        increaseNumberOfSection(index)
                                    }
                                >
                                    Add Section
                                </Button>
                                {Array(numberOfSections[index])
                                    .fill(0)
                                    .map((_v, sectionIndex) => (
                                        <div
                                            key={sectionIndex}
                                            className="w-full flex flex-col xl:flex-row gap-2 items-stretch"
                                        >
                                            <div className="xl:w-1/3 w-full">
                                                <Select
                                                    value={
                                                        selectedSection[index][
                                                            sectionIndex
                                                        ]
                                                    }
                                                    onValueChange={(e) => {
                                                        const updatedSelectedSection =
                                                            [
                                                                ...selectedSection,
                                                            ];
                                                        updatedSelectedSection[
                                                            index
                                                        ][sectionIndex] = e;
                                                        setSelectedSection(
                                                            updatedSelectedSection
                                                        );
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Section" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sections.map(
                                                            (
                                                                section,
                                                                index
                                                            ) => (
                                                                <SelectItem
                                                                    key={index}
                                                                    value={
                                                                        section
                                                                    }
                                                                >
                                                                    {section}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {courses ? (
                                                <MultipleSelector
                                                    value={
                                                        selectedSubjects[index][
                                                            selectedSection[
                                                                index
                                                            ][sectionIndex]
                                                        ]
                                                    }
                                                    onChange={(e) => {
                                                        const updatedSelectedSubjects =
                                                            [
                                                                ...selectedSubjects,
                                                            ];
                                                        updatedSelectedSubjects[
                                                            index
                                                        ][
                                                            selectedSection[
                                                                index
                                                            ][sectionIndex]
                                                        ] = e;
                                                        setSelectedSubjects(
                                                            updatedSelectedSubjects
                                                        );
                                                    }}
                                                    options={
                                                        subjectCodeMapping[
                                                            index
                                                        ]
                                                    }
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
                                                    decreaseNumberOfSection(
                                                        index,
                                                        sectionIndex
                                                    )
                                                }
                                                disabled={
                                                    numberOfSections[index] ===
                                                    1
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
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
