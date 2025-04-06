"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function Home() {
    const { user, logout } = useAuth();

    return (
        <ProtectedRoute>
            <div className="min-h-screen p-4">
                <div className="mx-auto max-w-2xl">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <div className="mt-4 flex items-center">
                        {user?.photoURL && (
                            <Image
                                src={user.photoURL}
                                width={100}
                                height={100}
                                alt="Profile"
                                className="h-12 w-12 rounded-full mr-4"
                            />
                        )}
                        <div>
                            <p>Welcome, {user?.displayName || user?.email}!</p>
                            {user?.providerId && (
                                <p className="text-sm text-gray-500">
                                    Signed in with{" "}
                                    {user.providerId.replace(".com", "")}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="mt-8">
                        <button
                            onClick={logout}
                            className="bg-red-500 px-4 py-2 text-white"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
