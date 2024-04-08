import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function Teacher() {
    return (
        <>
            <div>
                <h1>Teacher</h1>
                <Button asChild>
                    <Link href="/">Home</Link>
                </Button>
            </div>
        </>
    );
}
