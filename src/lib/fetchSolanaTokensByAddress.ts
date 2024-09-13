import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';


export async function getTokensWithBalance(address: string, token_type:string) {
  const xAPIKey = process.env.NEXT_PUBLIC_SHYFT_API_KEY;
  let reqUrl:string="";
    reqUrl = `https://api.shyft.to/sol/v1/wallet/${token_type}?network=mainnet-beta&wallet=${address}`;
 
  try {
    const response = await axios({
      url: reqUrl,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": xAPIKey,
      },
    });

    let return_value;
    if(token_type == "all_tokens"){
      return_value = response.data.result;
    }else{
      return_value = {
        address: "So11111111111111111111111111111111111111112",
        balance: response.data.result.balance,
        info:{
          image: "https://api.phantom.app/image-proxy/?image=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fsolana-labs%2Ftoken-list%40main%2Fassets%2Fmainnet%2FSo11111111111111111111111111111111111111112%2Flogo.png",
          name: "Solana",
          symbol:"Sol"
        }
      }
    }
    
    return return_value; // Return the data from the response
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return null; // Return null or an empty array depending on what makes sense for your application
  } 
}
