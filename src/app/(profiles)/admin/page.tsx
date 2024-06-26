"use client";
import SummaryCard from "@/components/summaryCard";
import axios from "axios";
import { useState, useEffect } from "react";
import Normalize from "@/components/normalize/normalize";
import StudentDetails from "@/components/studentDetails/studentDetails";
export default function Admin() {
    const [dataTeahcer, setDataTeahcer] = useState<{}[]>([]);
    const [teacherCount, setTeacherCount] = useState<number>();
    const [dataCourses, setDataCourses] = useState<{}[]>([]);
    const [coursesCount, setCoursesCount] = useState<number>();
    const [dataSubjects, setDataSubjects] = useState<{}[]>([]);
    const [subjectCount, setSubjectCount] = useState<number>();
    const getTeacherData = async () => {
        try {
            const res = await axios.get(
                "https://resultlymsi.pythonanywhere.com/accounts/api_admin/accounts/customuser/list/"
            );
            const fields = ["email", "first_name", "last_name", "is_superuser"];
            let data = res.data;
            setTeacherCount(data.length);
            data = data.map((user: { [key: string]: [value: any] }) => {
                let obj: {
                    [key: string]: [value: any];
                } = {};
                fields.forEach((field) => {
                    if (user.hasOwnProperty(field)) {
                        obj[field] = user[field];
                    }
                });
                return obj;
            });
            setDataTeahcer(data);
        } catch (error) {
            console.log("Error getting users data", error);
        }
    };
    const getCoursesData = async () => {
        try {
            const res = await axios.get(
                "https://resultlymsi.pythonanywhere.com/accounts/api_admin/results/course/list/"
            );
            if (res.status === 200) {
                setDataCourses(res.data);
                setCoursesCount(res.data.length);
            }
        } catch (error) {
            console.log("Error getting users data", error);
        }
    };
    const getSubjectsData = async () => {
        try {
            const res = await axios.get(
                "http://resultlymsi.pythonanywhere.com/results/alladdedsubjects/subjects/"
            );
            if (res.status === 200) {
                setSubjectCount(res.data.results.length);
                const data = res.data.results.slice(0, 3);

                const coursesID: number[] = Array.from(
                    new Set(
                        data.map(
                            (subject: { course: number }) => subject.course
                        )
                    )
                );

                const coursesPromises = coursesID.map(async (courseID) => {
                    try {
                        const res = await axios.get(
                            `https://resultlymsi.pythonanywhere.com/accounts/api_admin/results/course/${courseID}/detail/`
                        );
                        return { [courseID]: res.data.abbreviation };
                    } catch (error) {
                        console.log("Error getting course name", error);
                        return { [courseID]: "" };
                    }
                });

                const courses = await Promise.all(coursesPromises);

                courses.forEach((course) => {
                    data.map((subject: any) => {
                        let id = subject.course;
                        if (Number(Object.keys(course)[0]) === id) {
                            subject.course = course[id];
                        }
                    });
                });
                setDataSubjects(data);
            }
        } catch (error) {
            console.log("Error getting users data", error);
        }
    };

    let timeout: NodeJS.Timeout;
    useEffect(() => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            getSubjectsData();
            getTeacherData();
            getCoursesData();
        }, 500);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center gap-4">
                    <SummaryCard
                        className="flex-1"
                        props={{
                            title: "Subjects",
                            description: "add, delete or update subjects",
                            columns: ["subject", "code", "course"],
                            displayHeaders: ["Subject", "Code", "Course"],
                            data: dataSubjects,
                            detailedViewRoute: "/admin/subjects",
                            toalCount: subjectCount,
                        }}
                    />
                    <SummaryCard
                        className="flex-1"
                        props={{
                            title: "Teachers",
                            description: "add, delete or update Teachers",
                            columns: ["first_name", "last_name", "email"],
                            displayHeaders: [
                                "First Name",
                                "Last Name",
                                "Email",
                            ],
                            data: dataTeahcer,
                            detailedViewRoute: "/admin/teachers",
                            toalCount: teacherCount,
                        }}
                    />
                    <SummaryCard
                        className="flex-1"
                        props={{
                            title: "Courses",
                            description: "add, delete or update Courses",
                            columns: [
                                "name",
                                "abbreviation",
                                "no_of_semesters",
                            ],
                            displayHeaders: [
                                "Name",
                                "Abbreviation",
                                "Semesters",
                            ],
                            data: dataCourses,
                            detailedViewRoute: "/admin/courses",
                            toalCount: coursesCount,
                        }}
                    />
                </div>
                <Normalize props={{ isAdmin: true }} />
                <StudentDetails />
            </div>
        </>
    );
}
