import React, { useEffect, useState } from "react";

const Tokens = () => {
  const [cryptoData, setCryptoData] = useState([]);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=chainlink,polygon,uniswap,curve-dao-token,maker,bitcoin,apecoin,usd-coin,shiba-inu,ethereum,binancecoin,cardano,ripple,litecoin,tezos,stellar,eos,vechain,dogecoin,tron,celsius,algorand&include_market_cap=true"
        );
        const data = await response.json();

        const updatedCryptoData = data.map((crypto) => {
          const token = crypto.id;
          const price = crypto.current_price || 0;
          const change24h = crypto.price_change_percentage_24h || 0;
          const marketCap = crypto.market_cap || 0;
          const iconUrl = crypto.image;
          return { token, price, change24h, marketCap, iconUrl };
        });

        setCryptoData(updatedCryptoData);
      } catch (error) {
        console.log("Error fetching crypto data:", error);
      }
    };

    fetchCryptoData();
  }, []);

  return (
    <div className="tokens_box">
      <div className="tokens_box_content">
        <div className="tokens_column tokens_column_logo">
          {cryptoData.map((crypto) => (
            <div className="token_entry" key={crypto.token}>
              <img
                src={crypto.iconUrl}
                alt={crypto.token}
                className="token_icon"
                style={{ width: "18px", height: "18px" }}
              />
            </div>
          ))}
        </div>
        <div className="tokens_column">
          <h4 className="tokens_column_header">Tokens</h4>
          {cryptoData.map((crypto) => (
            <div className="token_entry" key={crypto.token}>
              <p className="token_name">{crypto.token}</p>
            </div>
          ))}
        </div>
        <div className="tokens_column">
          <h4 className="tokens_column_header">Price</h4>
          {cryptoData.map((crypto) => (
            <div className="token_entry" key={crypto.token}>
              <p className="token_price">${crypto.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="tokens_column">
          <h4 className="tokens_column_header">24h Change</h4>
          {cryptoData.map((crypto) => (
            <div className="token_entry" key={crypto.token}>
              <p className="token_change">{crypto.change24h.toFixed(2)}%</p>
            </div>
          ))}
        </div>
        <div className="tokens_column">
          <h4 className="tokens_column_header">Market Cap</h4>
          {cryptoData.map((crypto) => (
            <div className="token_entry" key={crypto.token}>
              <p className="token_market_cap">${crypto.marketCap.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tokens;
