import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for treated patients
const treatedPatients = [
    {
        id: 1,
        name: "Emily Wilson",
        age: 34,
        condition: "Hypertension",
        treatmentDate: "2025-04-01",
        status: "Improved",
    },
    {
        id: 2,
        name: "James Brown",
        age: 45,
        condition: "Type 2 Diabetes",
        treatmentDate: "2025-03-28",
        status: "Stable",
    },
    {
        id: 3,
        name: "Sophia Martinez",
        age: 29,
        condition: "Migraine",
        treatmentDate: "2025-03-25",
        status: "Recovered",
    },
    {
        id: 4,
        name: "Robert Johnson",
        age: 52,
        condition: "Arthritis",
        treatmentDate: "2025-03-22",
        status: "Ongoing",
    },
    {
        id: 5,
        name: "Olivia Davis",
        age: 38,
        condition: "Asthma",
        treatmentDate: "2025-03-20",
        status: "Improved",
    },
    {
        id: 6,
        name: "William Taylor",
        age: 41,
        condition: "Lower Back Pain",
        treatmentDate: "2025-03-18",
        status: "Recovered",
    },
    {
        id: 7,
        name: "Emma Anderson",
        age: 27,
        condition: "Anxiety",
        treatmentDate: "2025-03-15",
        status: "Ongoing",
    },
    {
        id: 8,
        name: "Michael Thomas",
        age: 56,
        condition: "High Cholesterol",
        treatmentDate: "2025-03-12",
        status: "Stable",
    },
];

export default function PatientsTreatedPage() {
    // Format date for display
    const formatDate = (dateString) => {
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
            case "recovered":
                return "bg-green-100 text-green-800";
            case "improved":
                return "bg-blue-100 text-blue-800";
            case "stable":
                return "bg-yellow-100 text-yellow-800";
            case "ongoing":
                return "bg-purple-100 text-purple-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Patients Treated
                </h1>
                <p className="text-muted-foreground">
                    View your history of treated patients and their conditions.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {treatedPatients.map((patient) => (
                    <Card key={patient.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage
                                        src={`/placeholder.svg?height=40&width=40`}
                                    />
                                    <AvatarFallback>
                                        {patient.name
                                            .split(" ")
                                            .map((name) => name[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">
                                        {patient.name}
                                    </CardTitle>
                                    <CardDescription>
                                        Age: {patient.age}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Condition
                                    </p>
                                    <p>{patient.condition}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Treatment Date
                                    </p>
                                    <p>{formatDate(patient.treatmentDate)}</p>
                                </div>
                                <div className="pt-2">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(patient.status)}`}
                                    >
                                        {patient.status}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
