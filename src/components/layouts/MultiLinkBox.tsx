"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SolanaTokenProps, SolanaToken } from "@/types";
import MoonLoader from "react-spinners/MoonLoader";
import ToggleSwitch from "../ToogleSwitch";
import mark from "/public/randomize_mark.svg";
import swap from "/public/swap.svg";
import arrowDown from "/public/arrow-down.svg";

interface MultiLinkBoxProps {
  paymentAmount: number;
  selectedToken: SolanaTokenProps | null;
  setPaymentAmount: (e: number) => void;
  setModalIsOpen: (isOpen: boolean) => void;
  isLoading: Boolean;
  publickey: string | null;
  isWalletConnected: Boolean;
  solanaTokenList: SolanaToken[] | null;
  setIsRandomize: (selected: Boolean) => void;
  isRandomize: Boolean;
}

export default function MultiLinkBox({
  paymentAmount,
  selectedToken,
  setPaymentAmount,
  setModalIsOpen,
  isLoading,
  publickey,
  isWalletConnected,
  solanaTokenList,
  setIsRandomize,
  isRandomize,
}: MultiLinkBoxProps) {
  const [inputValue, setInputValue] = useState<number>(0);

  const handleSelectToken = () => {
    if (!isWalletConnected) {
      toast.error("Please connect Wallets!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        theme: "dark",
      });
    } else {
      setModalIsOpen(true);
    }
  };

  // Set up the input value whenever the connected wallet or selected token changes
  useEffect(() => {
    if (isWalletConnected && selectedToken) {
      setInputValue(selectedToken.balance);
    } else {
      setInputValue(0);
    }
  }, [isWalletConnected, selectedToken]);

  // Handle changes in the payment input field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const numericValue = !isNaN(value) ? value : 0;
    setInputValue(numericValue);
    setPaymentAmount(numericValue);
  };

  // Determine the token name and symbol based on wallet connection and loading status
  const getTokenInfo = useCallback(() => {
    if (isWalletConnected && selectedToken) {
      return {
        name: selectedToken?.info.name,
        symbol: selectedToken?.info.symbol,
        image: selectedToken?.info.image || "",
      };
    } else if (solanaTokenList && solanaTokenList[0]) {
      const firstToken = solanaTokenList[0];
      return {
        name: firstToken.name,
        symbol: firstToken.symbol,
        image: firstToken.logoURI || "",
      };
    }
    return { name: "No Token", symbol: "No Symbol", image: "" };
  }, [isWalletConnected, selectedToken, solanaTokenList]);

  const { name, symbol, image } = getTokenInfo();

  return (
    <div className="mx-auto flex items-center justify-center rounded-[44px] mt-24 mb-10">
      <div className="h-[315px] w-[460px] bg-gradient-to-r from-yellow-400 via-pink-300 via-cyan-300 to-purple-500 p-1 rounded-[44px]">
        <div className="h-full w-full bg-[#131313] rounded-[44px] flex flex-col">
          {/* Header */}
          <div className="flex justify-between p-4 h-5 m-5 items-center">
            <h1 className="font-bold text-xs text-white">You are sending</h1>
            <div className="flex gap-2 items-center">
              <Image
                src={mark}
                alt="mark"
                width={10}
                height={20}
                className="mt-2"
              />
              <ToggleSwitch
                label="Randomize"
                setIsRandomize={setIsRandomize}
                isRandomize={isRandomize}
              />
            </div>
          </div>

          {/* Input & Value Display */}
          <div className="flex items-center justify-center flex-col mt-6 mb-10">
            <input
              placeholder="Number of times link can be claimed"
              min="0"
              type="number"
              className="text-6xl font-bold text-center bg-inherit focus:border-0 focus:outline-none w-full noArrows"
              value={inputValue}
              onChange={handleInputChange}
            />
            <div className="flex gap-1 m-auto text-xs uppercase">
              <span>
                {selectedToken?.balance ?? 0}{" "}
                {selectedToken?.info.name ?? "SOL"}
              </span>
              <Image src={swap} width={20} height={20} alt="swap" />
            </div>
          </div>

          {/* Token Selection / Modal Trigger */}
          <div
            className="border-t-2 border-gradient items-center px-10 py-2"
            onClick={handleSelectToken}
          >
            {isLoading ? (
              <div className="flex items-center justify-center w-full mt-2">
                <MoonLoader color="#fff" size={30} />
              </div>
            ) : (
              <div className="flex items-center justify-between cursor-pointer">
                <div className="flex gap-2 items-center">
                  <Image src={image} alt="token-image" width={40} height={30} />
                  <div className="flex flex-col">
                    <span className="font-bold">{name}</span>
                    <span className="font-light">{symbol}</span>
                  </div>
                </div>
                <Image
                  src={arrowDown}
                  alt="arrow-down"
                  width={10}
                  height={10}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
