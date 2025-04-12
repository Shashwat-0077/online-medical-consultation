"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function DoctorForm() {
    const [timingOption, setTimingOption] = useState("single");
    const [availableDays, setAvailableDays] = useState({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
    });

    const specializations = [
        "Cardiology",
        "Dermatology",
        "Endocrinology",
        "Gastroenterology",
        "Neurology",
        "Obstetrics",
        "Oncology",
        "Ophthalmology",
        "Orthopedics",
        "Pediatrics",
        "Psychiatry",
        "Radiology",
        "Urology",
    ];

    const handleDayToggle = (day) => {
        setAvailableDays((prev) => ({
            ...prev,
            [day]: !prev[day],
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <section>
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Personal Information
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="Dr. Jane Smith"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                            id="age"
                            type="number"
                            min="18"
                            max="100"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select required>
                            <SelectTrigger id="gender">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="prefer-not-to-say">
                                    Prefer not to say
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Select required>
                            <SelectTrigger id="specialization">
                                <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                            <SelectContent>
                                {specializations.map((spec) => (
                                    <SelectItem
                                        key={spec}
                                        value={spec.toLowerCase()}
                                    >
                                        {spec}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Practice Address
                </h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                            id="street"
                            placeholder="123 Medical Center Blvd"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                placeholder="San Francisco"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                placeholder="California"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="zip">ZIP Code</Label>
                            <Input id="zip" placeholder="94103" required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="additional">
                            Additional Information
                        </Label>
                        <Textarea
                            id="additional"
                            placeholder="Suite number, building name, etc."
                        />
                    </div>
                </div>
            </section>

            <section>
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Availability Schedule
                </h3>
                <div className="space-y-4">
                    <Tabs
                        defaultValue="single"
                        value={timingOption}
                        onValueChange={(value) => setTimingOption(value)}
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="single">
                                Same Hours Every Day
                            </TabsTrigger>
                            <TabsTrigger value="perDay">
                                Custom Hours Per Day
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="single" className="mt-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="start-time">
                                                Start Time
                                            </Label>
                                            <Input
                                                id="start-time"
                                                type="time"
                                                defaultValue="09:00"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end-time">
                                                End Time
                                            </Label>
                                            <Input
                                                id="end-time"
                                                type="time"
                                                defaultValue="17:00"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <p className="mb-2 text-sm text-gray-500">
                                            Select available days:
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                            {Object.entries(availableDays).map(
                                                ([day, isAvailable]) => (
                                                    <div
                                                        key={day}
                                                        className="flex items-center space-x-2 rounded bg-gray-50 p-2"
                                                    >
                                                        <Switch
                                                            id={`day-${day}`}
                                                            checked={
                                                                isAvailable
                                                            }
                                                            onCheckedChange={() =>
                                                                handleDayToggle(
                                                                    day
                                                                )
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor={`day-${day}`}
                                                            className="capitalize"
                                                        >
                                                            {day}
                                                        </Label>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="perDay" className="mt-4">
                            <Card>
                                <CardContent className="space-y-4 pt-6">
                                    {Object.entries(availableDays).map(
                                        ([day, isAvailable]) => (
                                            <div
                                                key={day}
                                                className="border-b pb-4 last:border-0"
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            id={`custom-day-${day}`}
                                                            checked={
                                                                isAvailable
                                                            }
                                                            onCheckedChange={() =>
                                                                handleDayToggle(
                                                                    day
                                                                )
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor={`custom-day-${day}`}
                                                            className="font-medium capitalize"
                                                        >
                                                            {day}
                                                        </Label>
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        {isAvailable
                                                            ? "Available"
                                                            : "Holiday"}
                                                    </span>
                                                </div>
                                                {isAvailable && (
                                                    <div className="mt-2 grid grid-cols-1 gap-4 pl-7 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor={`start-${day}`}
                                                            >
                                                                Start Time
                                                            </Label>
                                                            <Input
                                                                id={`start-${day}`}
                                                                type="time"
                                                                defaultValue="09:00"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor={`end-${day}`}
                                                            >
                                                                End Time
                                                            </Label>
                                                            <Input
                                                                id={`end-${day}`}
                                                                type="time"
                                                                defaultValue="17:00"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            <div className="pt-4">
                <Button type="submit" className="w-full md:w-auto">
                    Complete Registration
                </Button>
            </div>
        </form>
    );
}
