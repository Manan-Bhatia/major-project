"use client";
import Format1 from "@/components/formats/format1";
import Format2 from "@/components/formats/format2";
import Normalize from "@/components/normalize/normalize";
export default function Teacher() {
    return (
        <>
            <div className="flex flex-col gap-4">
                <h1>Teacher</h1>
                <Format1 />
                <Format2 />
                <Normalize props={{ isAdmin: false }} />
            </div>
        </>
    );
}
