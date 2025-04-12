"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function PatientForm() {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log("Patient form submitted");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <section>
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Personal Information
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="patient-name">Full Name</Label>
                        <Input
                            id="patient-name"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="patient-age">Age</Label>
                        <Input
                            id="patient-age"
                            type="number"
                            min="0"
                            max="120"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="patient-gender">Gender</Label>
                        <Select required>
                            <SelectTrigger id="patient-gender">
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
                </div>
            </section>

            {/* Address */}
            <section>
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Contact Information
                </h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="patient-street">Street Address</Label>
                        <Input
                            id="patient-street"
                            placeholder="123 Main Street"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="patient-city">City</Label>
                            <Input
                                id="patient-city"
                                placeholder="San Francisco"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patient-state">State</Label>
                            <Input
                                id="patient-state"
                                placeholder="California"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patient-zip">ZIP Code</Label>
                            <Input
                                id="patient-zip"
                                placeholder="94103"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="patient-email">Email Address</Label>
                        <Input
                            id="patient-email"
                            type="email"
                            placeholder="john.doe@example.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="patient-phone">Phone Number</Label>
                        <Input
                            id="patient-phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            required
                        />
                    </div>
                </div>
            </section>

            {/* Emergency Contact */}
            <section>
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Emergency Contact
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="emergency-name">Contact Name</Label>
                        <Input
                            id="emergency-name"
                            placeholder="Jane Doe"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="emergency-relation">Relationship</Label>
                        <Input
                            id="emergency-relation"
                            placeholder="Spouse"
                            required
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="emergency-phone">Phone Number</Label>
                        <Input
                            id="emergency-phone"
                            type="tel"
                            placeholder="(555) 987-6543"
                            required
                        />
                    </div>
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
