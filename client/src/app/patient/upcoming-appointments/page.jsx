// app/appointments/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { NotebookTabs, StickyNote, Trash2, Video } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const getStatusColor = (status) => {
    switch (status) {
        case "pending":
            return "bg-yellow-400 text-yellow-900";
        case "confirmed":
            return "bg-green-500 text-white";
        case "cancelled":
            return "bg-red-500 text-white";
        default:
            return "bg-gray-300 text-black";
    }
};

const Page = () => {
    const { user, authInitialized } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authInitialized || !user?.uid) return;

        const fetchAppointments = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/appointments/patient/${user.uid}`
                );
                const data = await res.json();
                setAppointments(data);
            } catch (err) {
                console.error("Error fetching appointments:", err);
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
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    if (!authInitialized)
        return <div className="p-6">Initializing auth...</div>;
    if (loading) return <div className="p-6">Loading appointments...</div>;

    return (
        <div className="space-y-4">
            {appointments.map((appt) => (
                <Card key={appt._id}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage
                                        src={appt.doctor.displayImage}
                                        alt={appt.doctor.name}
                                    />
                                    <AvatarFallback>
                                        {appt.doctor.name
                                            ?.split(" ")
                                            .map((name) => name[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>{appt.doctor.name}</CardTitle>
                                    <CardDescription>
                                        {appt.doctor.specialization}
                                    </CardDescription>
                                </div>
                            </div>

                            <Badge
                                variant="outline"
                                className={cn(
                                    getStatusColor(appt.status),
                                    "text-sm"
                                )}
                            >
                                {appt.status}
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
                                        Time:
                                    </span>
                                    <span className="ml-2">
                                        {appt.time || "--:--"}
                                    </span>
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
                        <div className="space-x-2 self-end">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline">
                                            <NotebookTabs />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>See full Appointment</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash2 />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Delete the appointment</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button>
                                            <Video />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Join the call</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default Page;
