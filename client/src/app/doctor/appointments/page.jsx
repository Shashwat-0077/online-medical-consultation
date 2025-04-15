"use client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { Eye, NotebookTabs, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export default function AppointmentsPage() {
    // Format date for display
    const { user, authInitialized } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentAppointment, setCurrentAppointment] = useState(null);
    const [appointmentFormState, setAppointmentFormState] = useState({
        date: "",
        timeFrom: "",
        timeTo: "",
    });

    const getModeColor = (mode) => {
        switch (mode) {
            case "in-person":
                return "bg-blue-500 text-white";
            case "virtual":
                return "bg-green-500 text-white";
            default:
                return "bg-gray-300 text-black";
        }
    };

    useEffect(() => {
        if (!authInitialized || !user?.uid) return;

        const fetchAppointments = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/appointments/doctor/${user.uid}`
                );
                if (!res.ok) {
                    throw new Error("Failed to fetch appointments");
                }
                const data = await res.json();
                setAppointments(
                    data.filter((appt) => {
                        const appointmentDate = new Date(appt.date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        if (appt.status === "pending") {
                            return true;
                        }

                        return (
                            appointmentDate >= today &&
                            appt.status === "confirmed"
                        );
                    })
                );
            } catch (err) {
                console.error("Error fetching appointments:", err);
                toast({
                    title: "Error",
                    description:
                        "Failed to load appointments. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [authInitialized, user?.uid]);

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const handleDialogOpen = (appointment) => {
        setCurrentAppointment(appointment);

        // Initialize form state with appointment data
        setAppointmentFormState({
            date: appointment.date || "",
            timeFrom: appointment.time?.from || "",
            timeTo: appointment.time?.to || "",
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setAppointmentFormState((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAcceptAppointment = async () => {
        if (!currentAppointment) return;

        // Validate inputs
        if (!appointmentFormState.date) {
            toast({
                title: "Missing information",
                description: "Please select a date for the appointment",
                variant: "destructive",
            });
            return;
        }

        if (!appointmentFormState.timeFrom || !appointmentFormState.timeTo) {
            toast({
                title: "Missing information",
                description: "Please select both start and end times",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/appointments/${currentAppointment._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status: "confirmed",
                        date: appointmentFormState.date,
                        from_time: appointmentFormState.timeFrom,
                        to_time: appointmentFormState.timeTo,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                toast({
                    title: "Error",
                    description:
                        error.message || "Failed to confirm appointment",
                    variant: "destructive",
                });
                return;
            }

            // Update the local state to reflect the changes
            setAppointments(
                appointments.map((appt) =>
                    appt._id === currentAppointment._id
                        ? {
                              ...appt,
                              status: "confirmed",
                              date: appointmentFormState.date,
                              from_time: appointmentFormState.timeFrom,
                              to_time: appointmentFormState.timeTo,
                          }
                        : appt
                )
            );

            toast({
                title: "Success",
                description: "Appointment has been confirmed",
                variant: "default",
            });
        } catch (error) {
            console.error("Error accepting appointment:", error);
            toast({
                title: "Error",
                description: "Failed to confirm appointment. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleDeclineAppointment = async () => {
        if (!currentAppointment) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/appointments/cancel/${currentAppointment._id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: "Failed to decline appointment",
                    variant: "destructive",
                });
                return;
            }

            // Update the local state to reflect the changes
            setAppointments(
                appointments.map((appt) =>
                    appt._id === currentAppointment._id
                        ? { ...appt, status: "cancelled" }
                        : appt
                )
            );

            toast({
                title: "Success",
                description: "Appointment has been declined",
                variant: "default",
            });
        } catch (error) {
            console.error("Error declining appointment:", error);
            toast({
                title: "Error",
                description: "Failed to decline appointment. Please try again.",
                variant: "destructive",
            });
        }
    };

    if (!authInitialized || loading) {
        return <Loading />;
    }

    if (!appointments || appointments.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">
                    No appointments found for today.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {appointments.map((appt) => (
                <Card
                    key={appt._id}
                    className={cn(appt.status === "cancelled" && "opacity-60")}
                >
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage
                                        src={appt.patient.displayImage}
                                    />
                                    <AvatarFallback>
                                        {appt.patient.name
                                            ?.split(" ")
                                            .map((name) => name[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>{appt.patient.name}</CardTitle>
                                    <CardDescription>
                                        {appt.status}
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className={cn(
                                    getModeColor(appt.mode),
                                    "text-sm"
                                )}
                            >
                                {appt.mode}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex justify-between">
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                <div>
                                    <span className="font-medium text-muted-foreground">
                                        Date:
                                    </span>
                                    <span className="ml-2">
                                        {formatDate(appt.date) || "--/--/--"}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-muted-foreground">
                                        From Time:
                                    </span>
                                    <span className="ml-2">
                                        {appt.from_time}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-muted-foreground">
                                        To Time:
                                    </span>
                                    <span className="ml-2">{appt.to_time}</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium text-muted-foreground">
                                    Reason:
                                </h4>
                                <p className="ml-2 text-sm">
                                    {appt.reason || "Not specified"}
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2 self-end">
                            <Dialog
                                onOpenChange={(open) =>
                                    open && handleDialogOpen(appt)
                                }
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1"
                                        disabled={appt.status === "cancelled"}
                                    >
                                        <Eye className="h-4 w-4" />
                                        View Details
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md md:max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border-2 border-primary/10">
                                                    <AvatarImage
                                                        src={
                                                            appt.patient
                                                                .displayImage
                                                        }
                                                    />
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {appt.patient.name
                                                            ?.split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="text-lg font-semibold">
                                                        {appt.patient.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Patient
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    getModeColor(appt.mode),
                                                    "px-3 py-1 text-xs font-medium"
                                                )}
                                            >
                                                {appt.mode}
                                            </Badge>
                                        </DialogTitle>
                                    </DialogHeader>

                                    <Separator className="my-4" />

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium text-muted-foreground">
                                                Personal Details
                                            </h4>
                                            <div className="grid grid-cols-[80px_1fr] gap-1 text-sm">
                                                <span className="font-medium">
                                                    Age:
                                                </span>
                                                <span>
                                                    {appt.patient.age || "—"}
                                                </span>

                                                <span className="font-medium">
                                                    Gender:
                                                </span>
                                                <span>
                                                    {appt.patient.gender || "—"}
                                                </span>

                                                <span className="font-medium">
                                                    Phone:
                                                </span>
                                                <span>
                                                    {appt.patient.phone || "—"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium text-muted-foreground">
                                                Emergency Contact
                                            </h4>
                                            <div className="text-sm">
                                                <p>
                                                    {appt.patient
                                                        .emergency_contact_name ||
                                                        "—"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {appt.patient
                                                        .emergency_contact_relationship
                                                        ? `${appt.patient.emergency_contact_relationship} • ${appt.patient.emergency_contact_phone || "—"}`
                                                        : "No emergency contact specified"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        <h4 className="text-sm font-medium text-muted-foreground">
                                            Address
                                        </h4>
                                        <p className="text-sm">
                                            {[
                                                appt.patient.street_address,
                                                appt.patient.city,
                                                appt.patient.state,
                                                appt.patient.zip_code,
                                            ]
                                                .filter(Boolean)
                                                .join(", ") ||
                                                "No address specified"}
                                        </p>
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        <h4 className="text-sm font-medium text-muted-foreground">
                                            Reason for Visit
                                        </h4>
                                        <div className="rounded-md bg-muted/50 px-3 text-sm">
                                            {appt.reason ||
                                                "No reason specified"}
                                        </div>
                                    </div>

                                    {appt.status === "pending" && (
                                        <>
                                            <Separator className="my-4" />

                                            <div className="space-y-4">
                                                <h4 className="font-medium">
                                                    Schedule Appointment
                                                </h4>

                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                                    <label
                                                        htmlFor="appointment-date"
                                                        className="w-28 text-sm font-medium"
                                                    >
                                                        Date:
                                                    </label>
                                                    <div className="flex-1">
                                                        <Input
                                                            id="appointment-date"
                                                            name="date"
                                                            type="date"
                                                            className="w-full"
                                                            value={
                                                                appointmentFormState.date
                                                            }
                                                            onChange={
                                                                handleFormChange
                                                            }
                                                            disabled={
                                                                appt.status ===
                                                                "cancelled"
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <div className="flex items-center gap-3">
                                                        <label
                                                            htmlFor="time-from"
                                                            className="w-28 text-sm font-medium"
                                                        >
                                                            From:
                                                        </label>
                                                        <Input
                                                            id="time-from"
                                                            name="timeFrom"
                                                            type="time"
                                                            className="w-full"
                                                            value={
                                                                appointmentFormState.timeFrom
                                                            }
                                                            onChange={
                                                                handleFormChange
                                                            }
                                                            disabled={
                                                                appt.status ===
                                                                "cancelled"
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <label
                                                            htmlFor="time-to"
                                                            className="w-28 text-sm font-medium sm:sr-only"
                                                        >
                                                            To:
                                                        </label>
                                                        <Input
                                                            id="time-to"
                                                            name="timeTo"
                                                            type="time"
                                                            className="w-full"
                                                            value={
                                                                appointmentFormState.timeTo
                                                            }
                                                            onChange={
                                                                handleFormChange
                                                            }
                                                            disabled={
                                                                appt.status ===
                                                                "cancelled"
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <DialogFooter className="mt-6 flex justify-end gap-3">
                                                <Button
                                                    variant="outline"
                                                    className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={
                                                        handleDeclineAppointment
                                                    }
                                                    disabled={
                                                        appt.status ===
                                                        "cancelled"
                                                    }
                                                >
                                                    Decline
                                                </Button>
                                                <Button
                                                    onClick={
                                                        handleAcceptAppointment
                                                    }
                                                    disabled={
                                                        appt.status ===
                                                        "cancelled"
                                                    }
                                                >
                                                    Accept Appointment
                                                </Button>
                                            </DialogFooter>
                                        </>
                                    )}
                                </DialogContent>
                            </Dialog>

                            {appt.status === "confirmed" && (
                                <>
                                    <Link
                                        href={`/doctor/appointments/${appt._id}`}
                                    >
                                        <Button size="sm">
                                            Complete Appointment
                                        </Button>
                                    </Link>

                                    {appt.mode === "virtual" && (
                                        <Link
                                            href={`/consultation?roomId=${appt._id}&userId=${user.uid}`}
                                            target="_blank"
                                        >
                                            <Button
                                                size="sm"
                                                className="flex items-center gap-1"
                                            >
                                                <Video className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
