import { motion } from "framer-motion";

export default function LoadingAnimation() {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="w-16 h-16 border-4 border-blue-500 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
          borderRadius: ["50%", "25%", "50%"],
        }}
        transition={{
          duration: "1",
          ease: "easeInOut",
          times: [0, 0.5, 1],
          repeat: Infinity,
        }}
      />
      <p className="ml-4 text-xl font-semibold">Connecting...</p>
    </div>
  );
}
