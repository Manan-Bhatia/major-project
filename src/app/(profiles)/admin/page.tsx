import Link from "next/link";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Admin",
};
export default function Admin() {
    return (
        <>
            <div>
                <h1>Admin</h1>
                <Link href="/">Home</Link>
            </div>
        </>
    );
}
