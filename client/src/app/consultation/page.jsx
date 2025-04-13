"use client";

import VideoCall from "@/components/VideoCall";
import { use } from "react";

export default function RoomPage({ searchParams }) {
    const { roomId, userId } = use(searchParams);
    console.log(searchParams);

    return (
        <div className="room-container">
            <h1>Video Call Room</h1>
            <VideoCall roomId={roomId} userId={userId} />
        </div>
    );
}
