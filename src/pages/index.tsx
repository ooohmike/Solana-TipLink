"use client";

import { NextPage } from "next";
import React, { useState, useEffect } from "react";
import MultiLinkBox from "@/components/layouts/MultiLinkBox";
import MultiLinkButtonGroup from "@/components/layouts/MultiLinkButtonGroup";
import SolanaTokenModal from "@/components/SolanaTokenModal";
import MultiLinkTable from "@/components/MultiLinkTable";
import { getTokensWithBalance } from "@/lib/fetchSolanaTokensByAddress";
import { SolanaTokenProps, MultiLinkProps, SolanaToken } from "@/types";
import { PublicKey } from "@solana/web3.js";
import { transfer } from "@/lib/sendToken";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import { fetchSolanaTokenList } from "@/lib/fetchSolanaToken";
import MoonLoader from "react-spinners/MoonLoader";

const Home: NextPage = (props: any) => {
  const { publickey, isWalletConnected } = props;
  const { publicKey: pubKey, sendTransaction, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [solanaTokenList, setSolanaTokenList] = useState<SolanaToken[] | null>(
    []
  );
  const [solanaToken, setSolanaToken] = useState<SolanaTokenProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<SolanaTokenProps[]>([]);
  const [isRandomize, setIsRandomize] = useState<Boolean>(false);
  const [selectedToken, setSelectedToken] = useState<SolanaTokenProps | null>(
    null
  );
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [countClaim, setCountClaim] = useState(2);
  const [isLinkGenerated, setIsLinkGenerated] = useState<Boolean>(false);
  const [multiLink, setMultiLink] = useState<MultiLinkProps[]>([]);
  const [isClaimCreating, setIsClaimCreating] = useState(false);
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

  const sendToken = async (multiLink: MultiLinkProps[]) => {
    setIsCheckedPay(false);
    setIsClaimCreating(true);
    let targetToken = "";
    const multiLinks = [];
    for (const link of multiLink) {
      const response = await fetch(
        `https://tiplink-api-production.up.railway.app/tiplink/fromLink?link=${
          link.address.split("#")[1]
        }`
      );
      const res = await response.json();
      const publicKeyObj = res.data.keypair._keypair.publicKey;
      const publicKeyArray = Uint8Array.from(Object.values(publicKeyObj));
      const publicKey = new PublicKey(publicKeyArray);
      targetToken = publicKey.toBase58();
      multiLinks.push({
        address: targetToken,
        amount: link.balance,
      });
    }

    if (selectedToken?.address && connection) {
      transfer(
        selectedToken.address,
        { publicKey: pubKey, sendTransaction, signTransaction } as any,
        connection,
        multiLinks
      )
        .then(() => {
          setIsCheckedPay(true);
          setIsClaimCreating(false);
          toast.success("Transaction successful!");
        })
        .catch((error) => {
          setIsCheckedPay(false);
          setIsClaimCreating(false);
          toast.error("Transaction Failed!");
          console.log("Transaction Error:", error);
        });
    } else {
      console.error("Selected token or token address is undefined.");
    }
  };

  useEffect(() => {
    if (isWalletConnected) {
      fetchTokens().then((res) => {
        setTokens(res?.tokens);
        setSolanaToken(res?.solana);
        setSelectedToken(res?.solana);
        if (res?.solana) {
          setPayAmount(res.solana.balance);
        } else {
          setPayAmount(0);
        }
      });
    } else {
      setTokens([]);
      setSolanaToken(null);
      setSelectedToken(null);
    }
  }, [isWalletConnected, publickey]);

  useEffect(() => {
    setIsLoading(true);
    fetchSolanaTokenList().then((res) => {
      setSolanaTokenList(res);
      setIsLoading(false);
    });
  }, []);

  return (
    <div>
      <MultiLinkBox
        paymentAmount={payAmount}
        setPaymentAmount={setPayAmount}
        selectedToken={selectedToken}
        setModalIsOpen={setModalIsOpen}
        isLoading={isLoading}
        publickey={publickey}
        isWalletConnected={isWalletConnected}
        solanaTokenList={solanaTokenList}
        setIsRandomize={setIsRandomize}
        isRandomize={isRandomize}
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
        sendToken={sendToken}
        isClaimCreating={isClaimCreating}
        isRandomize={isRandomize}
      />
      <SolanaTokenModal
        isOpen={modalIsOpen}
        tokens={solanaToken ? [...tokens, solanaToken] : tokens}
        setModalIsOpen={setModalIsOpen}
        setPaymentAmount={setPayAmount}
        setSelectedToken={setSelectedToken}
        selectedToken={selectedToken}
      />
      {isCheckedPay && (
        <MultiLinkTable
          isLinkGenerated={isLinkGenerated}
          multiLink={multiLink}
          isCheckedPay={isCheckedPay}
          sendToken={sendToken}
        />
      )}
    </div>
  );
};

export default Home;
