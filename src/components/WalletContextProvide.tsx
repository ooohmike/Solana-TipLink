"use client";

import { FC, ReactNode, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import * as web3 from "@solana/web3.js";
import * as walletAdapterWallets from "@solana/wallet-adapter-wallets";
require("@solana/wallet-adapter-react-ui/styles.css");

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const endpoint = web3.clusterApiUrl("mainnet-beta");
  const wallets = [new walletAdapterWallets.PhantomWalletAdapter()];

  useEffect(() => {
    if (connected) {
      console.log("Wallet connected:", publicKey?.toBase58());
    } else {
      console.log("Wallet disconnected");
    }
  }, [connected, publicKey]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
