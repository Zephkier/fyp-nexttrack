export default function ButtonToSubmitCustomisations({ margin }: { margin: string }) {
    return (
        <div className="flex justify-end">
            <button
                // Format
                className={`${margin} px-4 py-2 text-white bg-[var(--secondary)] hover:bg-green-600 cursor-pointer`}
                type="submit"
            >
                Submit Customisations
            </button>
        </div>
    );
}
