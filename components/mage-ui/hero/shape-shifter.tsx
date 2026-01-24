import { cn } from "@/lib/utils";
import Marquee from "@/components/mage-ui/container/marquee";

const images: { src: string; alt: string; className?: string }[] = [
    {
        src: "/img1.png",
        alt: "Hardware Project 1",
    },
    {
        src: "/img2.png",
        alt: "Hardware Project 2",
    },
    {
        src: "/img3.png",
        alt: "Hardware Project 3",
    },
    {
        src: "/img1.png",
        alt: "Hardware Project 1",
    },
    {
        src: "/img2.png",
        alt: "Hardware Project 2",
    },
];

const placeholderChildren = (
    /* Marquee is optional and can be replaced with a different component like video. */
    <Marquee className="absolute inset-0 [--gap:2px]" applyMask={false}>
        {images.map((image, index) => (
            /* Use `next/image` and remove the line below. */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={`image_${index}`} {...image} alt={image.alt ?? ""} />
        ))}
    </Marquee>
);

export default function ShapeShifter({
    prefix = "Shape",
    suffix = "Shifter",
    className,
    containerClassName,
    children,
}: {
    className?: string;
    containerClassName?: string;
    children?: React.ReactNode;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                "text-md group flex min-h-96 w-full min-w-fit flex-col items-center justify-center gap-3 font-bold text-foreground transition-all sm:flex-row sm:text-xl",
                containerClassName,
            )}
        >
            <div>{prefix}</div>
            <div
                className={cn(
                    "relative animate-[shape-shift] overflow-hidden bg-black p-0 transition-all ease-in-out direction-alternate repeat-infinite",
                    className,
                )}
                // Magic number based on length of images.
                style={{ animationDuration: "8s" }}
            >
                {children ?? placeholderChildren}
            </div>
            <div>{suffix}</div>
        </div>
    );
}
