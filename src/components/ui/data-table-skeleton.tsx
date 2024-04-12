import { Skeleton } from "./skeleton";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
export default function DataTableSkeleton({ columns }: { columns: number }) {
    return (
        <div>
            <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-60 " />
                    <Skeleton className="h-8 w-32 " />
                </div>
                <Skeleton className="w-40 h-8" />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Array(columns)
                                .fill(0)
                                .map((v, index) => (
                                    <TableHead
                                        className="capitalize"
                                        key={index}
                                    >
                                        <Skeleton className="w-full h-7" />
                                    </TableHead>
                                ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array(5)
                            .fill(0)
                            .map((index) => (
                                <TableRow key={index}>
                                    {Array(columns)
                                        .fill(0)
                                        .map((v, index) => (
                                            <TableCell
                                                className="py-6"
                                                key={index}
                                            >
                                                <Skeleton className="h-4 w-1/3" />
                                            </TableCell>
                                        ))}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-2 pt-4">
                <Skeleton className="w-60 h-5" />
                <Skeleton className="w-72 h-5" />
            </div>
        </div>
    );
}
