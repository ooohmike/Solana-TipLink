"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
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

export default function MultiLinkBox(props: MultiLinkBoxProps) {
  const [inputValue, setInputValue] = useState<number>(0);

  const handleSelectToken = () => {
    if (!props.isWalletConnected) {
      toast.error("Please connect Wallets!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        theme: "dark",
      });
      return;
    } else {
      props.setModalIsOpen(true);
    }
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

    // Convert the input value to a number if not empty
    const numericValue = value === 0 ? 0 : value;

    // Handle the case where the input is empty
    if (value === 0) {
      setInputValue(0);
      props.setPaymentAmount(0); // Or any default value you prefer
    } else if (!isNaN(numericValue)) {
      setInputValue(numericValue);
      props.setPaymentAmount(numericValue);
    }
  };

  return (
    <div>
      <div className="mx-auto flex items-center justify-center rounded-[44px] mt-24 mb-10">
        <div className="h-[315px] w-[460px] bg-gradient-to-r from-yellow-400 via-pink-300 via-cyan-300 to-purple-500 p-1 rounded-[44px]">
          <div className="h-full w-full bg-[#131313] rounded-[44px] flex flex-col">
            <div className="flex justify-between p-4 h-5 m-5 items-center">
              <h1 className="font-bold text-xs text-white">You are sending</h1>
              <div className="flex gap-1 items-center">
                <Image
                  src={mark}
                  alt="mark"
                  width={10}
                  height={20}
                  className="mt-2"
                />
                <ToggleSwitch
                  label="Ramdomize"
                  setIsRandomize={props.setIsRandomize}
                  isRandomize={props.isRandomize}
                />
              </div>
            </div>
            <div className="flex itmes-center justify-center gap-2 text-[90px] w-full flex-col mt-6 mb-6">
              <input
                placeholder="Number of times link can be claimed"
                min="0"
                type="number"
                className="text-6xl font-bold text-center border-none bg-inherit focus:border-0 focus:outline-none w-full text-[70px] noArrows"
                value={inputValue}
                onChange={handleInputChange}
              />
              <div className="flex gap-1 m-auto">
                <div className="flex">
                  {!props.isWalletConnected ||
                  props.isLoading ||
                  !props.selectedToken ? (
                    <span className="text-xs uppercase">0 SOL</span>
                  ) : (
                    <span className="text-xs uppercase">
                      {props.selectedToken?.balance +
                        " " +
                        props.selectedToken?.info.name}
                    </span>
                  )}
                </div>
                <Image src={swap} width={20} height={20} alt="swap" />
              </div>
            </div>
            <div
              className="border-t-2 border-gradient items-center px-10 py-2"
              onClick={handleSelectToken}
            >
              {props.isLoading ? (
                <div className="flex items-center justify-center w-full mt-2">
                  <MoonLoader color="#fff" size={30} />
                </div>
              ) : (
                <div className="flex items-center justify-between cursor-pointer">
                  <div className="flex gap-2">
                    <div className="flex items-center">
                      <Image
                        src={
                          props.isWalletConnected
                            ? props.selectedToken?.info.image ?? ""
                            : props.solanaTokenList?.[0]?.logoURI ?? ""
                        }
                        alt="token-image"
                        width={40}
                        height={30}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold">
                        {props.isWalletConnected
                          ? props.selectedToken?.info.name
                          : props.solanaTokenList?.[0]?.name ?? "No Token"}{" "}
                      </span>

                      <span className="font-light">
                        {props.isWalletConnected
                          ? props.selectedToken?.info.symbol // Assuming the second span is for the symbol, not name again
                          : props.solanaTokenList?.[0]?.symbol ??
                            "No Symbol"}{" "}
                      </span>
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
    </div>
  );
}
