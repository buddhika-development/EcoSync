import Header from "@/components/ResidentPortal/ResidentHeader";
import ResidentNavbar from "@/components/ResidentPortal/ResidentNavBar";
import RecyclablePage from "@/components/recyclables/RecyclablePage";

export default function page() {
    return (
        <main>
            <Header />
            <ResidentNavbar />
            <RecyclablePage />
        </main>
    )
}