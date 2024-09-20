import React from "react";
import { MultiLinkProps } from "@/types";
import { toast } from "react-toastify";

interface MultiLinkTableProps {
  isLinkGenerated: Boolean;
  multiLink: MultiLinkProps[];
  isCheckedPay: Boolean;
  dispenserURL: string;
  sendToken: (multiLink: MultiLinkProps[]) => void;
}

export default function MultiLinkTable(props: MultiLinkTableProps) {
  const { isLinkGenerated, multiLink, isCheckedPay, sendToken, dispenserURL } =
    props;

  const handleClick = () => {
    navigator.clipboard
      .writeText(dispenserURL)
      .then(() => {
        toast.success("Copied URL!");
      })
      .catch((err) => {
        toast.error("Failed to copy URL!");
      });
  };

  return (
    <div className="mt-5 max-w-lg mx-auto">
      {isLinkGenerated && dispenserURL ? (
        <div>
          <div>{dispenserURL}</div>
          <div>
            <input
              type="button"
              value="copy"
              className="text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
              onClick={handleClick}
            />
          </div>
        </div>
      ) : (
        <div className="text-center"></div>
      )}
    </div>
  );
}
