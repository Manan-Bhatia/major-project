"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { Course, Fields, columns } from "./columns";
import DataTableSkeleton from "@/components/ui/data-table-skeleton";
import { DataTable } from "@/components/ui/data-table";
import AddCourse from "./addCourse";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
export default function Subjects() {
    const router = useRouter();
    const [data, setdata] = useState<Course[]>();
    const handleRefreshData = () => {
        getData();
    };
    const getData = async () => {
        try {
            const res = await axios.get(
                "https://resultlymsi.pythonanywhere.com/accounts/api_admin/results/course/list/"
            );
            let data = res.data;
            console.log(data);
            data = data.map((user: { [key: string]: [value: any] }) => {
                let obj: {
                    [key: string]: any;
                } = {};
                Fields.forEach((field) => {
                    if (user.hasOwnProperty(field)) {
                        obj[field] = user[field];
                    }
                });
                obj[
                    "delete_url"
                ] = `https://resultlymsi.pythonanywhere.com/accounts/api_admin/results/course/${obj.pk}/delete/`;

                obj[
                    "update_url"
                ] = `https://resultlymsi.pythonanywhere.com/accounts/api_admin/results/course/${obj.pk}/change/`;
                return obj;
            });
            setdata(data);
        } catch (error) {
            console.log("Error getting teachers data", error);
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
            <h1>Course List</h1>
            {data ? (
                <DataTable columns={columns} data={data} />
            ) : (
                <DataTableSkeleton columns={4} />
            )}

            <Collapsible className="space-y-4">
                <CollapsibleTrigger>
                    <Button variant="outline" size="lg" className="text-xl capitalize">
                        Add new Course
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <AddCourse callRefresh={handleRefreshData} />
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
