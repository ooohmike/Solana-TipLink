"use client";

import { NextPage } from "next";
import React, { useState, useEffect } from "react";
import Appbar from "@/components/layouts/Appbar";
import MultiLinkBox from "@/components/layouts/MultiLinkBox";
import MultiLinkButtonGroup from "@/components/layouts/MultiLinkButtonGroup";
import SolanaTokenModal from "@/components/SolanaTokenModal";
import MultiLinkTable from "@/components/MultiLinkTable";
import { getTokensWithBalance } from "@/lib/fetchSolanaTokensByAddress";
import { SolanaTokenProps, MultiLinkProps } from "@/types";
import { PublicKey } from "@solana/web3.js";
import { transfer } from "@/lib/sendToken";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

const Home: NextPage = () => {
  const { publicKey :pubKey, sendTransaction, signTransaction } = useWallet();
  const { connection } = useConnection();
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

  const sendToken = async () => {
    // let address = "";
    let targetToken = "";
    const multiLinks = [];
    for (const link of multiLink) {
      const response = await fetch(`http://localhost:3001/tiplink/fromLink?link=${link.address}`);
      const res = await response.json();
      const publicKeyObj = res.data.keypair._keypair.publicKey;
      const publicKeyArray = Uint8Array.from(Object.values(publicKeyObj));
      const publicKey = new PublicKey(publicKeyArray);
      targetToken = publicKey.toBase58();
      multiLinks.push({
        address: targetToken,
        amount: link.balance
      });
    }

    if (selectedToken?.address && connection) {
      console.log("ff", selectedToken.address, multiLink[0].balance);
      transfer(
        selectedToken.address,
        { publicKey: pubKey, sendTransaction, signTransaction } as any,
        connection,
        multiLinks
      )
      .then(() => {
        console.log("Transaction successful!");
      })
      .catch((error) => {
        console.log("Transaction failed:", error);
      });
    } else {
      console.error("Selected token or token address is undefined.");
    }
  }

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
