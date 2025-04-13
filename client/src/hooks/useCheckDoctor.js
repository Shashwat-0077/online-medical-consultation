import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function useCheckDoctor() {
    const { user, authInitialized } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isDoctor, setIsDoctor] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkDoctorRole = async () => {
            if (!authInitialized) {
                return;
            }

            if (!user) {
                setIsLoading(false);
                toast({
                    title: "Authentication Required",
                    description: "Please sign in to access this page.",
                    variant: "destructive",
                });
                router.push("/auth/signin");
                return;
            }

            try {
                const resp = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/user/${user.uid}/role`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!resp.ok) {
                    throw new Error("Failed to fetch user role");
                }

                const data = await resp.json();
                if (data.role === "doctor") {
                    setIsDoctor(true);
                } else if (data.role === "guest") {
                    toast({
                        title: "Onboarding Required",
                        description:
                            "Please complete onboarding to access this page.",
                        variant: "destructive",
                    });
                    router.push("/onboarding");
                } else {
                    toast({
                        title: "Access Denied",
                        description:
                            "You do not have permission to access this page.",
                        variant: "destructive",
                    });
                    router.push("/");
                }
            } catch (error) {
                console.error("Error checking doctor role:", error);
                router.push("/");
            } finally {
                setIsLoading(false);
            }
        };

        checkDoctorRole();
    }, [authInitialized, user, router]);

    return {
        isLoading,
        isDoctor,
        user,
    };
}
