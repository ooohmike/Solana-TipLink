"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import WalletMultiButton from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

interface AppBarProps {
  setPublicKey: (e: string | null) => void;
  setIsWalletConnected: (e: Boolean) => void;
}

export default function Appbar(props: AppBarProps) {
  const { setPublicKey, setIsWalletConnected } = props;
  const { publicKey, connected, disconnect } = useWallet();

  const WalletMultiButtonDynamic = dynamic(
    async () =>
      (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
  );

  useEffect(() => {
    if (connected) {
      console.log("publicKey", publicKey);
      setPublicKey(publicKey ? publicKey.toBase58() : null);
      setIsWalletConnected(true);
    } else {
      setPublicKey(null);
      setIsWalletConnected(false);
    }
  }, [connected, publicKey, setIsWalletConnected, setPublicKey]);

  useEffect(() => {
    const handleDisconnect = async () => {
      try {
        if (disconnect) {
          await disconnect();
        }
      } catch (error) {
        console.error("Error during wallet disconnection", error);
      }
    };

    window.addEventListener("beforeunload", handleDisconnect);
    return () => window.removeEventListener("beforeunload", handleDisconnect);
  }, [disconnect]);

  return (
    <div className="flex justify-between w-[80%] mx-auto mt-3">
      <div className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-teal-500 text-5xl font-black">
        Solana Multilink
      </div>
      <div className="flex justify-items-end gap-2">
        <WalletMultiButtonDynamic />
      </div>
    </div>
  );
}
