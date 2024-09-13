"use client";

import { NextPage } from "next";
import { Connection, Keypair, Transaction } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import WalletContextProvider from "@/components/WalletContextProvide";
import Appbar from "@/components/layouts/Appbar";
import MultiLinkBox from "@/components/layouts/MultiLinkBox";
import MultiLinkButtonGroup from "@/components/layouts/MultiLinkButtonGroup";
import SolanaTokenModal from "@/components/SolanaTokenModal";
import MultiLinkTable from "@/components/MultiLinkTable";
import { getTokensWithBalance } from "@/lib/fetchSolanaTokensByAddress";
import { SolanaTokenProps, MultiLinkProps } from "@/types";
import { PublicKey } from "@solana/web3.js";
import { transfer } from "@/lib/sendToken";
import { useWallet } from "@solana/wallet-adapter-react";

const Home: NextPage = () => {
  const { publicKey, signTransaction } = useWallet();
  const [publickey, setPublicKey] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState<Boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<SolanaTokenProps | null>(
    null
  );
  const [solanaToken, setSolanaToken] = useState<SolanaTokenProps | null>(null);
  const [tokens, setTokens] = useState<SolanaTokenProps[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [countClaim, setCountClaim] = useState(2);
  const [isLinkGenerated, setIsLinkGenerated] = useState<Boolean>(false);
  const [multiLink, setMultiLink] = useState<MultiLinkProps[]>([]);
  const [isCheckedPay, setIsCheckedPay] = useState<Boolean>(false);

  const fetchTokens = async () => {
    if (publickey) {
      setIsLoading(true);
      const fetchedTokens = await getTokensWithBalance(publickey, "all_tokens");
      const solana_balance = await getTokensWithBalance(publickey, "balance");
      setIsLoading(false);
      return {
        tokens: fetchedTokens,
        solana: solana_balance,
      };
    }
  };

  const sendToken = () => {
    // let address = "";

    let address = multiLink[0]?.address.split("#")[1];

    console.log("address", address);
    let targetToken = "";
    fetch(`http://localhost:3001/tiplink/fromLink?link=${address}`).then(
      (res) => {
        res.json().then((res) => {
          console.log("res", res);
          const publicKeyObj = res.data.keypair._keypair.publicKey;

          // Convert the publicKey object to a Uint8Array (Array of bytes)
          const publicKeyArray = Uint8Array.from(Object.values(publicKeyObj));

          // Create a Solana PublicKey instance
          const publicKey = new PublicKey(publicKeyArray);

          // Convert to Base58 using the toBase58() method
          targetToken = publicKey.toBase58();
          console.log("targetToken", targetToken, publicKey);
          // const connection = new Connection(
          //   "https://mainnet.helius-rpc.com/?api-key=0cadae95-c4fd-4f06-b3e9-6dc5c07ea8d9",
          //   "confirmed"
          // );
          // const payer = Keypair.generate();
          // const wallet: Wallet = {
          //   publicKey: payer.publicKey,
          //   payer: payer,
          //   signTransaction: function (tx: Transaction): Promise<Transaction> {
          //     throw new Error("Function not implemented.");
          //   },
          //   signAllTransactions: function (
          //     txs: Transaction[]
          //   ): Promise<Transaction[]> {
          //     throw new Error("Function not implemented.");
          //   },
          // };
          // console.log("address", address);
          // if (selectedToken?.address && wallet && connection) {
          //   console.log("ff", selectedToken.address, multiLink[0].balance);
          //   transfer(
          //     selectedToken.address,
          //     { publicKey, signTransaction } as any,
          //     targetToken,
          //     connection,
          //     multiLink[0].balance
          //   )
          //     .then(() => {
          //       console.log("Transaction successful!");
          //     })
          //     .catch((error) => {
          //       console.log("Transaction failed:", error);
          //     });
          // } else {
          //   console.error("Selected token or token address is undefined.");
          // }
        });
      }
    );
  };

  useEffect(() => {
    if (isWalletConnected) {
      fetchTokens().then((res) => {
        setTokens(res?.tokens);
        setSolanaToken(res?.solana);
        setSelectedToken(res?.solana);
        setPayAmount(res?.solana.balance);
      });
    } else {
      setTokens([]);
      setSolanaToken(null);
      setSelectedToken(null);
    }
  }, [isWalletConnected, publickey]);

  return (
    <div>
      <WalletContextProvider>
        <Appbar
          setPublicKey={setPublicKey}
          setIsWalletConnected={setIsWalletConnected}
        />
        <MultiLinkBox
          paymentAmount={payAmount}
          setPaymentAmount={setPayAmount}
          selectedToken={selectedToken}
          setModalIsOpen={setModalIsOpen}
          isLoading={isLoading}
          publickey={publickey}
          isWalletConnected={isWalletConnected}
        />
        <MultiLinkButtonGroup
          countClaim={countClaim}
          setCountClaim={setCountClaim}
          isWalletConnected={isWalletConnected}
          selectedToken={selectedToken}
          payAmount={payAmount}
          multiLink={multiLink}
          setMultiLink={setMultiLink}
          setIsLinkGenerated={setIsLinkGenerated}
        />
      </WalletContextProvider>
      <SolanaTokenModal
        isOpen={modalIsOpen}
        tokens={solanaToken ? [...tokens, solanaToken] : tokens}
        setModalIsOpen={setModalIsOpen}
        setPaymentAmount={setPayAmount}
        setSelectedToken={setSelectedToken}
      />
      <MultiLinkTable
        isLinkGenerated={isLinkGenerated}
        multiLink={multiLink}
        isCheckedPay={isCheckedPay}
        sendToken={sendToken}
      />
    </div>
  );
};

export default Home;
