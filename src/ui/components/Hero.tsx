export default function Hero({ customMarginBottom }: { customMarginBottom: string }) {
    return (
        <div className={`${customMarginBottom} flex flex-col items-center justify-center text-center`}>
            <h1 className="text-8xl font-bold">
                <a href="/" className="cursor-pointer">
                    NextTrack
                </a>
            </h1>
            <h2 className="text-4xl">
                Music recommendations in <strong>your</strong> control
            </h2>
        </div>
    );
}
