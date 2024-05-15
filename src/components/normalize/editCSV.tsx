import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditCSV({
    props,
    refreshData,
    disabled,
}: {
    props: {
        course: number;
        passing: number;
        shift: string | undefined;
        semester: number;
        courseName: string | undefined;
        courseLength: number;
        courseAbbreviation: string | undefined;
    };
    refreshData: () => void;
    disabled: boolean;
}) {
    const formSchema = z.object({
        course: z.coerce.number(),
        passing: z.coerce.number(),
        semester: z.coerce.number(),
        updated_excel_file: z
            .any()
            .refine((file) => file?.length === 1, "File is required"),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            course: props.course,
            passing: props.passing,
            semester: props.semester,
            updated_excel_file: undefined,
        },
        mode: "onChange",
    });
    useEffect(() => {
        form.setValue("course", props.course);
        form.setValue("passing", props.passing);
        form.setValue("semester", props.semester);
    }, [props]);
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const formData = new FormData();
            formData.append("updated_excel_file", values.updated_excel_file[0]);
            formData.append("course", values.course.toString());
            formData.append("passing", values.passing.toString());
            formData.append("semester", values.semester.toString());
            const res = await axios.post(
                "https://resultlymsi.pythonanywhere.com/results/update-result/",
                formData
            );
            if (res.status === 200) refreshData();
        } catch (error: any) {
            console.log("Error in updating file", error);
        }
    }
    const fileRef = form.register("updated_excel_file");

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full"
                        disabled={disabled}
                    >
                        Edit
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[70%]">
                    <DialogHeader>
                        <DialogTitle className="capitalize">
                            Upload updated document
                        </DialogTitle>
                        <DialogDescription>
                            Marks cannot be updated. To update marks please
                            delete the file and upload new file!
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="updated_excel_file"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Excel File (.xlsx)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                placeholder="File"
                                                {...fileRef}
                                                accept=".xlsx"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
