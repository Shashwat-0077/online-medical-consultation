import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Mock data for medical history
const conditions = [
    {
        id: 1,
        name: "Hypertension",
        diagnosedDate: "2023-06-15",
        status: "Ongoing",
        notes: "Controlled with medication. Regular monitoring required.",
    },
    {
        id: 2,
        name: "Seasonal Allergies",
        diagnosedDate: "2020-03-10",
        status: "Recurring",
        notes: "Worse during spring. Antihistamines prescribed as needed.",
    },
    {
        id: 3,
        name: "Lower Back Pain",
        diagnosedDate: "2022-11-05",
        status: "Resolved",
        notes: "Physical therapy completed. Exercise regimen recommended.",
    },
];

const medications = [
    {
        id: 1,
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        startDate: "2023-06-20",
        endDate: null,
        purpose: "Blood pressure management",
    },
    {
        id: 2,
        name: "Cetirizine",
        dosage: "10mg",
        frequency: "As needed",
        startDate: "2020-03-15",
        endDate: null,
        purpose: "Allergy relief",
    },
    {
        id: 3,
        name: "Ibuprofen",
        dosage: "400mg",
        frequency: "As needed for pain",
        startDate: "2022-11-10",
        endDate: "2023-01-15",
        purpose: "Back pain management",
    },
    {
        id: 4,
        name: "Vitamin D",
        dosage: "1000 IU",
        frequency: "Once daily",
        startDate: "2023-02-01",
        endDate: null,
        purpose: "Supplement",
    },
];

const procedures = [
    {
        id: 1,
        name: "Physical Examination",
        date: "2025-01-10",
        provider: "Dr. Sarah Johnson",
        notes: "Annual physical. All results within normal range.",
    },
    {
        id: 2,
        name: "Blood Panel",
        date: "2025-01-10",
        provider: "LabCorp",
        notes: "Complete blood count and metabolic panel. Results normal.",
    },
    {
        id: 3,
        name: "X-Ray (Lower Back)",
        date: "2022-11-08",
        provider: "City Imaging Center",
        notes: "No structural abnormalities detected. Muscle strain diagnosed.",
    },
    {
        id: 4,
        name: "Allergy Testing",
        date: "2020-03-12",
        provider: "Dr. Emily Rodriguez",
        notes: "Positive for pollen and dust mites. Treatment plan created.",
    },
];

export default function MedicalHistoryPage() {
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "Present";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "resolved":
                return "bg-green-100 text-green-800";
            case "ongoing":
                return "bg-blue-100 text-blue-800";
            case "recurring":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Medical History
                </h1>
                <p className="text-muted-foreground">
                    View your comprehensive medical history and records.
                </p>
            </div>

            <Tabs defaultValue="conditions" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="conditions">Conditions</TabsTrigger>
                    <TabsTrigger value="medications">Medications</TabsTrigger>
                    <TabsTrigger value="procedures">
                        Procedures & Tests
                    </TabsTrigger>
                </TabsList>

                {/* Conditions Tab */}
                <TabsContent value="conditions" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {conditions.map((condition) => (
                            <Card key={condition.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <CardTitle>{condition.name}</CardTitle>
                                        <Badge
                                            className={getStatusColor(
                                                condition.status
                                            )}
                                        >
                                            {condition.status}
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        Diagnosed:{" "}
                                        {formatDate(condition.diagnosedDate)}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">{condition.notes}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Medications Tab */}
                <TabsContent value="medications" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {medications.map((medication) => (
                            <Card key={medication.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <CardTitle>{medication.name}</CardTitle>
                                        <Badge
                                            variant={
                                                medication.endDate
                                                    ? "outline"
                                                    : "default"
                                            }
                                        >
                                            {medication.endDate
                                                ? "Completed"
                                                : "Active"}
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        {medication.dosage} -{" "}
                                        {medication.frequency}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <span className="font-medium">
                                                Purpose:
                                            </span>{" "}
                                            {medication.purpose}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Duration:
                                            </span>{" "}
                                            {formatDate(medication.startDate)} -{" "}
                                            {formatDate(medication.endDate)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Procedures Tab */}
                <TabsContent value="procedures" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {procedures.map((procedure) => (
                            <Card key={procedure.id}>
                                <CardHeader className="pb-2">
                                    <CardTitle>{procedure.name}</CardTitle>
                                    <CardDescription>
                                        {formatDate(procedure.date)} •{" "}
                                        {procedure.provider}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">{procedure.notes}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
