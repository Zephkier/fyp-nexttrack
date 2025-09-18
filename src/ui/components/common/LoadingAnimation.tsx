export default function LoadingAnimation({ customText }: { customText: string }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md">
            <div className="flex items-center justify-center gap-5">
                <span className="h-5 w-5 animate-spin bg-[var(--primary)]" />
                <span className="text-xl">{customText}</span>
            </div>
        </div>
    );
}
