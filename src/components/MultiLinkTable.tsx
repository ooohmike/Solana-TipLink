import React from "react";
import { MultiLinkProps } from "@/types";

interface MultiLinkTableProps {
  isLinkGenerated: Boolean;
  multiLink: MultiLinkProps[];
  isCheckedPay: Boolean;
  sendToken: (multiLink: MultiLinkProps[]) => void;
}

export default function MultiLinkTable(props: MultiLinkTableProps) {
  const { isLinkGenerated, multiLink, isCheckedPay, sendToken } = props;

  return (
    <div className="mt-5 max-w-md mx-auto">
      {props.isLinkGenerated ? (
        <>
          <table className="min-w-full relative">
            <caption className="caption-top text-lg font-semibold mb-2">
              MultiLinks
            </caption>
            <thead>
              <tr>
                <th className="border px-4 py-2">Address</th>
                <th className="border px-4 py-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              {multiLink.length > 0 ? (
                multiLink.map((link, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{link.address}</td>
                    <td className="border px-4 py-2">{link.balance}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="border px-4 py-2 text-center">
                    No links available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      ) : (
        <div className="text-center"></div>
      )}
    </div>
  );
}
