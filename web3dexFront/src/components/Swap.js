import React, {useState, useEffect} from 'react'
import tokenList from "../tokenList.json"
import GasTracker from './GasTracker'
import axios from "axios"
import { useSendTransaction, useWaitForTransaction} from "wagmi"
import {Input, Popover, Radio, Modal, message} from "antd"
import {
  ArrowDownOutlined, 
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons"


function Swap(props) {
  const { address, is_connected } = props;
  const [message_api, context_holder] = message.useMessage();
  const [slippage, set_slippage] =useState(0.5);
  const [token_one_amount, set_token_one_amount] =useState (null);
  const [token_two_amount, set_token_two_amount] =useState (null);
  const [token_one, set_token_one] = useState(tokenList[0]);
  const [token_two, set_token_two] = useState(tokenList[1]);
  const [is_open, set_is_open] = useState(false);
  const [change_token, set_change_token] = useState(1);
  const [prices, set_prices] = useState(null);
  const [tx_details, set_tx_details] = useState({
    to: null,
    data: null,
    value: null,
  });

  const {data, sendTransaction} = useSendTransaction({
    request: {
      from: address,
      to: String(tx_details.to),
      data: String(tx_details.data),
      value: String(tx_details.value),
    }
  })

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })


  function handleSlippageChange(e) {
    set_slippage(e.target.value);
  }


  function changeAmount(e) {
    set_token_one_amount(e.target.value);
    if(e.target.value && prices) {
      set_token_two_amount((e.target.value * prices.ratio).toFixed(5))
    } else {
      set_token_two_amount(null);
    }
  }

  function switchTokens() {
    set_prices(null);
    set_token_one_amount(null);
    set_token_two_amount(null);
    const one = token_one;
    const two = token_two;
    set_token_one(two);
    set_token_two(one);
    fetchPrices(two.address, one.address);
  }

  function openModal(asset) {
    set_change_token(asset);
    set_is_open(true);
  }

  function modifyToken(i) {

    set_prices(null);
    set_token_one_amount(null);
    set_token_two_amount(null);

    if (change_token === 1) {
      set_token_one (tokenList[i]);
      fetchPrices(tokenList[i].address, token_two.address)
    } else {
      set_token_two(tokenList[i]);
      fetchPrices(token_one.address, tokenList[i].address)
    }
    set_is_open(false);
  }

  async function fetchPrices(one, two) {

    const res = await axios.get('http://localhost:3001/tokenPrice', {
      params: {addressOne: one, addressTwo: two}
    })
    
    set_prices(res.data)
  }

  async function fetchDexSwap() {
     const allowance = await axios.get(`https://api.1inch.io/v5.0/1/approve/allowance?tokenAddress=${token_one.address}&walletAddress=${address}`)
    
    if(allowance.data.allowance === "0") {

      const approve = await axios.get(`https://api.1inch.io/v5.0/1/approve/transaction?tokenAddress=${token_one.address}`)

      set_tx_details(approve.data);
      console.log("not approved")
      return
    }

    const tx = await axios.get(
      `https://api.1inch.io/v5.0/1/swap?fromTokenAddress=${token_one.address}&toTokenAddress=${token_two.address}&amount=${token_one_amount.padEnd(token_one.decimals+token_one_amount.length, '0')}&fromAddress=${address}&slippage=${slippage}`
    )

      let decimals = Number(`1E${token_two.decimals}`)
      set_token_two_amount((Number(tx.data.toTokenAmount)/decimals).toFixed(5));

      set_tx_details(tx.data.tx);
      
    }

  useEffect(()=>{

    fetchPrices(tokenList[0].address, tokenList[1].address)

  }, [])


  useEffect (()=>{

    if(tx_details.to && is_connected){
      sendTransaction();
    }
  }, [tx_details])

  useEffect (()=>{

    message_api.destroy();

    if(isLoading){
      message_api.open({
        type:'loading',
        content: 'Transaction is Pending...',
        duration: 0,
      })
    }

  },[isLoading])


  useEffect (()=>{

    message_api.destroy();

    if(isSuccess){
      message_api.open({
        type:'success',
        content: 'Transaction Successful',
        duration: 1.5,
      })
    }else if(tx_details.to){
      message_api.open({
        type:'error',
        content: 'Transaction Failed',
        duration: 1.5,
      })
    }

  }, [isSuccess])


  const settings = (
    <>
      <div>Slippage tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>


    </>
  );

  return (
    <>
    {context_holder}
    <Modal
      open={is_open}
      footer={null}
      onCancel={() => set_is_open(false)}
      title="Select a token"
    > 
      <div className='modal_content'>
        {tokenList?.map((e,i)=>{
          return (
            <div
              className='token_choise'
              key={i}
              onClick={() => modifyToken(i)} 
            >
            <img src={e.img} alt={e.ticker} className='token_logo'/>
            <div className='token_choise_names'>
                <div className='token_name'>{e.name}</div>
                <div className='token_ticker'>{e.ticker}</div>
            </div>
        </div>
          );
        })}
      </div>
    </Modal>
    <div className='swap_box'>
      <div className='swap_box_header'>
        <h4 className='swap_box_header_text'>Exchange tokens</h4>
        <Popover 
          content = {settings}
          title="Settings"
          trigger='click'
          placement='bottomRight'
          >
          <SettingOutlined className='cog' /> 
        </Popover>
      </div>
      <div className='inputs'>
        <Input 
        placeholder='0' 
        value={token_one_amount} 
        onChange={changeAmount}
        disabled={!prices} 
        />
        <Input placeholder='0' value={token_two_amount} disabled={true} />
        <div className='switch_button' onClick={switchTokens}>
          <ArrowDownOutlined className='switch_arrow'/>
        </div>
        <div className='asset_one' onClick={() => openModal(1)}>
          <img src={token_one.img} alt='asset_one_logo' className='asset_logo'/>
          {token_one.ticker}
          <DownOutlined />
        </div>
        <div className='asset_two' onClick={() => openModal(2)}>
        <img src={token_two.img} alt='asset_two_logo' className='asset_logo'/>
          {token_two.ticker}
          <DownOutlined />
        </div>
      </div>
      <div className='swap_button' disabled={!token_one_amount || !is_connected} onClick={fetchDexSwap}>Swap</div>
      <GasTracker></GasTracker>
    </div>
    </>
  )
}

export default Swap