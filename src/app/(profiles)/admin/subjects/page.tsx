"use client";
import { Subject, columns, Fields } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import DataTableSkeleton from "@/components/ui/data-table-skeleton";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import AddSubject from "./addSubject";

export default function Subjects() {
    const [data, setdata] = useState<Subject[]>();
    const handleRefreshData = () => {
        getData();
    };
    const getData = async () => {
        try {
            const res = await axios.get(
                "http://resultlymsi.pythonanywhere.com/results/alladdedsubjects/subjects/"
            );
            if (res.status === 200) {
                let data = res.data.results;
                data = data.map((subject: { [key: string]: [value: any] }) => {
                    let obj: {
                        [key: string]: any;
                    } = {};
                    Fields.forEach((field) => {
                        if (subject.hasOwnProperty(field)) {
                            obj[field] = subject[field];
                        }
                    });
                    obj[
                        "delete_url"
                    ] = `https://resultlymsi.pythonanywhere.com/accounts/api_admin/results/subject/${obj.id}/delete/`;

                    obj[
                        "update_url"
                    ] = `https://resultlymsi.pythonanywhere.com/accounts/api_admin/results/subject/${obj.id}/change/`;
                    return obj;
                });

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
                        return {
                            [courseID]: `${res.data.abbreviation} ${
                                res.data.shift
                            } ${
                                res.data.description &&
                                " (" + res.data.description + ")"
                            }`,
                        };
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
                            subject.courseName = course[id];
                        }
                    });
                });
                setdata(data);
            }
        } catch (error) {
            console.log("Error getting users data", error);
        }
    };
    let timeout: NodeJS.Timeout;
    useEffect(() => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            getData();
        }, 500);
        return () => clearTimeout(timeout);
    }, []);
    return (
        <div className="space-y-8">
            <h1>Subjects List</h1>
            {data ? (
                <DataTable columns={columns} data={data} />
            ) : (
                <DataTableSkeleton columns={7} />
            )}

            <Collapsible className="space-y-4">
                <CollapsibleTrigger>
                    <Button
                        variant="outline"
                        size="lg"
                        className="text-xl capitalize"
                    >
                        Add new Subject
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <AddSubject callRefresh={handleRefreshData} />
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
