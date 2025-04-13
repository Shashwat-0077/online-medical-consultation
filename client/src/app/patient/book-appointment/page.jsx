// app/doctors/page.js
"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

export default function DoctorSearchPage() {
    const [searchCity, setSearchCity] = useState("");
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!searchCity.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // Replace with your actual API endpoint
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/doctor/city/${searchCity}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const error = await response.json();
                setDoctors([]);
                setError(error.message || "Failed to fetch doctors");
                return;
            }

            const data = await response.json();

            console.log(data);
            setDoctors(data);
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatHours = (hours) => {
        if (!hours.from || !hours.to) return "Closed";
        return `${hours.from} - ${hours.to}`;
    };

    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="mb-8 text-center text-3xl font-bold">
                Find Doctors in Your City
            </h1>

            {/* Search Bar */}
            <div className="mb-12 flex items-center justify-center space-x-2">
                <div className="relative w-full max-w-md">
                    <Input
                        type="text"
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                        placeholder="Enter city name..."
                        className="pr-10"
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
                <Button onClick={handleSearch} disabled={loading}>
                    Search
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Loading State */}
            {loading && (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="w-full">
                            <CardHeader>
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Doctor Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {doctors.map((doctor) => (
                    <Card key={doctor._id} className="overflow-hidden">
                        <CardHeader className="bg-primary text-primary-foreground">
                            <CardTitle>Dr. {doctor.name}</CardTitle>
                            <Badge variant="secondary" className="w-fit">
                                {doctor.specialization}
                            </Badge>
                        </CardHeader>

                        <CardContent className="pt-6">
                            <div className="mb-4 space-y-2">
                                <div className="grid grid-cols-3">
                                    <span className="font-medium">Gender:</span>
                                    <span className="col-span-2">
                                        {doctor.gender}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3">
                                    <span className="font-medium">Age:</span>
                                    <span className="col-span-2">
                                        {doctor.age}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3">
                                    <span className="font-medium">
                                        Address:
                                    </span>
                                    <span className="col-span-2">
                                        {doctor.street_address}, {doctor.city},{" "}
                                        {doctor.state} {doctor.zip_code}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3">
                                    <span className="font-medium">Phone:</span>
                                    <span className="col-span-2">
                                        {doctor.phone}
                                    </span>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div>
                                <h4 className="mb-2 text-lg font-medium">
                                    Office Hours:
                                </h4>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                                    <p>Monday:</p>
                                    <p>{formatHours(doctor.monday_hours)}</p>

                                    <p>Tuesday:</p>
                                    <p>{formatHours(doctor.tuesday_hours)}</p>

                                    <p>Wednesday:</p>
                                    <p>{formatHours(doctor.wednesday_hours)}</p>

                                    <p>Thursday:</p>
                                    <p>{formatHours(doctor.thursday_hours)}</p>

                                    <p>Friday:</p>
                                    <p>{formatHours(doctor.friday_hours)}</p>

                                    <p>Saturday:</p>
                                    <p>{formatHours(doctor.saturday_hours)}</p>

                                    <p>Sunday:</p>
                                    <p>{formatHours(doctor.sunday_hours)}</p>
                                </div>
                            </div>

                            {doctor.addition_information && (
                                <Dialog>
                                    <DialogTrigger className="mt-4 w-full rounded-md bg-muted p-3 text-sm">
                                        <p className="mb-2 text-left font-medium">
                                            Additional Information:
                                        </p>
                                        <p className="truncate">
                                            {doctor.addition_information}
                                        </p>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Additional Information
                                            </DialogTitle>
                                            <DialogDescription>
                                                {doctor.addition_information}
                                            </DialogDescription>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </CardContent>

                        <CardFooter>
                            <Link
                                href={`/patient/book-appointment/${doctor._id}`}
                            >
                                <Button className="w-full">
                                    Book Appointment
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
