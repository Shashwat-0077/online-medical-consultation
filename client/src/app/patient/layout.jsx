"use client";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Calendar, ClipboardList, Clock } from "lucide-react";

const sidebarItems = [
    {
        title: "Book Appointment",
        href: "/patient/book-appointment",
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
    return (
        <div className="flex min-h-screen bg-slate-50">
            <DashboardSidebar
                items={sidebarItems}
                userType="patient"
                userName="Michael Anderson"
                userImage="/placeholder.svg?height=80&width=80"
            />
            <div className="flex-1 md:ml-64">
                <main className="container mx-auto p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}
