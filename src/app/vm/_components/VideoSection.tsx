import LoadingAnimation from "@/components/LoadingAnimation";
import { Button } from "@/components/ui/button";
import VideoCallInterface from "@/components/VideoCallInterface";
import { Video } from "lucide-react";
import { useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import { useVendingMachine } from "@/context/VendingMachineContext";

function VideoSection({ socket }: { socket: ReturnType<typeof io> }) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const { medicinesList } = useVendingMachine();

  // useEffect(() => {
  //   socket.on("call-ended", () => {
  //     console.log("call ended");

  //     // Stop the media stream and clean up
  //     if (remoteVideoRef.current?.srcObject) {
  //       const stream = remoteVideoRef.current.srcObject as MediaStream;
  //       stream.getTracks().forEach((track) => track.stop());
  //       remoteVideoRef.current.srcObject = null;
  //     }

  //     // Update UI to reflect that the call has ended
  //     setIsConnected(false);
  //     setIsWaiting(true);
  //   });

  //   return () => {
  //     socket.off("call-ended");
  //   };
  // }, []);

  const startCall = () => {
    setIsWaiting(false);
    setIsLoading(true);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);

        if (myVideoRef.current) myVideoRef.current.srcObject = stream;

        const peer = new Peer({ initiator: true, trickle: false, stream });

        // Send the initial signal to the server
        peer.on("signal", (data) => {
          socket.emit("call-doctor", {
            signal: data,
            patient: {
              id: 3,
              patientId: socket.id,
              name: "Patient",
              age: 28,
              symptoms: "Fever",
              urgency: "Urgent",
              signal: data,
              medicinesAvailable: medicinesList.map((medicine) => ({
                name: medicine.name,
                tablets: medicine.tablets,
                dosage: medicine.dosage,
                indications: medicine.indications,
              })),
            },
          });
        });

        // Listen for the doctor's signal
        socket.on("doctor-accepted", ({ signal }) => {
          peer.signal(signal);
        });

        // Stop the media stream and clean up
        socket.on("call-ended", () => {
          console.log("call ended");

          if (remoteVideoRef.current?.srcObject) {
            const stream = remoteVideoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            remoteVideoRef.current.srcObject = null;
          }

          // Update UI to reflect that the call has ended
          setIsConnected(false);
          setIsWaiting(true);
        });

        // Handle the remote stream
        peer.on("stream", (remoteStream) => {
          // You can display the remote video using another video element
          if (remoteVideoRef.current)
            remoteVideoRef.current.srcObject = remoteStream;
          console.log("Remote stream received");
          setIsConnected(true);
          setIsLoading(false);
          setIsWaiting(false);
        });
      });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      {isWaiting && (
        <>
          <h1>MediVend Health Station</h1>
          <Button onClick={startCall}>
            <Video /> Start Video Call
          </Button>
        </>
      )}

      {isLoading && (
        <div className="flex items-center justify-center min-h-screen h-full w-full">
          <LoadingAnimation />
        </div>
      )}

      <div
        className={`flex justify-evenly ${isConnected ? "block" : "hidden"}`}
      >
        <VideoCallInterface
          localVideoRef={myVideoRef}
          remoteVideoRef={remoteVideoRef}
          patientName="Patient"
          onEndCall={() => {
            console.log("Call ended");
            setIsConnected(false);
          }}
          isDoctor={false}
        />
      </div>
    </div>
  );
}

export default VideoSection;
