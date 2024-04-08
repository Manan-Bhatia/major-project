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
export default function SummaryCard({
    props,
    className = "",
}: {
    props: {
        title: string;
        description: string;
        columns: string[];
        data: { [key: string]: string }[];
        detailedViewRoute: string;
        totalCount: number;
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
                            {props.columns.map((columnName) => (
                                <TableHead className="capitalize">
                                    {columnName}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {props.data.map((row) => (
                            <TableRow>
                                {props.columns.map((key: string, index) => (
                                    <TableCell className="font-medium">
                                        {row[key.toLowerCase()]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="justify-between">
                <p>Count: {props.totalCount}</p>
                <Button variant="outline" className="capitalize" asChild>
                    <Link href={props.detailedViewRoute}>View More</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
