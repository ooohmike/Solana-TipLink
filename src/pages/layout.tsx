import React, { useState } from "react";
import Appbar from "@/components/layouts/Appbar";
import { ToastContainer } from "react-toastify";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [publickey, setPublicKey] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState<Boolean>(false);
  return (
    <div>
      <Appbar
        publickey={publickey}
        isWalletConnected={isWalletConnected}
        setPublicKey={setPublicKey}
        setIsWalletConnected={setIsWalletConnected}
      />
      <div>
        {React.cloneElement(children as React.ReactElement<any>, {
          publickey: publickey,
          isWalletConnected: isWalletConnected,
        })}
      </div>
    </div>
  );
}
