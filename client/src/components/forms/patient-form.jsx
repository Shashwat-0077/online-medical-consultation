"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

// Define form validation schema
const formSchema = z.object({
    fullName: z
        .string()
        .min(2, { message: "Name must be at least 2 characters." }),
    age: z.coerce
        .number()
        .min(0)
        .max(120, { message: "Age must be between 0 and 120." }),
    gender: z.string({ required_error: "Please select a gender." }),
    streetAddress: z
        .string()
        .min(3, { message: "Please enter a valid address." }),
    city: z.string().min(2, { message: "Please enter a city." }),
    state: z.string().min(2, { message: "Please enter a state." }),
    zipCode: z.string().min(5, { message: "Please enter a valid ZIP code." }),
    phoneNumber: z
        .string()
        .min(10, { message: "Please enter a valid phone number." }),
    emergencyName: z
        .string()
        .min(2, { message: "Name must be at least 2 characters." }),
    emergencyRelation: z
        .string()
        .min(2, { message: "Please specify the relationship." }),
    emergencyPhone: z
        .string()
        .min(10, { message: "Please enter a valid phone number." }),
});

export default function PatientForm() {
    const router = useRouter();
    const { user, authInitialized } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            age: "",
            gender: "",
            streetAddress: "",
            city: "",
            state: "",
            zipCode: "",
            phoneNumber: "",
            emergencyName: "",
            emergencyRelation: "",
            emergencyPhone: "",
        },
    });

    // Handle form submission
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        // Here you would typically send the data to your backend

        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patient`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: user.uid,
                name: data.fullName,
                age: data.age,
                gender: data.gender,
                street_address: data.streetAddress,
                city: data.city,
                state: data.state,
                zip_code: data.zipCode,
                phone: data.phoneNumber,
                emergency_contact_name: data.emergencyName,
                emergency_contact_relationship: data.emergencyRelation,
                emergency_contact_phone: data.emergencyPhone,
            }),
        });

        if (!resp.ok) {
            const error = await resp.json();
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
            setIsSubmitting(false);
            return;
        }

        // Show success message
        toast({
            title: "Registration Complete",
            description:
                "Your patient information has been saved successfully.",
        });

        router.push("/patient/book-appointment");
        setIsSubmitting(false);
    };

    if (!authInitialized && user === null) {
        return <div>Loading...</div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information */}
                <section>
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="John Doe"
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
                                            min="0"
                                            max="120"
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
                    </div>
                </section>

                {/* Contact Information */}
                <section>
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                        Contact Information
                    </h3>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="streetAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Street Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="123 Main Street"
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
                                name="zipCode"
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
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
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

                {/* Emergency Contact */}
                <section>
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                        Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="emergencyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Jane Doe"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="emergencyRelation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Relationship</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Spouse"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="emergencyPhone"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            placeholder="(555) 987-6543"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </section>

                <div className="pt-4">
                    <Button
                        type="submit"
                        className="w-full md:w-auto"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Submitting..."
                            : "Complete Registration"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
