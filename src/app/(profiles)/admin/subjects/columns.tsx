import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UpdateCourse from "./updateSubject";
export type Subject = {
    pk: number;
    delete_url: string;
    update_url: string;
    courseName: string;
    course: number;
    subject: string;
    code: string;
    credit: number;
    semester: number;
    is_not_university: boolean;
    is_practical: boolean;
};
export const Fields = [
    "course",
    "subject",
    "code",
    "credit",
    "is_not_university",
    "semester",
    "is_practical",
    "pk",
];

export const columns: ColumnDef<Subject>[] = [
    {
        accessorKey: "subject",
        id: "Subject",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Subject
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "code",
        id: "Code",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Code
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "courseName",
        id: "Course",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Course
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "semester",
        id: "Semester",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Semester
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },

    {
        accessorKey: "credit",
        id: "Credit",
        enableColumnFilter: false,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Credit
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "is_not_university",
        id: "Non University Subject",
        enableColumnFilter: false,
        cell: ({ row }) => {
            const course = row.original;
            if (course.is_not_university) {
                return "Yes";
            } else {
                return "No";
            }
        },

        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Non University Subject
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "is_practical",
        id: "Practical Subject",
        enableColumnFilter: false,
        cell: ({ row }) => {
            const course = row.original;
            if (course.is_practical) {
                return "Yes";
            } else {
                return "No";
            }
        },

        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Practical Subject
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        id: "action",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
            const subject = row.original;
            const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
            const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
            const deleteCourse = async (subject: Subject) => {
                try {
                    const res = await axios.post(subject.delete_url);
                    if (res.status === 200) window.location.reload();
                } catch (error) {
                    console.log("Error Deleting course", error);
                }
            };
            const handleRefresh = () => {
                window.location.reload();
            };
            return (
                <AlertDialog
                    open={isEditDialogOpen || isDeleteDialogOpen}
                    onOpenChange={
                        isEditDialogOpen
                            ? setIsEditDialogOpen
                            : setIsDeleteDialogOpen
                    }
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => setIsDeleteDialogOpen(true)}
                            >
                                Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsEditDialogOpen(true)}
                            >
                                Update
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* delete */}
                    {isDeleteDialogOpen && (
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete subject "
                                    {subject.subject}
                                    ".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => deleteCourse(subject)}
                                >
                                    Confirm
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    )}
                    {/* edit */}
                    {isEditDialogOpen && (
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Edit Details
                                </AlertDialogTitle>
                            </AlertDialogHeader>
                            <UpdateCourse
                                subject={subject}
                                callRefresh={handleRefresh}
                            />
                            <AlertDialogFooter>
                                <AlertDialogCancel className="w-full">
                                    Cancel
                                </AlertDialogCancel>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    )}
                </AlertDialog>
            );
        },
    },
];
