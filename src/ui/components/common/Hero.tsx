import Link from "next/link";

export default function Hero() {
    return (
        <div className={"mt-20 mb-40 flex flex-col items-center justify-center text-center"}>
            <h1 className="text-8xl font-bold">
                <Link href="/" className="cursor-pointer">
                    NextTrack
                </Link>
            </h1>
            <h2 className="text-4xl">
                Music recommendations in <strong>your</strong> control
            </h2>
        </div>
    );
}
