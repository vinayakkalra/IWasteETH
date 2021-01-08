import React from 'react';
// import logo from './logo.svg';
import './App.css';
import $ from "jquery";
import { Chart } from "react-google-charts";

// MetaMask data
// const getTxs = async (address) => {
//   address = window.ethereum.selectedAddress;
// };
var address = "";
window.addEventListener('load', async () => {          
  if (typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask) {
    // Ethereum user detected. You can now use the provider.
    
    const provider = window["ethereum"];
    await provider.enable();
    console.log('address', window.ethereum.selectedAddress);
    address = window.ethereum.selectedAddress;
    console.log(address);
    $(".screen1").css("display","block");
    $(".screen2").css("display","none");
    data(address)
  } else {
    $(".screen2").css("display","block");
  }
  
  async function data(address){
    // comma
    console.log(address);
    function comma(x) {
      var parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }
    //formatter 
    function formatter(num) {
      return num > 999999 ? (num/1e6).toFixed(3) + ' million' : num;
    }
    // multiply
    function multiply(x, y) {
      var prod = [];
      var i;
      for (i=0; i < x.length; i++) {
        prod[i] = x[i] * y[i];
      }
      return prod;
    }
    // 
    var ethusd = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd').then(response => {return response.json()}).catch(err => {
      console.log('(â•¯Â°â–¡Â°)â•¯ï¸µ â”»â”â”»', err);
    })
    ethusd = ethusd.ethereum.usd;
    console.log('ETHUSD: $' + ethusd);
    
    // key
    let key = "3FGUI5KS2E7W7CKP3MMRQJWX8DZD4E44GT"
    var u = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${key}`
    var response = await fetch(u)
    if (response.ok) { // if HTTP-status is 200-299
      var json = await response.json();
    } else {
      console.error("HTTP-Error: " + response.status);
    }

    var txs = json['result']
    var n = txs.length
    var from, txs2
    while (n===10000) {
      from = txs[txs.length - 1].blockNumber
      u = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=${from}&endblock=99999999&sort=asc&apikey=${key}`
      response = await fetch(u)
      if (response.ok) { // if HTTP-status is 200-299
        json = await response.json();
      }else {
        // console.log('Â¯\_(ãƒ„)_/Â¯ : ' + response.status);
        break
      }
      txs2 = json['result']
      n = txs2.length
      txs.push.apply(txs, txs2)
    }

    let txsOut = $.grep(txs, function(v) {
      return v.from === address.toLowerCase();
    });

    txsOut = txsOut.map(({ confirmations, ...item }) => item);
    txsOut = new Set(txsOut.map(JSON.stringify));
    txsOut = Array.from(txsOut).map(JSON.parse);
  
    // remove duplicates
    //localStorage.setItem('txsOut', JSON.stringify(txsOut));
    console.log('All outgoing txs:', txsOut)
  
    var nOut = txsOut.length;
    
    $('#nOut').text(comma(nOut));
    var txsOutFail = $.grep(txsOut, function(v) {
      return v.isError === '1';
    });

    var nOutFail = txsOutFail.length;
    $('#nOutFail').text(comma(nOutFail));
    console.log('Failed outgoing txs:', txsOutFail);
  
    if (nOut > 0) {
      var gasUsed = txsOut.map(value => parseInt(value.gasUsed));
      var gasUsedTotal = gasUsed.reduce((partial_sum, a) => partial_sum + a,0); 
      var gasPrice = txsOut.map(value => parseInt(value.gasPrice));
      var gasPriceMin = Math.min(...gasPrice);
      var gasPriceMax = Math.max(...gasPrice);
      var gasFee = multiply(gasPrice, gasUsed)
      var gasFeeTotal = gasFee.reduce((partial_sum, a) => partial_sum + a,0); 
      var gasPriceTotal = gasPrice.reduce((partial_sum, a) => partial_sum + a,0);
      var gasUsedFail = txsOutFail.map(value => parseInt(value.gasUsed));
      var gasPriceFail = txsOutFail.map(value => parseInt(value.gasPrice));
      var gasFeeFail = multiply(gasPriceFail, gasUsedFail)
      var gasFeeTotalFail = gasFeeFail.reduce((partial_sum, a) => partial_sum + a,0); 
      $('#gasUsedTotal').text(comma(formatter(gasUsedTotal)));
      $('#gasPricePerTx').text(comma((gasPriceTotal/nOut/1e9).toFixed(1)));
      $('#gasPricePerTx').hover(function() {
      $(this).css('cursor', 'help').attr('title', 'Min: ' + (gasPriceMin/1e9).toFixed(3) + '; Max: ' + (gasPriceMax/1e9).toFixed(3));
        // Tipped.create('#gasPricePerTx', 'Min: ' + (gasPriceMin/1e9).toFixed(1) + '; Max: ' + (gasPriceMax/1e9).toFixed(1), { offset: { y: 20 } });
      }, function() {
      $(this).css('cursor', 'auto');
      });
      $('#gasFeeTotal').text('Ξ' + comma((gasFeeTotal/1e18).toFixed(3)));
    
      if (nOutFail > 0) {
        $('#gasFeeTotalFail').html('Ξ' + (gasFeeTotalFail/1e18).toFixed(3));
        var oof = Math.max(...gasFeeFail)/1e18;
        if (oof > 0.1) {
          var i = gasFeeFail.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
          var tx = txsOutFail[i];
          $('<p><a id="oof" href="https://etherscan.io/tx/' + 
          tx.hash + '">This one</a> cost <span id="oofCost">Ξ' + 
          (gasFeeFail[i]/1e18).toFixed(3) + '</span>.</p>').insertBefore($('#tipsy'))
        }
      }else{
        $('#gasFeeTotalFail').html('nothing');
      }
      if (ethusd !== null) {
        $('#ethusd').text('$' + comma(formatter((ethusd*gasFeeTotal/1e18).toFixed(2))));
        $('#oofCost').append(' ($' + comma(formatter((ethusd*gasFeeFail[i]/1e18).toFixed(2))) + ')');
      } 
    }else{
      $('#gasUsedTotal').text(0);
      $('#gasFeeTotal').text('Ξ' + 0);
    }
  }
  // get data by address
  let search = window.location.search;
  let params = new URLSearchParams(search);
  address = params.get('address', null);
  // console.log(address);
  if (address==null) {

  }else{
    data(address)
    $(".screen1").css("display","block");
    $(".screen2").css("display","none");
  }
});

function App() {
  return (
    <div className="App">
      <header className="App-header pt-4 pb-4">
        {/* Screen 2 */}
        <div className="screen2">
          <p>Sign into <strong><a href="https://metamask.io">MetaMask</a></strong> or pass an Address via the url (like <strong><a href="http://localhost:3000/?address=0xcdd6a2b9dd3e386c8cd4a7ada5cab2f1c561182d">this</a></strong>).</p>
        </div>
        {/* Screen 1 */}
        <div className="screen1">
          <p>You've spent <span id="gasFeeTotal">🤔</span> on gas. Right now, that's <span id="ethusd">🤔</span>.</p>
          <p>You used <span id="gasUsedTotal">🤔</span> gas to send <span id="nOut">🤔</span> transactions, with an average price of <span id="gasPricePerTx">🤔</span> gwei.</p>
          <p><span id="nOutFail">🤔</span> of them failed, costing you <span id="gasFeeTotalFail">🤔</span>.</p>
          <div className="d-flex justify-content-center pt-4">
            <div>
              <Chart
                chartType="PieChart"
                loader={<div>Loading Chart</div>}
                data={[
                  ['data', 'in(USD'],
                  ['US$15', 15],
                  ['US$10', 10],
                ]}
                options={{
                  'width':800,
                  'height':500,
                  legend: 'none',
                  pieSliceText: 'label',
                  pieStartAngle: 100,
                }}
                rootProps={{ 'data-testid': '4' }}
              />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
