"use client";

import React, { useEffect } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import logo from "/public/logo.svg";

interface AppBarProps {
  publickey: string | null;
  isWalletConnected: Boolean;
  setPublicKey: (e: string | null) => void;
  setIsWalletConnected: (e: Boolean) => void;
}

export default function Appbar(props: AppBarProps) {
  const { setPublicKey, setIsWalletConnected } = props;
  const { publicKey, connected, disconnect } = useWallet();

  useEffect(() => {
    if (connected) {
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
      <Image src={logo} alt="logo" width={180} height={32} />
      <div className="flex justify-items-end gap-2 bg-gradient-to-r from-yellow-400 via-pink-300 via-cyan-300 to-purple-500 rounded-[10px]">
        <WalletMultiButton style={{}} />
      </div>
    </div>
  );
}
