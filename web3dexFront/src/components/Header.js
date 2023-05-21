import React from 'react'
import Eth from "../eth.svg"
import { Link } from 'react-router-dom'

function Header(props) {

  const {address, isConnected, connect} = props;

  return (
    <header>
      <div className='left_header'>
      <img src={require('../img/pepe.png')} alt="logo" className='logo' style={{ transform: 'scale(1.75)' }}/>
      </div>
      <div className='mid_header'>
      <Link to="/" className='link'>
        <div className='header_item'>Swap</div>
      </Link>
      <Link to="/tokens" className='link'>
      <div className='header_item'>Tokens</div>
      </Link>   
      </div>
      <div className='right_header'>
        <div className='header_item'>
        <img src={Eth} alt="eth" className='eth'/>
          Ethereum
        </div>
        <div className='connect_button' onClick={connect}>
          {isConnected ? (address.slice(0,4) +'...' + address.slice(38)) : 'Connect'}
        </div>
      </div>
    </header>
  )
}

export default Header