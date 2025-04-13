"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const VideoCall = ({ roomId, userId }) => {
    // State that affects rendering
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);
    const [peerConnections, setPeerConnections] = useState({});
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    // Refs for values that don't trigger re-renders and DOM elements
    const localVideoRef = useRef(null);
    const peerVideoRef = useRef(null);
    const socketRef = useRef(null);
    const streamRef = useRef(null);
    const peersRef = useRef({});

    // Initialize socket connection
    useEffect(() => {
        const socketUrl = "http://localhost:5000";
        console.log("Connecting to socket server at:", socketUrl);

        const newSocket = io(socketUrl, {
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = newSocket;

        newSocket.on("connect", () => {
            console.log("Connected to socket server");
        });

        newSocket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
            setError(
                "Failed to connect to the video server. Please try again later."
            );
        });

        return () => {
            console.log("Cleaning up socket connection");
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Get media stream
    useEffect(() => {
        if (!socketRef.current) return;

        console.log("Requesting media devices");
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                console.log("Got local media stream");
                streamRef.current = currentStream;

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = currentStream;
                }

                // Join the room once we have stream and socket
                socketRef.current.emit("join-room", roomId, userId);
                setConnected(true);
            })
            .catch((error) => {
                console.error("Error accessing media devices:", error);
                setError(
                    "Could not access camera or microphone. Please check permissions."
                );
            });
    }, [roomId, userId]);

    // Handle socket events
    useEffect(() => {
        if (!socketRef.current || !roomId) return;

        // Remove old listeners before adding new ones
        socketRef.current.off("user-connected");
        socketRef.current.off("signal");
        socketRef.current.off("user-disconnected");

        // Handle new user connection
        socketRef.current.on("user-connected", (newUserId) => {
            console.log("New user connected:", newUserId);
            if (streamRef.current) {
                createPeer(newUserId);
            }
        });

        // Handle incoming signal
        socketRef.current.on("signal", ({ userId: signalUserId, signal }) => {
            console.log("Received signal from:", signalUserId);

            if (peersRef.current[signalUserId]) {
                console.log("Forwarding signal to existing peer");
                peersRef.current[signalUserId].signal(signal);
            } else {
                console.log("Creating new peer to answer signal");
                addPeer(signalUserId, signal);
            }
        });

        // Handle user disconnect
        socketRef.current.on("user-disconnected", (disconnectedUserId) => {
            console.log("User disconnected:", disconnectedUserId);
            if (peersRef.current[disconnectedUserId]) {
                peersRef.current[disconnectedUserId].destroy();

                // Remove from refs and state atomically
                delete peersRef.current[disconnectedUserId];
                setPeerConnections((prevPeers) => {
                    const newPeers = { ...prevPeers };
                    delete newPeers[disconnectedUserId];
                    return newPeers;
                });
            }
        });
    }, [roomId]);

    // Clean up media stream on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                console.log("Stopping media tracks");
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    // Create a peer connection (initiator)
    const createPeer = useCallback(
        (peerUserId) => {
            if (!streamRef.current || !socketRef.current) {
                console.error(
                    "Cannot create peer: prerequisites not available"
                );
                return;
            }

            console.log(
                "Creating peer connection as initiator for",
                peerUserId
            );
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: streamRef.current,
                config: {
                    iceServers: [
                        { urls: "stun:stun.l.google.com:19302" },
                        { urls: "stun:stun1.l.google.com:19302" },
                    ],
                },
            });

            peer.on("signal", (signal) => {
                console.log("Local peer signaling to", peerUserId);
                socketRef.current.emit("signal", {
                    userId: userId,
                    roomId,
                    signal,
                });
            });

            peer.on("stream", (peerStream) => {
                console.log("Received stream from peer", peerUserId);
                if (peerVideoRef.current) {
                    console.log("Setting peer video source");
                    peerVideoRef.current.srcObject = peerStream;
                } else {
                    console.error("peerVideoRef is not available");
                }
            });

            peer.on("connect", () => {
                console.log("Peer connection established with", peerUserId);
            });

            peer.on("error", (err) => {
                console.error(
                    "Peer connection error with",
                    peerUserId,
                    ":",
                    err
                );
            });

            // Store peer in ref and update state
            peersRef.current[peerUserId] = peer;
            setPeerConnections((prev) => ({ ...prev, [peerUserId]: peer }));
        },
        [roomId, userId]
    );

    // Add a peer connection (non-initiator)
    const addPeer = useCallback(
        (peerUserId, incomingSignal) => {
            if (!streamRef.current || !socketRef.current) {
                console.error("Cannot add peer: prerequisites not available");
                return;
            }

            console.log("Creating peer connection as receiver for", peerUserId);
            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: streamRef.current,
                config: {
                    iceServers: [
                        { urls: "stun:stun.l.google.com:19302" },
                        { urls: "stun:stun1.l.google.com:19302" },
                    ],
                },
            });

            peer.on("signal", (signal) => {
                console.log("Answering peer signaling to", peerUserId);
                socketRef.current.emit("signal", {
                    userId: userId,
                    roomId,
                    signal,
                });
            });

            peer.on("stream", (peerStream) => {
                console.log("Received stream from peer", peerUserId);
                if (peerVideoRef.current) {
                    console.log("Setting peer video source");
                    peerVideoRef.current.srcObject = peerStream;
                } else {
                    console.error("peerVideoRef is not available");
                }
            });

            peer.on("connect", () => {
                console.log("Peer connection established with", peerUserId);
            });

            peer.on("error", (err) => {
                console.error(
                    "Peer connection error with",
                    peerUserId,
                    ":",
                    err
                );
            });

            // Process the incoming signal
            peer.signal(incomingSignal);

            // Store peer in ref and update state
            peersRef.current[peerUserId] = peer;
            setPeerConnections((prev) => ({ ...prev, [peerUserId]: peer }));
        },
        [roomId, userId]
    );

    // Media control functions
    const toggleAudio = useCallback(() => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
                console.log("Audio track enabled:", audioTrack.enabled);
            }
        }
    }, []);

    const toggleVideo = useCallback(() => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
                console.log("Video track enabled:", videoTrack.enabled);
            }
        }
    }, []);

    const endCall = useCallback(() => {
        console.log("Ending call");
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }

        // Destroy all peer connections
        Object.values(peersRef.current).forEach((peer) => peer.destroy());
        peersRef.current = {};
        setPeerConnections({});

        // Disconnect socket
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        window.location.href = "/";
    }, []);

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTitle className="text-lg font-semibold">
                        Connection Error
                    </AlertTitle>
                    <AlertDescription>
                        <p className="mb-4">{error}</p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry Connection
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-6xl p-4">
            <div className="mb-6">
                <div className="mb-2 flex flex-col items-start justify-between md:flex-row md:items-center">
                    <h1 className="text-2xl font-bold">Room: {roomId}</h1>
                    <div className="mt-2 flex items-center space-x-2 md:mt-0">
                        <Badge
                            variant={connected ? "success" : "secondary"}
                            className="px-3 py-1"
                        >
                            {connected ? "Connected" : "Connecting..."}
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1">
                            Peers: {Object.keys(peerConnections).length}
                        </Badge>
                    </div>
                </div>
                <p className="text-sm text-gray-500">Your ID: {userId}</p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Local Video */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg">
                            <span>You</span>
                            {!isAudioEnabled && (
                                <MicOff className="ml-2 h-4 w-4 text-red-500" />
                            )}
                            {!isVideoEnabled && (
                                <VideoOff className="ml-2 h-4 w-4 text-red-500" />
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative h-64 bg-gray-100 dark:bg-gray-800 md:h-80">
                            <video
                                ref={localVideoRef}
                                muted
                                autoPlay
                                playsInline
                                className="h-full w-full object-cover"
                            />
                            {!isVideoEnabled && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                                    <VideoOff className="h-12 w-12 text-white opacity-70" />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Peer Video */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Peer</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative h-64 bg-gray-100 dark:bg-gray-800 md:h-80">
                            <video
                                ref={peerVideoRef}
                                autoPlay
                                playsInline
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-4">
                <CardFooter className="flex justify-center space-x-4 p-4">
                    <Button
                        variant={isAudioEnabled ? "outline" : "destructive"}
                        size="icon"
                        className="h-12 w-12"
                        onClick={toggleAudio}
                    >
                        {isAudioEnabled ? (
                            <Mic className="h-5 w-5" />
                        ) : (
                            <MicOff className="h-5 w-5" />
                        )}
                    </Button>
                    <Button
                        variant={isVideoEnabled ? "outline" : "destructive"}
                        size="icon"
                        className="h-12 w-12"
                        onClick={toggleVideo}
                    >
                        {isVideoEnabled ? (
                            <Video className="h-5 w-5" />
                        ) : (
                            <VideoOff className="h-5 w-5" />
                        )}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={endCall}
                        className="h-12 px-6"
                    >
                        <PhoneOff className="mr-2 h-5 w-5" />
                        End Call
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default VideoCall;
