"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSocket } from "@/context/SocketContext";
import ReactPlayer from "react-player";
import { use, useCallback, useEffect, useLayoutEffect, useState } from "react";
import peerSession from "@/service/peer";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

//  this will not affect anything in the application
/* BUG : page.jsx:39 Uncaught (in promise) InvalidAccessError: Failed to execute 'addTrack' on 'RTCPeerConnection': A sender already exists for the track.
    at Consultation.useCallback[sendStreams] (page.jsx:39:30)
    at Consultation.useCallback[handleCallAnswered] (page.jsx:96:17) */

const Consultation = ({ params }) => {
    const { roomId } = use(params);
    const router = useRouter();
    const socket = useSocket();
    const [mySocketId, setMySocketId] = useState(null);
    const [isRoomJoined, setIsRoomJoined] = useState(false);
    const [isStreamSent, setIsStreamSent] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);

    const handleStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setLocalStream(stream);
        } catch (error) {
            console.error("Error accessing media devices.", error);
            return;
        }
    }, [setLocalStream]);

    const sendStreams = useCallback(() => {
        if (!localStream) {
            console.error("Local stream not available for sending.");
            return;
        }

        try {
            for (const track of localStream.getTracks()) {
                try {
                    peerSession.peer.addTrack(track, localStream);
                } catch (error) {
                    // Silently ignore "sender already exists" errors
                    if (!error.message.includes("sender already exists")) {
                        console.error("Error adding track:", error);
                    }
                }
            }
        } catch (error) {
            console.error("Error in sendStreams:", error);
        }
    }, [localStream]);

    const toggleVideo = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach((track) => {
                if (track.kind === "video") {
                    track.enabled = !track.enabled;
                }
            });
            setVideoEnabled(!videoEnabled);
        }
    }, [localStream, videoEnabled]);

    // Toggle audio on/off
    const toggleAudio = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach((track) => {
                if (track.kind === "audio") {
                    track.enabled = !track.enabled;
                }
            });
            setAudioEnabled(!audioEnabled);
        }
    }, [localStream, audioEnabled]);

    // room
    const handleRoomJoin = useCallback(() => {
        setIsRoomJoined(true);
        setMySocketId(socket.id);
    }, [setIsRoomJoined, setMySocketId]);

    // user
    const handleUserJoin = useCallback(
        async (userId) => {
            console.log("User joined:", userId);
            setRemoteSocketId(userId);

            const offer = await peerSession.createOffer();
            socket.emit("call:offer", {
                offer,
                toUserId: userId,
            });
            console.log("Offer sent to user:", userId);

            if (localStream) {
                sendStreams();
            }
        },
        [socket, localStream]
    );

    const handleUserLeave = useCallback((userId) => {
        console.log("User left:", userId);
        setRemoteSocketId(null);
        setRemoteStream(null);
        setIsStreamSent(false);
        peerSession.reset();
    }, []);

    // calls
    const handleIncomingCall = useCallback(
        async ({ offer, fromUserId }) => {
            console.log("Incoming offer from:", fromUserId);
            console.log("Offer:", offer);
            setRemoteSocketId(fromUserId);

            const answer = await peerSession.createAnswer(offer);
            socket.emit("call:answer", {
                answer,
                toUserId: fromUserId,
            });
            console.log("Answer sent to user:", fromUserId);
        },
        [socket]
    );

    const handleCallAnswered = useCallback(
        async ({ answer, fromUserId }) => {
            console.log("Answered Received by:", fromUserId);
            console.log("Answer:", answer);

            await peerSession.setRemoteAnswer(answer);
            console.log("Call connected");

            if (localStream) {
                sendStreams();
                setIsStreamSent(true);
            }
        },
        [socket, localStream, sendStreams]
    );

    // negotiation
    const handleNegotiationNeeded = useCallback(async () => {
        if (!remoteSocketId) return;

        console.log("Negotiation Needed");
        const offer = await peerSession.createOffer();
        socket.emit("peer:negotiation", { offer, toUserId: remoteSocketId });
        console.log("Negotiation Request sent");
    }, [socket, remoteSocketId]);

    const handleTrack = useCallback(
        async (event) => {
            console.log("Triggered for id : " + mySocketId);
            const rStream = event.streams;
            console.log("Received Stream");
            // console.log("Received Stream", rStream[0]);
            setRemoteStream(rStream[0]);
        },
        [mySocketId]
    );

    const handleNegotiationIncoming = useCallback(
        async ({ offer, fromUserId }) => {
            console.log("Negotiation Request incoming from:", fromUserId);
            console.log("Negotiation offer:", offer);

            const ans = await peerSession.createAnswer(offer);
            socket.emit("peer:negotiation:done", {
                answer: ans,
                toUserId: fromUserId,
            });
            console.log("Negotiation offer sent");
        },
        [socket]
    );

    const handleNegotiationFinal = useCallback(
        async ({ answer, fromUserId }) => {
            await peerSession.setRemoteAnswer(answer);
            console.log(
                "Negotiation Answered and Completed from :",
                fromUserId
            );
        },
        []
    );

    // Handle page refresh - add event listener once
    useEffect(() => {
        const handleBeforeUnload = () => {
            // Clean up resources
            if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
            }

            // Notify server (if socket is connected)
            if (socket && socket.connected) {
                socket.emit("room:leave", roomId);
            }

            // Reset peer connection
            peerSession.reset();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [roomId, localStream, socket]);

    useEffect(() => {
        socket.emit("room:join", roomId);
        handleStream();
    }, [socket, roomId, handleStream]);

    useEffect(() => {
        socket.on("room:joined", handleRoomJoin);
        return () => {
            socket.off("room:joined", handleRoomJoin);
        };
    }, [socket, handleRoomJoin]);

    useEffect(() => {
        socket.on("user:joined", handleUserJoin);
        socket.on("user:left", handleUserLeave);

        socket.on("call:incoming", handleIncomingCall);
        socket.on("call:answered", handleCallAnswered);

        return () => {
            socket.off("user:joined", handleUserJoin);
            socket.off("user:left", handleUserLeave);
            socket.off("call:incoming", handleIncomingCall);
            socket.off("call:answered", handleCallAnswered);
        };
    }, [
        socket,
        handleUserJoin,
        handleUserLeave,
        handleIncomingCall,
        handleCallAnswered,
    ]);

    useEffect(() => {
        socket.on("peer:negotiation", handleNegotiationIncoming);
        socket.on("peer:negotiation:final", handleNegotiationFinal);
        return () => {
            socket.off("peer:negotiation", handleNegotiationIncoming);
            socket.off("peer:negotiation:final", handleNegotiationFinal);
        };
    }, [socket, handleNegotiationIncoming, handleNegotiationFinal]);

    useEffect(() => {
        peerSession.peer.addEventListener(
            "negotiationneeded",
            handleNegotiationNeeded
        );
        return () => {
            peerSession.peer.removeEventListener(
                "negotiationneeded",
                handleNegotiationNeeded
            );
        };
    }, [peerSession, handleNegotiationNeeded]);

    useEffect(() => {
        peerSession.peer.addEventListener("track", handleTrack);
        return () => {
            peerSession.peer.removeEventListener("track", handleTrack);
        };
    }, [peerSession, handleTrack]);

    useLayoutEffect(() => {
        if (localStream && !isStreamSent && remoteSocketId) {
            sendStreams();
        }
    }, [isStreamSent, sendStreams, localStream, remoteSocketId]);

    return (
        <ProtectedRoute>
            <div className="consultation">
                <h1>Consultation</h1>
                <p>Welcome to the consultation page!</p>

                <h1 className="w-full text-center">
                    <b>{mySocketId}</b>
                </h1>

                <h1>Your Stream</h1>
                {localStream && (
                    <div className="relative">
                        <ReactPlayer
                            url={localStream}
                            playing
                            width="100%"
                            height="100%"
                        />
                        <Button
                            onClick={toggleVideo}
                            variant="destructive"
                            className="absolute top-0 right-0"
                        >
                            {videoEnabled ? <Video /> : <VideoOff />}
                        </Button>
                        <Button
                            onClick={toggleAudio}
                            className="absolute top-0 left-0"
                        >
                            {audioEnabled ? <Mic /> : <MicOff />}
                        </Button>
                    </div>
                )}

                {remoteStream && (
                    <div>
                        <h1>Remote Stream</h1>
                        <ReactPlayer
                            url={remoteStream}
                            playing
                            width="100px"
                            height="100px"
                        />
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default Consultation;
