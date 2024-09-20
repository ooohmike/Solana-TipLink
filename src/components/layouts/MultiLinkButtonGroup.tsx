"use client";

import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SolanaTokenProps, MultiLinkProps } from "@/types";
import { ClipLoader } from "react-spinners";

interface MultiLinkButtonGroupProps {
  countClaim: number;
  setCountClaim: (e: number) => void;
  isWalletConnected: boolean;
  selectedToken: SolanaTokenProps | null;
  payAmount: number;
  multiLink: MultiLinkProps[];
  setMultiLink: (e: MultiLinkProps[]) => void;
  setIsLinkGenerated: (e: boolean) => void;
  sendToken: (multiLink: MultiLinkProps[]) => void;
  isClaimCreating: Boolean;
  isRandomize: Boolean;
  setDispenserURL: (e: string) => void;
}

const showToastError = (message: string) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  });
};

function generateRandomValues(amount: number, count: number): number[] {
  const generateRandom = (max: number): number =>
    parseFloat((Math.random() * max).toFixed(10));
  let parts: number[] = [];
  let total = 0;

  for (let i = 0; i < count - 1; i++) {
    const remaining = amount - total;
    const part = generateRandom(remaining);
    parts.push(part);
    total += part;
  }

  parts.push(parseFloat((amount - total).toFixed(10)));

  return parts;
}

export default function MultiLinkButtonGroup({
  countClaim,
  isWalletConnected,
  selectedToken,
  payAmount,
  isRandomize,
  isClaimCreating,
  setCountClaim,
  setMultiLink,
  setIsLinkGenerated,
  sendToken,
  setDispenserURL,
}: MultiLinkButtonGroupProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateMultiLinks = async (): Promise<MultiLinkProps[]> => {
    if (countClaim <= 0 || payAmount <= 0) {
      showToastError(
        countClaim <= 0
          ? "Count must be greater than 0"
          : "Amount must be greater than 0"
      );
      return [];
    }

    if (payAmount < countClaim * 1e-10) {
      showToastError("Amount is too small for the given count");
      return [];
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_TIPLINK_API_KEY;
      const urlPromises = Array.from({ length: countClaim }, () =>
        fetch("http://localhost:3001/tiplink/create").then((res) => res.json())
      );

      const urlResponses = await Promise.all(urlPromises);
      const tipLinks = urlResponses
        .filter((response) => response.message === "TipLink created")
        .map((response) => response.data);

      if (!tipLinks.length) {
        showToastError("Failed to create TipLinks");
        return [];
      }

      const dispenserRes = await fetch(
        "http://localhost:3001/tiplink/client/create/dispenserURL",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apikey: apiKey, version: 1, tipLinks }),
        }
      ).then((res) => res.json());

      if (dispenserRes.message === "success") {
        setDispenserURL(dispenserRes.data);
      }

      const balances = isRandomize
        ? generateRandomValues(payAmount, countClaim)
        : Array(countClaim).fill(payAmount / countClaim);

      return tipLinks.map((link, i) => ({
        address: link.url,
        balance: balances[i],
        status: false,
      }));
    } catch (error) {
      showToastError("Error creating multi links");
      console.error("Error:", error);
      return [];
    }
  };

  const handleClick = async () => {
    if (!isWalletConnected) {
      showToastError("Please connect wallet!");
      return;
    }

    const selectedBalance = selectedToken?.balance ?? 0;
    const requiredBalance = isRandomize ? payAmount * countClaim : payAmount;

    if (requiredBalance > selectedBalance) {
      showToastError("Payment balance exceeds wallet balance!");
      return;
    }

    setIsLoading(true);

    try {
      const result = await generateMultiLinks();
      if (result.length > 0) {
        setMultiLink(result);
        setIsLinkGenerated(true);
        sendToken(result);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-5 grid grid-cols-2 gap-5 max-w-md mx-auto">
      <div className="w-full flex justify-center border-4 border-[#cbd5e0] p-2 rounded-3xl bg-inherit h-[71px]">
        <input
          inputMode="decimal"
          placeholder="Number of claims"
          min="0"
          className="bg-inherit focus:border-0 focus:outline-none min-w-4 max-w-10"
          type="tel"
          value={countClaim}
          onChange={(e) => setCountClaim(parseFloat(e.target.value))}
        />
        <p className="my-auto">Claims</p>
      </div>
      <div>
        <button
          className="w-full h-full p-2 rounded-3xl bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-400 flex items-center justify-center gap-4 h-[71px]"
          onClick={handleClick}
          disabled={isLoading}
        >
          {isClaimCreating && <ClipLoader size={20} color="#fff" />}
          <p className="text-base font-bold text-black">Create Link</p>
        </button>
      </div>
    </div>
  );
}
