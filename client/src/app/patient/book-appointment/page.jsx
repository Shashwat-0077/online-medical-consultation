"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Mock data for doctors
const doctors = [
    { id: 1, name: "Dr. Sarah Johnson", specialty: "General Practitioner" },
    { id: 2, name: "Dr. Michael Chen", specialty: "Cardiologist" },
    { id: 3, name: "Dr. Emily Rodriguez", specialty: "Dermatologist" },
    { id: 4, name: "Dr. David Kim", specialty: "Pediatrician" },
    { id: 5, name: "Dr. Lisa Patel", specialty: "Neurologist" },
];

// Mock data for time slots
const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
];

export default function BookAppointmentPage() {
    const [date, setDate] = useState(undefined);
    const [doctor, setDoctor] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [appointmentType, setAppointmentType] = useState("in-person");
    const [reason, setReason] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form
        if (!date || !doctor || !timeSlot || !reason) {
            toast({
                title: "Missing information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        // Submit form (in a real app, this would send data to the server)
        toast({
            title: "Appointment booked",
            description: `Your appointment has been scheduled for ${format(date, "MMMM d, yyyy")} at ${timeSlot}.`,
        });

        // Reset form
        setDate(undefined);
        setDoctor("");
        setTimeSlot("");
        setReason("");
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Book an Appointment
                </h1>
                <p className="text-muted-foreground">
                    Schedule a new appointment with one of our healthcare
                    providers.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Appointment Details</CardTitle>
                        <CardDescription>
                            Fill in the information below to schedule your
                            appointment.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Doctor selection */}
                        <div className="space-y-2">
                            <Label htmlFor="doctor">Select Doctor</Label>
                            <Select value={doctor} onValueChange={setDoctor}>
                                <SelectTrigger id="doctor">
                                    <SelectValue placeholder="Select a doctor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {doctors.map((doc) => (
                                        <SelectItem
                                            key={doc.id}
                                            value={doc.id.toString()}
                                        >
                                            {doc.name} - {doc.specialty}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date selection */}
                        <div className="space-y-2">
                            <Label>Appointment Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date
                                            ? format(date, "PPP")
                                            : "Select a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Time slot selection */}
                        <div className="space-y-2">
                            <Label htmlFor="time">Appointment Time</Label>
                            <Select
                                value={timeSlot}
                                onValueChange={setTimeSlot}
                            >
                                <SelectTrigger id="time">
                                    <SelectValue placeholder="Select a time slot" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeSlots.map((time) => (
                                        <SelectItem key={time} value={time}>
                                            <div className="flex items-center">
                                                <Clock className="mr-2 h-4 w-4" />
                                                {time}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Appointment type */}
                        <div className="space-y-2">
                            <Label>Appointment Type</Label>
                            <RadioGroup
                                value={appointmentType}
                                onValueChange={setAppointmentType}
                                className="flex flex-col space-y-1"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="in-person"
                                        id="in-person"
                                    />
                                    <Label htmlFor="in-person">
                                        In-person visit
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="video" id="video" />
                                    <Label htmlFor="video">
                                        Video consultation
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="phone" id="phone" />
                                    <Label htmlFor="phone">
                                        Phone consultation
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Reason for visit */}
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Visit</Label>
                            <Textarea
                                id="reason"
                                placeholder="Please describe your symptoms or reason for the appointment"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">
                            Book Appointment
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
