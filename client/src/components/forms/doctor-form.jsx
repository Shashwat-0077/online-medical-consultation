"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function DoctorForm() {
    const router = useRouter();
    const { user, authInitialized } = useAuth((state) => state);
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

    // Define form schema with Zod
    const formSchema = z.object({
        name: z
            .string()
            .min(2, { message: "Name must be at least 2 characters." }),
        age: z.coerce
            .number()
            .min(18, { message: "Must be at least 18 years old." })
            .max(100, { message: "Must be no more than 100 years old." }),
        gender: z.string({ required_error: "Please select a gender" }),
        specialization: z.string({
            required_error: "Please select a specialization",
        }),
        street_address: z
            .string()
            .min(2, { message: "Street address is required" }),
        city: z.string().min(2, { message: "City is required" }),
        state: z.string().min(2, { message: "State is required" }),
        zip_code: z.string().min(2, { message: "ZIP code is required" }),
        addition_information: z.string().optional(),
        phone: z
            .string()
            .min(10, { message: "Phone number must be at least 10 digits" }),
        // Global time settings for "same hours every day" option
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        // Per day time settings
        monday_hours: z.object({
            from: z.string().optional(),
            to: z.string().optional(),
        }),
        tuesday_hours: z.object({
            from: z.string().optional(),
            to: z.string().optional(),
        }),
        wednesday_hours: z.object({
            from: z.string().optional(),
            to: z.string().optional(),
        }),
        thursday_hours: z.object({
            from: z.string().optional(),
            to: z.string().optional(),
        }),
        friday_hours: z.object({
            from: z.string().optional(),
            to: z.string().optional(),
        }),
        saturday_hours: z.object({
            from: z.string().optional(),
            to: z.string().optional(),
        }),
        sunday_hours: z.object({
            from: z.string().optional(),
            to: z.string().optional(),
        }),
    });

    // Initialize the form
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            age: "",
            gender: "",
            specialization: "",
            street_address: "",
            city: "",
            state: "",
            zip_code: "",
            addition_information: "",
            phone: "",
            startTime: "09:00",
            endTime: "17:00",
            monday_hours: { from: "09:00", to: "17:00" },
            tuesday_hours: { from: "09:00", to: "17:00" },
            wednesday_hours: { from: "09:00", to: "17:00" },
            thursday_hours: { from: "09:00", to: "17:00" },
            friday_hours: { from: "09:00", to: "17:00" },
            saturday_hours: { from: "09:00", to: "17:00" },
            sunday_hours: { from: "09:00", to: "17:00" },
        },
    });

    const handleDayToggle = (day) => {
        setAvailableDays((prev) => ({
            ...prev,
            [day]: !prev[day],
        }));
    };

    // Effect to apply the single time option to all selected days
    useEffect(() => {
        if (timingOption === "single") {
            const startTime = form.getValues("startTime");
            const endTime = form.getValues("endTime");

            // Update all selected day hours with the global settings
            Object.keys(availableDays).forEach((day) => {
                if (availableDays[day]) {
                    form.setValue(`${day}_hours.from`, startTime);
                    form.setValue(`${day}_hours.to`, endTime);
                }
            });
        }
    }, [
        form.watch("startTime"),
        form.watch("endTime"),
        availableDays,
        timingOption,
    ]);

    // Effect to handle day availability changes
    useEffect(() => {
        // Set or clear hours based on day availability
        Object.keys(availableDays).forEach((day) => {
            if (!availableDays[day]) {
                form.setValue(`${day}_hours.from`, "");
                form.setValue(`${day}_hours.to`, "");
            } else if (timingOption === "single") {
                // If single time mode and day becomes available, set to global time
                form.setValue(`${day}_hours.from`, form.getValues("startTime"));
                form.setValue(`${day}_hours.to`, form.getValues("endTime"));
            } else if (
                timingOption === "perDay" &&
                form.getValues(`${day}_hours.from`) === ""
            ) {
                // If per day mode and day becomes available but has no time, set default
                form.setValue(`${day}_hours.from`, "09:00");
                form.setValue(`${day}_hours.to`, "17:00");
            }
        });
    }, [availableDays, timingOption]);

    // Handle timing option change
    const handleTimingOptionChange = (value) => {
        setTimingOption(value);

        if (value === "single") {
            // When switching to single, apply global time to all available days
            const startTime = form.getValues("startTime");
            const endTime = form.getValues("endTime");

            Object.keys(availableDays).forEach((day) => {
                if (availableDays[day]) {
                    form.setValue(`${day}_hours.from`, startTime);
                    form.setValue(`${day}_hours.to`, endTime);
                }
            });
        }
        // When switching to perDay, the existing values are kept
    };

    const onSubmit = async (data) => {
        // Format data according to your Mongoose schema
        const doctorData = {
            name: data.name,
            gender: data.gender,
            age: data.age,
            street_address: data.street_address,
            city: data.city,
            state: data.state,
            zip_code: data.zip_code,
            addition_information: data.addition_information,
            specialization: data.specialization,
            phone: data.phone,
            // Include hours for each day based on availability
            monday_hours: availableDays.monday
                ? data.monday_hours
                : { from: "", to: "" },
            tuesday_hours: availableDays.tuesday
                ? data.tuesday_hours
                : { from: "", to: "" },
            wednesday_hours: availableDays.wednesday
                ? data.wednesday_hours
                : { from: "", to: "" },
            thursday_hours: availableDays.thursday
                ? data.thursday_hours
                : { from: "", to: "" },
            friday_hours: availableDays.friday
                ? data.friday_hours
                : { from: "", to: "" },
            saturday_hours: availableDays.saturday
                ? data.saturday_hours
                : { from: "", to: "" },
            sunday_hours: availableDays.sunday
                ? data.sunday_hours
                : { from: "", to: "" },
        };

        if (!user) {
            console.error("User not found");
            return;
        }

        // console.log("Form submitted successfully:", doctorData);
        const resp = await fetch(process.env.NEXT_PUBLIC_API_URL + "/doctor", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: user.uid,
                name: doctorData.name,
                gender: doctorData.gender,
                age: doctorData.age,
                street_address: doctorData.street_address,
                city: doctorData.city,
                state: doctorData.state,
                zip_code: doctorData.zip_code,
                addition_information: doctorData.addition_information,
                specialization: doctorData.specialization,
                phone: doctorData.phone,
                monday_hours: doctorData.monday_hours,
                tuesday_hours: doctorData.tuesday_hours,
                wednesday_hours: doctorData.wednesday_hours,
                thursday_hours: doctorData.thursday_hours,
                friday_hours: doctorData.friday_hours,
                saturday_hours: doctorData.saturday_hours,
                sunday_hours: doctorData.sunday_hours,
            }),
        });

        if (resp.ok) {
            toast({
                title: "Success",
                description: "Doctor registration completed successfully.",
            });
            router.push("/doctor/appointments");
        } else {
            const error = await resp.json();
            toast({
                title: "Error",
                description: error.message || "Failed to register doctor.",
                variant: "destructive",
            });
        }

        // Here you would typically send this data to your backend
    };

    if (!authInitialized && user === null) {
        return <div>Loading...</div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <section>
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Dr. Jane Smith"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Age</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="18"
                                            max="100"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="male">
                                                Male
                                            </SelectItem>
                                            <SelectItem value="female">
                                                Female
                                            </SelectItem>
                                            <SelectItem value="other">
                                                Other
                                            </SelectItem>
                                            <SelectItem value="prefer-not-to-say">
                                                Prefer not to say
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="specialization"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Specialization</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select specialization" />
                                            </SelectTrigger>
                                        </FormControl>
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="(555) 123-4567"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </section>

                <section>
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                        Practice Address
                    </h3>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="street_address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Street Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="123 Medical Center Blvd"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="San Francisco"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>State</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="California"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="zip_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ZIP Code</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="94103"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="addition_information"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Additional Information
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Suite number, building name, etc."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                            onValueChange={handleTimingOptionChange}
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
                                            <FormField
                                                control={form.control}
                                                name="startTime"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Start Time
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="time"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="endTime"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            End Time
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="time"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="mt-4">
                                            <p className="mb-2 text-sm text-gray-500">
                                                Select available days:
                                            </p>
                                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                                {Object.entries(
                                                    availableDays
                                                ).map(([day, isAvailable]) => (
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
                                                ))}
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
                                                            <FormField
                                                                control={
                                                                    form.control
                                                                }
                                                                name={`${day}_hours.from`}
                                                                render={({
                                                                    field,
                                                                }) => (
                                                                    <FormItem>
                                                                        <FormLabel>
                                                                            Start
                                                                            Time
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                type="time"
                                                                                {...field}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={
                                                                    form.control
                                                                }
                                                                name={`${day}_hours.to`}
                                                                render={({
                                                                    field,
                                                                }) => (
                                                                    <FormItem>
                                                                        <FormLabel>
                                                                            End
                                                                            Time
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                type="time"
                                                                                {...field}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
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
        </Form>
    );
}
