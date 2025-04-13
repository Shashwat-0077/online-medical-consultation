"use client";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import Loading from "@/components/loading";
import { toast } from "@/hooks/use-toast";
import useCheckPatient from "@/hooks/useCheckPatient";
import { Calendar, ClipboardList, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

const sidebarItems = [
    {
        title: "Book Appointment",
        href: "/patient/book-appointment",
        icon: Calendar,
    },
    {
        title: "Upcoming Appointments",
        href: "/patient/upcoming-appointments",
        icon: Calendar,
    },
    {
        title: "Medical History",
        href: "/patient/medical-history",
        icon: ClipboardList,
    },
    {
        title: "Previous Appointments",
        href: "/patient/previous-appointments",
        icon: Clock,
    },
];

export default function PatientLayout({ children }) {
    const { user, isLoading, isPatient } = useCheckPatient();

    if (isLoading) {
        return <Loading />;
    }

    if (!isPatient) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <h1 className="text-2xl font-bold">Access Denied</h1>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <DashboardSidebar
                items={sidebarItems}
                userType="patient"
                userName={user.displayName}
                userImage={user.photoURL}
            />
            <div className="flex-1 md:ml-64">
                <main className="container mx-auto p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}
