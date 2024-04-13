import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
export default function SummaryCard({
    props,
    className = "",
}: {
    props: {
        title: string;
        description: string;
        columns: string[];
        displayHeaders: string[];
        data: { [key: string]: string }[];
        detailedViewRoute: string;
    };
    className?: string;
}) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="capitalize">{props.title}</CardTitle>
                <CardDescription className="capitalize">
                    {props.description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {props.displayHeaders.map((columnName, index) => (
                                <TableHead
                                    className="capitalize text-nowrap"
                                    key={index}
                                >
                                    {columnName}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    {props.data.length > 0 ? (
                        <TableBody>
                            {props.data.slice(0, 3).map((row, index) => (
                                <TableRow key={index}>
                                    {props.columns.map((key: string, index) => (
                                        <TableCell
                                            className="font-medium text-balance"
                                            key={index}
                                        >
                                            {row[key.toLowerCase()]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    ) : (
                        <TableBody>
                            {[1, 2, 3].map((index) => (
                                <TableRow key={index}>
                                    {props.columns.map((index) => (
                                        <TableCell key={index}>
                                            <Skeleton className="h-5" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    )}
                </Table>
            </CardContent>
            <CardFooter className="justify-between">
                {props.data.length > 0 ? (
                    <p>Total Count: {props.data.length}</p>
                ) : (
                    <Skeleton className="h-5 w-20" />
                )}
                <Button variant="outline" className="capitalize" asChild>
                    <Link href={props.detailedViewRoute}>View More</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
