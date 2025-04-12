"use client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data for appointments
const appointments = [
    {
        id: 1,
        patientName: "Emily Wilson",
        date: "2025-04-15",
        time: "09:00 AM",
        reason: "Annual checkup",
        status: "confirmed",
    },
    {
        id: 2,
        patientName: "James Brown",
        date: "2025-04-15",
        time: "10:30 AM",
        reason: "Flu symptoms",
        status: "confirmed",
    },
    {
        id: 3,
        patientName: "Sophia Martinez",
        date: "2025-04-15",
        time: "01:15 PM",
        reason: "Follow-up appointment",
        status: "pending",
    },
    {
        id: 4,
        patientName: "Robert Johnson",
        date: "2025-04-16",
        time: "11:00 AM",
        reason: "Blood pressure check",
        status: "confirmed",
    },
    {
        id: 5,
        patientName: "Olivia Davis",
        date: "2025-04-16",
        time: "03:30 PM",
        reason: "Vaccination",
        status: "confirmed",
    },
];

export default function AppointmentsPage() {
    // Group appointments by date
    const appointmentsByDate = appointments.reduce((acc, appointment) => {
        if (!acc[appointment.date]) {
            acc[appointment.date] = [];
        }
        acc[appointment.date].push(appointment);
        return acc;
    }, {});

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Upcoming Appointments
                </h1>
                <p className="text-muted-foreground">
                    View and manage your scheduled appointments.
                </p>
            </div>

            {Object.entries(appointmentsByDate).map(
                ([date, dateAppointments]) => (
                    <div key={date} className="space-y-4">
                        <h2 className="text-xl font-semibold">
                            {formatDate(date)}
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {dateAppointments.map((appointment) => (
                                <Card key={appointment.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <CardTitle>
                                                {appointment.patientName}
                                            </CardTitle>
                                            <Badge
                                                variant={
                                                    appointment.status ===
                                                    "confirmed"
                                                        ? "default"
                                                        : "outline"
                                                }
                                            >
                                                {appointment.status}
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            {appointment.time}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm">
                                            <p className="font-medium text-muted-foreground">
                                                Reason for visit:
                                            </p>
                                            <p>{appointment.reason}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
