"use client";
import Format1 from "@/components/formats/format1";
import Normalize from "@/components/normalize/normalize";
export default function Teacher() {
    return (
        <>
            <div>
                <h1>Teacher</h1>
                <Format1 />
                <Normalize props={{ isAdmin: false }} />
            </div>
        </>
    );
}
