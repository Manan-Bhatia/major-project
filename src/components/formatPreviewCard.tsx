import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { ExternalLink, View } from "lucide-react";

export default function FormatPreviewCard({
    name,
    route,
    image,
}: {
    name: string;
    route: string;
    image: StaticImageData;
}) {
    return (
        <Collapsible className="border rounded-lg p-2">
            <div className="flex items-center justify-between">
                <Link href={route} className="flex items-center gap-2">
                    <h4>{name}</h4>
                    <ExternalLink />
                </Link>
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <span className="text-lg">Preview</span>
                        <View />
                        <span className="sr-only">Toggle</span>
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="flex justify-center">
                <div className="max-w-max flex flex-col gap-4">
                    <Image src={image} alt={name} />
                    <Link href={route}>
                        <Button className="w-full">Generate</Button>
                    </Link>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
