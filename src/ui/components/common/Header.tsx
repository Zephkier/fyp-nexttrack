import Hero from "@/ui/components/common/Hero";

export default function Header() {
    return (
        // // Actual header's content is here
        // <header className="mb-20 h-32 flex items-center justify-center bg-black text-white">
        //     <p className="italic text-gray-400 ">(header placeholder)</p>
        // </header>

        // Due to website's small size, the header is basically the hero section
        <header>
            <Hero />
        </header>
    );
}
