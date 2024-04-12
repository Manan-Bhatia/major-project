"use client";
import SummaryCard from "@/components/summaryCard";
import axios from "axios";
import { useState, useEffect } from "react";
export default function Admin() {
    const [dataTeahcer, setDataTeahcer] = useState<{}[]>([]);
    const [dataCourses, setDataCourses] = useState<{}[]>([]);
    const [dataSubjects, setDataSubjects] = useState<{}[]>([]);
    const getTeacherData = async () => {
        try {
            const res = await axios.get(
                "https://resultlymsi.pythonanywhere.com/accounts/api_admin/accounts/customuser/list/"
            );
            const fields = ["email", "first_name", "last_name", "is_superuser"];
            let data = res.data;
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
            if (res.status === 200) setDataCourses(res.data);
        } catch (error) {
            console.log("Error getting users data", error);
        }
    };
    let timeout: NodeJS.Timeout;
    useEffect(() => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            getTeacherData();
            getCoursesData();
        }, 500);
        return () => clearTimeout(timeout);
    }, []);
    const data = [
        {
            code: "BCA - 312",
            name: "Data Visualisation and Analytics",
        },
        {
            code: "BCA - 312",
            name: "Data Visualisation and Analytics",
        },
        {
            code: "BCA - 312",
            name: "Data Visualisation and Analytics",
        },
    ];
    return (
        <>
            <div>
                <div className="flex justify-between items-center gap-10">
                    <SummaryCard
                        className="flex-1"
                        props={{
                            title: "Subjects",
                            description: "add, delete or update subjects",
                            columns: ["Code", "Name"],
                            displayHeaders: ["Code", "Name"],
                            data: data,
                            detailedViewRoute: "/admin/subjects",
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
                        }}
                    />
                </div>
            </div>
        </>
    );
}
