"use client";
import SummaryCard from "@/components/summaryCard";
export default function Admin() {
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
                            totalCount: 8,
                            detailedViewRoute: "/admin/subjects",
                        }}
                    />
                    <SummaryCard
                        className="flex-1"
                        props={{
                            title: "Teachers",
                            description: "add, delete or update Teachers",
                            columns: ["Code", "Name"],
                            data: data,
                            totalCount: 8,
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
                            totalCount: 8,
                            detailedViewRoute: "/admin/courses",
                        }}
                    />
                </div>
            </div>
        </>
    );
}
