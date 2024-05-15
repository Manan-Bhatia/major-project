"use client";
import Format1 from "/public/Format1.png";
import Format2 from "/public/Format2.png";
import Format6 from "/public/Format6.png";
import Format7 from "/public/Format7.png";
import Format5 from "/public/Format5.png";
import Format11 from "/public/Format11.png";
import FormatPreviewCard from "@/components/formatPreviewCard";

import Normalize from "@/components/normalize/normalize";
export default function Teacher() {
    return (
        <>
            <div className="flex flex-col gap-4">
                <h1>Teacher</h1>
                <h1>Generate Formats</h1>
                <h2>Faculty Wise</h2>
                <FormatPreviewCard
                    name="Faculty Wise Result Analysis"
                    route="/teacher/format1"
                    image={Format1}
                />
                <FormatPreviewCard
                    name="Faculty Wise Top 10 Bottom 10"
                    route="/teacher/format6"
                    image={Format6}
                />
                <FormatPreviewCard
                    name="Class Wise Top 10 Bottom 10"
                    route="/teacher/format7"
                    image={Format7}
                />
                <h2>Management Wise</h2>
                <FormatPreviewCard
                    name="Class Wise Result Analysis"
                    route="/teacher/format2"
                    image={Format2}
                />
                <FormatPreviewCard
                    name="Governing Body"
                    route="/teacher/format5"
                    image={Format5}
                />
                <FormatPreviewCard
                    name="Faculty wise result analysis (Internal & External)"
                    route="/teacher/format11"
                    image={Format11}
                />
                <Normalize props={{ isAdmin: false }} />
            </div>
        </>
    );
}
