import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

// Mock data for patient feedback
const patientFeedback = [
    {
        id: 1,
        patientName: "Emily Wilson",
        date: "2025-04-01",
        rating: 5,
        comment:
            "Dr. Johnson was very thorough and took the time to explain everything clearly. I felt very comfortable and well-cared for during my visit.",
    },
    {
        id: 2,
        patientName: "James Brown",
        date: "2025-03-28",
        rating: 4,
        comment:
            "Good experience overall. The doctor was knowledgeable and addressed all my concerns. The wait time was a bit long though.",
    },
    {
        id: 3,
        patientName: "Sophia Martinez",
        date: "2025-03-25",
        rating: 5,
        comment:
            "Excellent care! Dr. Johnson is attentive and really listens. I've been seeing her for years and always recommend her to friends and family.",
    },
    {
        id: 4,
        patientName: "Robert Johnson",
        date: "2025-03-22",
        rating: 3,
        comment:
            "The treatment was effective, but I wish there was better communication about potential side effects. Otherwise, the doctor was professional.",
    },
    {
        id: 5,
        patientName: "Olivia Davis",
        date: "2025-03-20",
        rating: 5,
        comment:
            "Dr. Johnson is amazing! She made me feel at ease and explained my condition and treatment options thoroughly. Highly recommend!",
    },
    {
        id: 6,
        patientName: "William Taylor",
        date: "2025-03-18",
        rating: 4,
        comment:
            "Very professional and knowledgeable. The office staff was also friendly and helpful. Would definitely return for future care.",
    },
];

export default function FeedbackPage() {
    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    // Render star rating
    const renderStarRating = (rating) => {
        return (
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-5 w-5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Patient Feedback
                </h1>
                <p className="text-muted-foreground">
                    Review feedback from your patients.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {patientFeedback.map((feedback) => (
                    <Card key={feedback.id}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage
                                        src={`/placeholder.svg?height=40&width=40`}
                                        alt={feedback.patientName}
                                    />
                                    <AvatarFallback>
                                        {feedback.patientName
                                            .split(" ")
                                            .map((name) => name[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">
                                        {feedback.patientName}
                                    </CardTitle>
                                    <CardDescription>
                                        {formatDate(feedback.date)}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {renderStarRating(feedback.rating)}
                                <p className="text-sm text-gray-600">
                                    {feedback.comment}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
