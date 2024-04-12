"use client";
import { Teacher, columns, Fields } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import DataTableSkeleton from "@/components/ui/data-table-skeleton";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import AddTeacher from "./addTeacher";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@radix-ui/react-collapsible";

export default function Teachers() {
    const router = useRouter();
    const [data, setdata] = useState<Teacher[]>();
    const handleRefreshData = () => {
        getData();
    };
    const getData = async () => {
        try {
            const res = await axios.get(
                "https://resultlymsi.pythonanywhere.com/accounts/api_admin/accounts/customuser/list/"
            );
            let data = res.data;
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
                ] = `https://resultlymsi.pythonanywhere.com/accounts/api_admin/accounts/customuser/${obj.pk}/delete/`;

                obj[
                    "update_url"
                ] = `https://resultlymsi.pythonanywhere.com/accounts/api_admin/accounts/customuser/${obj.pk}/change/`;
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
            <h1>Teachers List</h1>
            {data ? (
                <DataTable columns={columns} data={data} />
            ) : (
                <DataTableSkeleton columns={5} />
            )}

            <Collapsible className="space-y-4">
                <CollapsibleTrigger>
                    <Button variant="outline" size="lg" className="text-xl capitalize">
                        Add new Teacher
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <AddTeacher callRefresh={handleRefreshData} />
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
