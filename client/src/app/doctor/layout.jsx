"use client";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Calendar, Users, MessageSquare } from "lucide-react";

const sidebarItems = [
    {
        title: "Appointments",
        href: "/doctor/appointments",
        icon: Calendar,
    },
    {
        title: "Patients Treated",
        href: "/doctor/patients-treated",
        icon: Users,
    },
    {
        title: "Feedback",
        href: "/doctor/feedback",
        icon: MessageSquare,
    },
];

export default function DoctorLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <DashboardSidebar
                items={sidebarItems}
                userType="doctor"
                userName="Dr. Sarah Johnson"
                userImage="/placeholder.svg?height=80&width=80"
            />
            <div className="flex-1 md:ml-64">
                <main className="container mx-auto p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}
