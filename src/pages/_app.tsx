import "@/styles/globals.css";
import React, { useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  CloverWalletAdapter,
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { ToastContainer } from "react-toastify";
import { BackpackWalletAdapter } from "@solana/wallet-adapter-backpack";
import type { AppProps } from "next/app";
import RootLayout from "./layout";

require("@solana/wallet-adapter-react-ui/styles.css");

export default function App({ Component, pageProps }: AppProps) {
  const network = WalletAdapterNetwork.Mainnet;

  const endpoint = useMemo(
    () =>
      "https://mainnet.helius-rpc.com/?api-key=0cadae95-c4fd-4f06-b3e9-6dc5c07ea8d9",
    [network]
  );

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new CloverWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    [network]
  );

  return (
    <>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <RootLayout>
              <Component {...pageProps} />
            </RootLayout>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
      <ToastContainer
        newestOnTop={false}
        position="top-right"
        autoClose={4000}
        closeOnClick
        rtl={false}
        theme="dark"
      />
    </>
  );
}
