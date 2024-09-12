"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SolanaTokenProps } from "@/types";
import MoonLoader from "react-spinners/MoonLoader";

interface MultiLinkBoxProps {
  paymentAmount: number;
  selectedToken: SolanaTokenProps | null;
  setPaymentAmount: (e: number) => void;
  setModalIsOpen: (isOpen: boolean) => void;
  isLoading: Boolean;
  publickey: string | null;
  isWalletConnected: Boolean;
}

export default function MultiLinkBox(props: MultiLinkBoxProps) {
  const [inputValue, setInputValue] = useState<number>(0);
  const handleClick = () => {
    if (!props.isWalletConnected) {
      toast.error("Please connect wallet!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }
    props.setModalIsOpen(true);
  };

  useEffect(() => {
    if (props.isWalletConnected && props.selectedToken) {
      setInputValue(props.selectedToken.balance);
    } else {
      setInputValue(0);
    }
  }, [props.isWalletConnected, props.selectedToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setInputValue(value);
    props.setPaymentAmount(value);
  };

  return (
    <div className="relative mx-auto mt-20 max-w-md rounded-lg bg-gradient-to-tr from-pink-300 to-blue-300 p-0.5 shadow-lg">
      <h1 className="font-bold text-xs mb-2 text-black">You are sending</h1>
      <div className="h-24">
        <div className="m-auto">
          <input
            inputMode="decimal"
            placeholder="Number of times link can be claimed"
            min="0"
            pattern="^\d*([.,]\d*)?$"
            type="number"
            className="text-6xl font-bold text-center border-none bg-inherit focus:border-0 focus:outline-none w-full"
            value={inputValue}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div
        className="w-full border-t-2 min-h-16 flex justify-center cursor-pointer"
        onClick={handleClick}
      >
        {props.isWalletConnected ? (
          !props.isLoading ? (
            <div className="flex gap-2 justify-center mt-2 cursor-pointer">
              <img
                src={props.selectedToken?.info.image || ""}
                alt={props.selectedToken?.info.name || "Token"}
                width={50}
                height={50}
              />
              <div className="flex flex-col gap-1">
                <p className="text-black">
                  {props.selectedToken?.info.name || "Token Name"}
                </p>
                <p className="text-black">
                  {props.selectedToken?.info.symbol || "Token Symbol"}
                </p>
              </div>
            </div>
          ) : (
            <MoonLoader />
          )
        ) : (
          <div className="flex items-center text-red-800 text-lg">
            Please connect your wallet
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
