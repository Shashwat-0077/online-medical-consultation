"use client";

import { useParams } from "next/navigation";
import VideoCall from "@/components/VideoCall";

export default function RoomPage() {
    const params = useParams();
    const roomId = params.roomId;

    return (
        <div className="room-container">
            <h1>Video Call Room</h1>
            <VideoCall roomId={roomId} />
        </div>
    );
}
