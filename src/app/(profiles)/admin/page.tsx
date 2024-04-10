"use client";
import SummaryCard from "@/components/summaryCard";
import axios from "axios";
import { useState, useEffect } from "react";
export default function Admin() {
    const [dataTeahcer, setDataTeahcer] = useState<{}[]>([]);
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
    useEffect(() => {
        getTeacherData();
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
                            data: dataTeahcer,
                            detailedViewRoute: "/admin/teachers",
                        }}
                    />
                    <SummaryCard
                        className="flex-1"
                        props={{
                            title: "Courses",
                            description: "add, delete or update Courses",
                            columns: ["Code", "Name"],
                            data: data,
                            detailedViewRoute: "/admin/courses",
                        }}
                    />
                </div>
            </div>
        </>
    );
}
