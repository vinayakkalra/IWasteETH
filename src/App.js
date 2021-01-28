import React from 'react';
import './App.css';
import $ from "jquery";
import {TelegramShareButton,TwitterShareButton} from "react-share";
import {TelegramIcon,TwitterIcon} from "react-share";
import PieChartComponent from "./PieChart"

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentethusd : 0,
      totalPricePerTransaction : 0,
      isStateLoaded : false,
      isFooterLoaded: false,
      isHeaderLoaded: true,
      gasFeeTotal: '00'
    };
  }

  componentDidMount(){
    // var address = "";
    // var currentethusd
    // get data by address
    let search = window.location.search;
    let params = new URLSearchParams(search);
    var address = params.get('address', null);
    // console.log(address);
    window.addEventListener('load', async () => {          
      

      if (address==null) {
        if (typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask) {
          // Ethereum user detected. You can now use the provider.
          
          const provider = window["ethereum"];
          await provider.enable();
          // console.log('address', window.ethereum.selectedAddress);
          address = window.ethereum.selectedAddress;
          window.location = '/?address=' + address
          // console.log(address);
          // $(".screen1").css("display","block");
          // $(".screen2").css("display","none");
          // this.setState({isHeaderLoaded: false})
          // this.data(address)
          // window.ethereum.on('accountsChanged', function (accounts) {
          //   // Time to reload your interface with accounts[0]!
          //   console.log('account changed', accounts[0])
          //   // self.data(accounts[0])
          //   // $(".screen1").css("display","block");
          //   // $(".screen2").css("display","none");
          //   // self.setState({isHeaderLoaded: false})
          //   if (address != accounts[0]){
          //     window.location = '/?address=' + accounts[0]
          //   }
            
          // })
        } else {
          $(".screen2").css("display","block");
        }
        
      }else{
        if (typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask) {
          var address1 = address
          window.ethereum.on('accountsChanged', function (accounts) {
            // Time to reload your interface with accounts[0]!
            console.log('account changed', accounts[0])
            console.log('address1', address)
            // self.data(accounts[0])
            // $(".screen1").css("display","block");
            // $(".screen2").css("display","none");
            // self.setState({isHeaderLoaded: false})
            if (accounts[0] !== address){
              window.location = '/?address=' + accounts[0];
              
            }
            address1 = null
            
          })
          this.data(address)
          $(".screen1").css("display","block");
          $(".screen2").css("display","none");
          this.setState({isHeaderLoaded: false})
        } else {
          this.data(address)
          $(".screen1").css("display","block");
          $(".screen2").css("display","none");
          this.setState({isHeaderLoaded: false})
        }
        
      }
      if($('.screen2').css('display') === 'none'){
        $('.foo').removeClass('footer');
      }else{
        $('.foo').addClass('footer');
      }
      this.setState({isFooterLoaded: true})
    });
  }

  comma(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
  //this.formatter 
  formatter(num) {
    return num > 999999 ? (num/1e6).toFixed(3) + ' million' : num;
  }
  // this.multiply
  multiply(x, y) {
    var prod = [];
    var i;
    for (i=0; i < x.length; i++) {
      prod[i] = x[i] * y[i];
    }
    return prod;
  }

  TimeStampAreOnSameDay(d1, d2){
    console.log(d1, d2)
    return (d1.getFullYear() === d2.getFullYear() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getDate() === d2.getDate());
  }
   

  async data(address){
    var self = this;
    var totalPricePerTransaction 

    // this.comma
    // console.log(address);
    // 
    var ethusd = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd').then(response => {return response.json()}).catch(err => {
      console.log('coingeco error', err);
    })
    ethusd = ethusd.ethereum.usd;
    // console.log('ETHUSD: $' + ethusd);
    
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
        console.log('etherscan : ' + response.status);
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
    // console.log('All outgoing txs:', txsOut)
  
    var nOut = txsOut.length;
    
    $('#nOut').text(this.comma(nOut));
    var txsOutFail = $.grep(txsOut, function(v) {
      return v.isError === '1';
    });

    var nOutFail = txsOutFail.length;
    $('#nOutFail').text(this.comma(nOutFail));
    // console.log('Failed outgoing txs:', txsOutFail);
  
    if (nOut > 0) {
      var gasUsed = txsOut.map(value => parseInt(value.gasUsed));
      var gasUsedTotal = gasUsed.reduce((partial_sum, a) => partial_sum + a,0); 
      var gasPrice = txsOut.map(value => parseInt(value.gasPrice));
      var gasPriceMin = Math.min(...gasPrice);
      var gasPriceMax = Math.max(...gasPrice);

      var gasFee = this.multiply(gasPrice, gasUsed);
      var timestamp = txsOut.map(value => parseInt(value.timeStamp));
      // console.log("gas fees", gasFee)
      console.log("timestamp", timestamp)
      var fromTimestamp = (new Date(timestamp[0]*1000))
      fromTimestamp.setHours(0)
      fromTimestamp.setMinutes(0)
      fromTimestamp.setSeconds(0)
      var toTimestamp = new Date(timestamp[timestamp.length-1]*1000)
      toTimestamp.setHours(24)
      toTimestamp.setMinutes(0)
      toTimestamp.setSeconds(0)

      console.log("From timestamp", fromTimestamp.getTime())
      console.log("To timestamp", toTimestamp.getTime())
      // https://www.bitmex.com/api/udf/history?symbol=ETHUSD&resolution=1h&from=1610475138&to=1610475138
      
      var time = `https://api.coincap.io/v2/assets/ethereum/history?interval=d1&start=${fromTimestamp.getTime()}&end=${toTimestamp.getTime()}`
      // For development purpose only
      var response1 = await fetch(time)
      // For production env
      // response = await fetch(time)
      // console.log('response', response1)
      if (response1.ok) { // if HTTP-status is 200-299
        json = await response1.json();
        // console.log('coincap result ', json);
      }else {
        console.log('coincap error ', response1.status);
      }
      var ethusdprice = json['data']
      console.log('eth usd price', ethusdprice)
      var pricePerTransaction = []
      for(var x=0; x<timestamp.length; x++){
        for(var y=0; y<ethusdprice.length; y++){
          
          if(this.TimeStampAreOnSameDay(new Date(timestamp[x]*1000), (new Date(ethusdprice[y].time)))){
            pricePerTransaction[x] = parseFloat(ethusdprice[y].priceUsd) * parseFloat(gasFee[x]/1e18)
            console.log('1', parseFloat(ethusdprice[y].priceUsd) * parseFloat(gasFee[x]/1e18))

            break
          } 
        }
      }
      
      console.log('price per transaction', pricePerTransaction)
      totalPricePerTransaction = pricePerTransaction.reduce((partial_sum, a) => partial_sum + a,0); 
      var gasFeeTotal = gasFee.reduce((partial_sum, a) => partial_sum + a,0); 
      var gasPriceTotal = gasPrice.reduce((partial_sum, a) => partial_sum + a,0);
      var gasUsedFail = txsOutFail.map(value => parseInt(value.gasUsed));
      var gasPriceFail = txsOutFail.map(value => parseInt(value.gasPrice));
      var gasFeeFail = this.multiply(gasPriceFail, gasUsedFail)
      var gasFeeTotalFail = gasFeeFail.reduce((partial_sum, a) => partial_sum + a,0); 
      $('#gasUsedTotal').text(this.comma(this.formatter(gasUsedTotal)));
      $('#gasPricePerTx').text(this.comma((gasPriceTotal/nOut/1e9).toFixed(1)));
      
      $('#gasPricePerTx').hover(function() {
      $(this).css('cursor', 'help').attr('title', 'Min: ' + (gasPriceMin/1e9).toFixed(3) + '; Max: ' + (gasPriceMax/1e9).toFixed(3));
        // Tipped.create('#gasPricePerTx', 'Min: ' + (gasPriceMin/1e9).toFixed(1) + '; Max: ' + (gasPriceMax/1e9).toFixed(1), { offset: { y: 20 } });
      }, function() {
      $(this).css('cursor', 'auto');
      });
      $('#gasFeeTotal').text('Ξ' + this.comma((gasFeeTotal/1e18).toFixed(3)));

      this.setState({gasFeeTotal : this.comma((gasFeeTotal/1e18).toFixed(3))})
    
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
        $('#ethusd').text('$' + this.comma(this.formatter((ethusd*gasFeeTotal/1e18).toFixed(2))));
        $('#totalStableFees').text('$' + this.comma(this.formatter((totalPricePerTransaction).toFixed(2))));
        $('#oofCost').append(' ($' + this.comma(this.formatter((ethusd*gasFeeFail[i]/1e18).toFixed(2))) + ')');

        self.setState({totalPricePerTransaction: totalPricePerTransaction, currentethusd: ethusd*gasFeeTotal/1e18, isStateLoaded: true})
      } 
      if(window.innerWidth >= 960){
        $('.section').removeClass('col-12');
        $('.section').addClass('col-4');
      }else{
        $('.section').removeClass('col-4');
        $('.mbs').removeClass('d-flex');
        $('.section').addClass('col-12');
      }
    }else{
      $('#gasUsedTotal').text(0);
      $('#gasFeeTotal').text('Ξ' + 0);
      $('#ethusd').text('$' + 0);
      $('#totalStableFees').text('$' + 0);
      $('#oofCost').append(' ($' + 0 + ')');
      $('#gasPricePerTx').text('0');
      $('#gasFeeTotalFail').text('nothing');
    }
  }

  render(){
    return (
      <div className="App">
        <header className="App-header pt-4 pb-4" style={this.state.isHeaderLoaded ? {height: '90vh'} : {}}>
          {/* Screen 2 */}
          <div className="screen2">
            <p>Sign into <strong><a href="https://metamask.io" target="_blank" rel="noreferrer">MetaMask</a></strong> or pass an Address via the url (like <strong><a href="/?address=0xcdd6a2b9dd3e386c8cd4a7ada5cab2f1c561182d">this</a></strong>).</p>
          </div>
          {/* Screen 1 */}
          <div className="screen1">
            {/* <p>You've spent <span id="gasFeeTotal">🤔</span> on gas. Right now, that's <span id="ethusd">🤔</span>.</p>
            <p>If you paid in stablecoins, you would have paid: <span id="totalStableFees">🤔</span> on gas.</p>
            <p>You used <span id="gasUsedTotal">🤔</span> gas to send <span id="nOut">🤔</span> transactions, with an average price of <span id="gasPricePerTx">🤔</span> gwei.</p>
            <p><span id="nOutFail">🤔</span> of them failed, costing you <span id="gasFeeTotalFail">🤔</span>.</p> */}
            <p>Total gas you have spent: <span id="gasFeeTotal">🤔</span>.</p>
            <p>If you paid in stablecoins, you would have paid: <span id="totalStableFees">🤔</span>.</p>
            <p>But you paid in ETH, so your spendings are currently worth: <span id="ethusd">🤔</span>.</p>
            {/* <p>You used <span id="gasUsedTotal">🤔</span> gas to send <span id="nOut">🤔</span> transactions, with an average price of <span id="gasPricePerTx">🤔</span> gwei.</p>
            <p><span id="nOutFail">🤔</span> of them failed, costing you <span id="gasFeeTotalFail">🤔</span>.</p> */}
            {this.state.isStateLoaded &&  
              <div className="mbs d-flex justify-content-center align-items-center pt-4 overflow-hidden">
                <div className="col-4 section">
                  <h2>Amount of <span className="dot">ETH</span> investment lost in gas payments: <span className="dot">${(this.state.currentethusd - this.state.totalPricePerTransaction).toFixed(2)}</span></h2>
                </div>
                <div className="col-4 section">                  
                  <PieChartComponent blueValue={this.state.totalPricePerTransaction} redValue={this.state.currentethusd - this.state.totalPricePerTransaction}/>
                </div>
                <div className="col-4 section">
                  <h2>Amount you should have paid if you paid in <span className="dot1">Stablecoins: ${(this.state.totalPricePerTransaction).toFixed(2)}</span> </h2>
                </div>
              </div>
            }            
            <div className="share-buttons pt-5">
              <h2>Share Your Findings Now</h2>
              <TelegramShareButton
                  url={window.location.href}
                  title={'I have spent ' + this.state.gasFeeTotal +' ETH in gas currently worth $'+ this.comma(this.formatter(this.state.currentethusd.toFixed(0))) +'. If I paid gas in stablecoin, I would have saved $'+ this.comma(this.formatter((this.state.currentethusd - this.state.totalPricePerTransaction).toFixed(0))) +'.'}
                  className="pr-2">
                  <TelegramIcon
                    size={40}
                    round />
              </TelegramShareButton>
              <TwitterShareButton
                url={window.location.href}
                title={'I have spent ' + this.state.gasFeeTotal +' ETH in gas currently worth $'+ this.comma(this.formatter(this.state.currentethusd.toFixed(0))) +'. If I paid gas in stablecoin, I would have saved $'+ this.comma(this.formatter((this.state.currentethusd - this.state.totalPricePerTransaction).toFixed(0))) +'.'}
                className="">
                <TwitterIcon
                  size={45}
                  round />
              </TwitterShareButton>
            </div>
          </div>
        </header>
        {this.state.isFooterLoaded && 
          <footer className='foo'>
            <p style={{color:'gray',zIndex:'1',fontSize:'16px'}}>Developed By <a rel="noreferrer" href="https://www.quadbtech.com" target="_blank" style={{color:"cornflowerblue !important"}}>QuadBTech</a></p>
          </footer>
        }
        
      </div>
    );
  }
  
}

export default App;
