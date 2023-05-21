import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GasStationIcon from '../img/GasStationIcon.png';

const GasTracker = () => {
  const [gasPrice, setGasPrice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const getGasPrice = async () => {
      try {
        const response = await axios.post('https://mainnet.infura.io/v3/22c6179195d64774a8ae355b7e7eca2b', {
          jsonrpc: '2.0',
          method: 'eth_gasPrice',
          params: [],
          id: 1,
        });

        const gasPriceInWei = response.data.result;
        const gasPriceInGwei = gasPriceInWei / 1e9;
        setGasPrice(gasPriceInGwei);
      } catch (error) {
        setError('Error fetching gas price');
        console.log('Error fetching gas price:', error);
      }
    };

    getGasPrice();
  }, []);


  return (
    <div className='gas'>
      <img src={GasStationIcon} alt='Gas Station' className='gas_icon' />
      <h3 className='gas_header'>Gas Tracker: </h3>
      {error && <p>{error}</p>}
      {gasPrice && (
        <div>
          <p className='gas_info'> Current gas price: {gasPrice} Gwei</p>
        </div>
      )}
    </div>
  );
};

export default GasTracker;
