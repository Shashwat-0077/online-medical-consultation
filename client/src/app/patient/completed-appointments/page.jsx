"use client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Mock data for previous appointments
const previousAppointments = [
    {
        id: 1,
        doctorName: "Dr. Sarah Johnson",
        specialty: "General Practitioner",
        date: "2025-03-15",
        time: "10:30 AM",
        reason: "Annual checkup",
        notes: "All vitals normal. Recommended increasing daily water intake and continuing regular exercise.",
        followUp: true,
    },
    {
        id: 2,
        doctorName: "Dr. Michael Chen",
        specialty: "Cardiologist",
        date: "2025-02-20",
        time: "09:15 AM",
        reason: "Heart palpitations",
        notes: "ECG results normal. Likely stress-related. Recommended stress management techniques and follow-up in 3 months if symptoms persist.",
        followUp: false,
    },
    {
        id: 3,
        doctorName: "Dr. Emily Rodriguez",
        specialty: "Dermatologist",
        date: "2025-01-10",
        time: "02:45 PM",
        reason: "Skin rash",
        notes: "Diagnosed as contact dermatitis. Prescribed topical cream and advised to avoid potential allergens.",
        followUp: true,
    },
    {
        id: 4,
        doctorName: "Dr. Sarah Johnson",
        specialty: "General Practitioner",
        date: "2024-12-05",
        time: "11:00 AM",
        reason: "Flu symptoms",
        notes: "Diagnosed with seasonal flu. Prescribed rest, fluids, and over-the-counter medication for symptom management.",
        followUp: false,
    },
    {
        id: 5,
        doctorName: "Dr. Lisa Patel",
        specialty: "Neurologist",
        date: "2024-11-18",
        time: "03:30 PM",
        reason: "Recurring headaches",
        notes: "Likely tension headaches. Recommended tracking triggers, stress management, and proper hydration. Prescribed pain relievers for severe episodes.",
        followUp: true,
    },
];

export default function PreviousAppointmentsPage() {
    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Previous Appointments
                </h1>
                <p className="text-muted-foreground">
                    Review your past appointments and doctor notes.
                </p>
            </div>

            <div className="space-y-6">
                {previousAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage
                                            src={`/placeholder.svg?height=40&width=40`}
                                        />
                                        <AvatarFallback>
                                            {appointment.doctorName
                                                .split(" ")
                                                .map((name) => name[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle>
                                            {appointment.doctorName}
                                        </CardTitle>
                                        <CardDescription>
                                            {appointment.specialty}
                                        </CardDescription>
                                    </div>
                                </div>
                                {appointment.followUp && (
                                    <Badge
                                        variant="outline"
                                        className="bg-blue-50 text-blue-700"
                                    >
                                        Follow-up Required
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                    <div>
                                        <span className="font-medium text-muted-foreground">
                                            Date:
                                        </span>{" "}
                                        {formatDate(appointment.date)}
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">
                                            Time:
                                        </span>{" "}
                                        {appointment.time}
                                    </div>
                                    <div>
                                        <span className="font-medium text-muted-foreground">
                                            Reason:
                                        </span>{" "}
                                        {appointment.reason}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                                        Doctor's Notes
                                    </h4>
                                    <p className="text-sm">
                                        {appointment.notes}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
