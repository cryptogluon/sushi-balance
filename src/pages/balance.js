import React from "react";
import ReactDOM from "react-dom";
import { styled } from '@material-ui/styles';
import { makeStyles } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import {Navbar,Nav} from 'react-bootstrap';
import IconButton from '@material-ui/core/IconButton';
import GitHubIcon from '@material-ui/icons/GitHub';
import TwitterIcon from '@material-ui/icons/Twitter';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Popover from '@material-ui/core/Popover';

//Eth stuff
import detectEthereumProvider from '@metamask/detect-provider'
import {SushiSwap} from '../lib/SushiSwapJs/sushiswap.js'

//charts
import {Line} from 'react-chartjs-2';


const Web3 = require("web3");

const MyButton = styled(Button)({
  color:'rgb(91, 57, 38)',
  border:'1px',
  borderStyle:'solid',
  backgroundColor:'rgb(226, 214, 207)',
  '&:hover':{
    color:'rgb(91, 57, 38)'
  }
});

const MyCard = styled(Card)({
  width:'20em',
  height:'6em',
});



const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
})

const sushiFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2
});



class Balance extends React.Component {
  constructor(props){
  	super(props);
    this.state = {
      farms:[],
      openAbout:false,
      anchorEl:'',
      coinArr:{
        name:'sushi',
        logo: '',
        totalSushiBalance:0,
        mySushiUSD:0,
        walletBalance:0,
        priceUSD:0,
        priceETH:0,
        priceETHUSD:0,
        totalUSD:0,
        poolTokensNotStaked:0,
        poolTokensStaked:0,
        sushiLPStaked:0,
        poolTokensTotal:0,
        poolTokensPending:0,
        sushiInSushiPoolETH:0,
        ethInSushiPoolETH:0,
        xsushiStaked:0,
        xsushiToBeCollected:0,
        xsushiTotal:0,
        sushiInBar:0,
        xsushiValInSushi:0,
        barSushiUSD:0,
        address: 0,
      }
    }
    this.buildSushiSwap = this.buildSushiSwap.bind(this);
    this.SushiSwapEventEmitter = this.SushiSwapEventEmitter.bind(this);
    this.connectToMetaMask = this.connectToMetaMask.bind(this);
    this.openAbout = this.openAbout.bind(this);
    this.compare = this.compare.bind(this);
  }
  async buildSushiSwap(web3){
    let ss = new SushiSwap(web3)
    let coinArr = {};
    await ss.getInfo(window.ethereum.selectedAddress)
    let bar = await ss.getBar(window.ethereum.selectedAddress);
    await bar.poll();

    //console.log(bar);//parseFloat(Web3.utils.fromWei(ss.pools[12].totalSushiPerBlock.toString()),'ether'),parseFloat(Web3.utils.fromWei(ss.pools[12].devShare.toString()),'ether'))
    // DEBUGGING
    this.setState({
      baseSushiPerBlock:parseFloat(Web3.utils.fromWei(ss.base.sushiPerBlock.toString()),'ether'),
      sushiReward:parseFloat(Web3.utils.fromWei(ss.pools[12].sushiReward.toString()),'ether'),
      devShare:parseFloat(Web3.utils.fromWei(ss.pools[12].devShare.toString()),'ether'),
      sushiRewardInETH:parseFloat(Web3.utils.fromWei(ss.pools[12].sushiRewardInETH.toString()),'ether'),
      sushiRewardInCurrency:parseFloat(Web3.utils.fromWei(ss.pools[12].sushiRewardInCurrency.toString())*1000000000000,'ether'),
      totalSushiPerBlock:parseFloat(Web3.utils.fromWei(ss.pools[12].totalSushiPerBlock.toString()),'ether'),
      hourlyROI:parseFloat(Web3.utils.fromWei(ss.pools[12].hourlyROI.toString()),'ether'),
      dailyROI:parseFloat(Web3.utils.fromWei(ss.pools[12].dailyROI.toString()),'ether'),
      hourlyInCurrency:parseFloat(Web3.utils.fromWei(ss.pools[12].hourlyInCurrency.toString()),'ether'),
      dailyInCurrency:parseFloat(Web3.utils.fromWei(ss.pools[12].dailyInCurrency.toString())*1000000000000,'ether'),
    })


    let poolTokens = [];
    let poolTokensTotal=0;
    let poolTokensTotalPending = 0;
    let totalValue = 0;
    let sushiInSushiPoolETH=0;
    let ethInSushiPoolETH=0;
    let poolTokensNotStaked=0;
    let poolTokensStaked=0;
    let totalPoolTokensNotStaked=0;
    let totalPoolTokensStaked=0;


    let sushiLPStaked=0;
    let farms = [];
    let tvlInRewardPools=0;
    for(let i=0;i<ss.pools.length;i++){
      poolTokensTotal+=parseFloat(Web3.utils.fromWei(ss.pools[i].valueUserStakedToken0.toString(),'ether')) + parseFloat(Web3.utils.fromWei(ss.pools[i].valueUserStakedToken1.toString(),'ether'))
      if(i === ss.sushi_pool){
        sushiInSushiPoolETH=parseFloat(Web3.utils.fromWei(ss.pools[i].userStakedToken0.toString(),'ether')); 
        ethInSushiPoolETH=parseFloat(Web3.utils.fromWei(ss.pools[i].userStakedToken1.toString(),'ether'));
        sushiLPStaked=parseFloat(Web3.utils.fromWei(ss.pools[i].balance.toString(),'ether'))
      }
      poolTokensTotalPending+=parseFloat(Web3.utils.fromWei(ss.pools[i].pending.toString(),'ether'))
      totalPoolTokensNotStaked = parseFloat(Web3.utils.fromWei(ss.pools[i].uniBalance.toString(),'ether')).toFixed(6)
      totalPoolTokensStaked = parseFloat(Web3.utils.fromWei(ss.pools[i].balance.toString(),'ether')).toFixed(6)
  
      poolTokensNotStaked = parseFloat(Web3.utils.fromWei(ss.pools[i].uniBalance.toString(),'ether'))
      poolTokensStaked = parseFloat(Web3.utils.fromWei(ss.pools[i].balance.toString(),'ether'))

      if(poolTokensStaked === 0 && poolTokensNotStaked === 0){
        poolTokensStaked = ' -'
        poolTokensNotStaked = '-';
      }
      else{
        poolTokensStaked=parseFloat(poolTokensStaked).toFixed(6)
        poolTokensNotStaked=parseFloat(poolTokensNotStaked).toFixed(6)
      }
      
      // Pools
      let pool = ss.pools[i];
      //console.log(pool)
      let shareOfUniswapPool = parseFloat(Web3.utils.fromWei(pool.shareOfUniswapPool.toString(),'ether'));
      let totalSupply = parseFloat(Web3.utils.fromWei(pool.totalSupply.toString(),'ether'));
      let totalStakedToken0 = parseFloat(Web3.utils.fromWei(pool.totalStakedToken0.toString(),'ether'))
      let totalStakedToken1 = parseFloat(Web3.utils.fromWei(pool.totalStakedToken1.toString(),'ether'))
      let token0rate = parseFloat(Web3.utils.fromWei(pool.token0rate.toString(),'ether'))
      let token1rate = parseFloat(Web3.utils.fromWei(pool.token1rate.toString(),'ether'))
      let userStakedTokensInPool=parseFloat(Web3.utils.fromWei(pool.balance.toString(),'ether'))
      //let vst0=parseFloat(Web3.utils.fromWei(pool.valueStakedToken0.toString(),'ether'))
      //let vst1=parseFloat(Web3.utils.fromWei(pool.valueStakedToken1.toString(),'ether'))
      //let totalVST=(vst0+vst1);
      let totalTokensInPool0=parseFloat(Web3.utils.fromWei(pool.reserve0.toString(),'ether'))/token0rate*parseFloat(Web3.utils.fromWei(ss.base.eth_rate.toString(),'ether'))*1000000000000;;
      let totalTokensInPool1=parseFloat(Web3.utils.fromWei(pool.reserve1.toString(),'ether'))/token1rate*parseFloat(Web3.utils.fromWei(ss.base.eth_rate.toString(),'ether'))*1000000000000;
      let totalTokensInPool=totalTokensInPool0+totalTokensInPool1;
      let uniTotalSupply=parseFloat(Web3.utils.fromWei(pool.uniTotalSupply.toString(),'ether'));

      let userPercentStaked=(totalSupply*poolTokensStaked/uniTotalSupply)*100;
      let userStaked=(totalSupply*poolTokensStaked/uniTotalSupply);
      let userPercentStakedRewardsPerBlock = ' - ';
      if(userStaked*parseFloat(Web3.utils.fromWei(ss.pools[i].totalSushiPerBlock.toString()),'ether')){
        userPercentStakedRewardsPerBlock=(userStaked*parseFloat(Web3.utils.fromWei(ss.pools[i].totalSushiPerBlock.toString()),'ether')).toFixed(10)
      }
      tvlInRewardPools+=totalTokensInPool;

      farms.push({
        name:pool.name,
        logo:pool.logo,
        sushiReward:parseFloat(Web3.utils.fromWei(pool.sushiReward.toString(),'ether')),
        devShareReward:parseFloat(Web3.utils.fromWei(pool.devShare.toString(),'ether')),
        totalSushiPerBlock:parseFloat(Web3.utils.fromWei(pool.totalSushiPerBlock.toString(),'ether')).toFixed(4),
        totalSLPStaked:parseFloat(Web3.utils.fromWei(pool.shareOfUniswapPool.toString(),'ether')*100).toFixed(2),
        hourlyROI:(parseFloat(Web3.utils.fromWei(pool.hourlyROI.toString(),'ether'))*100000000000000).toFixed(2) + " %",
        dailyROI:(parseFloat(Web3.utils.fromWei(pool.dailyROI.toString(),'ether'))*100000000000000).toFixed(2) + " %",
        monthlyROI:(parseFloat(Web3.utils.fromWei(pool.monthlyROI.toString(),'ether'))*100000000000000).toFixed(2) + " %",
        yearlyROI:(parseFloat(Web3.utils.fromWei(pool.yearlyROI.toString(),'ether'))*100000000000000).toFixed(2) + " %",
        TVL:formatter.format(parseFloat(Web3.utils.fromWei(pool.valueInCurrency.toString(),'ether'))*1000000000000),
        //valueStakedToken0:vst0 +'ETH',
        //valueStakedToken1:vst1 +'ETH',
        totalStakedToken0:totalStakedToken0,
        totalStakedToken1:totalStakedToken1,
        //totalVST:totalVST,
        token0rate:token0rate,
        token1rate:token1rate,
        totalTokensInPool0:formatter.format(totalTokensInPool0) + 'ETH',
        totalTokensInPool1:formatter.format(totalTokensInPool1) + 'ETH',
        totalTokensInPool:formatter.format(totalTokensInPool),
        reserve0:sushiFormatter.format(parseFloat(Web3.utils.fromWei(pool.reserve0.toString(),'ether'))),
        reserve1:sushiFormatter.format(parseFloat(Web3.utils.fromWei(pool.reserve1.toString(),'ether'))) + " ETH",
        shareOfUniswapPool:shareOfUniswapPool,
        totalSupply:totalSupply,
        uniTotalSupply:sushiFormatter.format(uniTotalSupply) + " SLP",
        userStakedTokensInPool:userStakedTokensInPool,
        userPercentStaked:userPercentStaked + " %",
        userPercentStakedRewardsPerBlock:userPercentStakedRewardsPerBlock,
        poolTokensNotStaked:poolTokensNotStaked,
        poolTokensStaked:poolTokensStaked


      })
      //console.log(poolTokensTotalPending)
      poolTokens.push({
        poolName:ss.pools[i].name,
        userBalanceLPs:ss.pools[i].balance,

      })

    }

    farms.sort(this.compare);      

    let totalSushiBalance = (parseFloat(Web3.utils.fromWei(ss.base.sushiBalance.toString(),'ether')) + (parseFloat(Web3.utils.fromWei(bar.sushiStake.toString(),'ether'))) + sushiInSushiPoolETH  + poolTokensTotalPending).toFixed(4);
    let priceUSD = parseFloat(Web3.utils.fromWei(ss.base.sushiValueInCurrency.toString(),'ether'))*1000000000000;
    let mySushiUSD = parseFloat(totalSushiBalance * priceUSD);
    let ETHPrice = parseFloat(Web3.utils.fromWei(ss.base.eth_rate.toString(),'ether'))*1000000000000;
    let myETHUSD = parseFloat(ethInSushiPoolETH) * ETHPrice;
    //console.log(Web3.utils.fromWei(ss.base.eth_rate.toString(),'ether'))
    let myETH = parseFloat(ethInSushiPoolETH) + parseFloat(mySushiUSD / ETHPrice);
    let totalUSD = parseFloat(myETHUSD) + parseFloat(mySushiUSD);
    let xsushiValInSushi = (parseFloat(Web3.utils.fromWei(bar.barSushi.toString(),'ether')) / parseFloat(Web3.utils.fromWei(bar.totalXSushi.toString(),'ether'))).toFixed(4)
    //let xsushiValInUSD = xsushiValInSushi(parseFloat(Web3.utils.fromWei(bar.barSushi.toString(),'ether'))).toFixed(4);
    let barSushiUSD = (parseFloat(Web3.utils.fromWei(bar.barSushi.toString(),'ether'))*priceUSD);

    coinArr = {
      name:'sushi',
      logo: ss.pools[ss.sushi_pool].logo,
      eth_logo: 'Ξ',
      tvlInRewardPools:formatter.format(tvlInRewardPools),
      totalSushiBalance:totalSushiBalance,
      mySushiUSD:formatter.format(mySushiUSD),
      walletBalance:Web3.utils.fromWei(ss.base.sushiBalance.toString(),'ether'),
      priceUSD:formatter.format(priceUSD),
      priceETH:myETH.toFixed(2),
      priceETHUSD:formatter.format(myETHUSD),
      totalUSD:formatter.format(totalUSD),
      totalPoolTokensNotStaked:totalPoolTokensNotStaked,
      totalPoolTokensStaked:totalPoolTokensStaked,
      sushiLPStaked:sushiLPStaked.toFixed(4),
      poolTokensTotal:poolTokensTotal.toFixed(4),
      poolTokensPending:poolTokensTotalPending.toFixed(4),
      sushiInSushiPoolETH:(sushiInSushiPoolETH).toFixed(4),
      ethInSushiPoolETH:ethInSushiPoolETH.toFixed(4),
      xsushiStaked:(parseFloat(Web3.utils.fromWei(bar.xsushi.toString(),'ether'))).toFixed(4),
      xsushiToBeCollected:(parseFloat(Web3.utils.fromWei(bar.sushiStake.toString(),'ether'))-(parseFloat(Web3.utils.fromWei(bar.xsushi.toString(),'ether')))).toFixed(4),
      xsushiTotal:sushiFormatter.format(parseFloat(Web3.utils.fromWei(bar.totalXSushi.toString(),'ether'))),
      sushiInBar:sushiFormatter.format(parseFloat(Web3.utils.fromWei(bar.barSushi.toString(),'ether'))),
      xsushiValInSushi:xsushiValInSushi,
      barSushiUSD:formatter.format(barSushiUSD),
      address: ss.base.sushi
    }
    this.setState({
      coinArr:coinArr,
      farms:farms
    })
  }

  async SushiSwapEventEmitter(web3){
    web3.eth.subscribe('newBlockHeaders', async () =>{
        this.buildSushiSwap(web3);
      });
  }

  async connectToMetaMask(){
    const provider = await detectEthereumProvider()
    if(provider){
    //if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      let web3 = new Web3(window.ethereum);
      this.buildSushiSwap(web3);
      this.SushiSwapEventEmitter(web3);
    }
  }

  openAbout(event){
    this.setState({
      openAbout:!this.state.openAbout,
      anchorEl:this.state.openAbout ? '' : event.currentTarget
    })
  }

   compare(a,b){
    if(parseFloat(a.totalSushiPerBlock) > parseFloat(b.totalSushiPerBlock)){
      return -1
    }
    else if(parseFloat(a.totalSushiPerBlock) == parseFloat(b.totalSushiPerBlock)){
      return -1
    }
    else
      return 1
    }
  
  render() {
    return (
      <div>
      <Navbar expand="lg" className="balance-navbar">
        <Navbar.Brand href="#home" className="balance-navbar-content-left">Sushi Balance</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
          </Nav>
          <div className="balance-navbar-content-right">
            <MyButton variant="outlined" color="white" onClick={() => this.connectToMetaMask()}>Connect To MetaMask</MyButton>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <IconButton target="_blank" href="http://twitter.com/cryptogluon">
              <TwitterIcon/>
              </IconButton>
            <IconButton target="_blank" href="https://github.com/cryptogluon/sushi-balance">
            <GitHubIcon/>
            </IconButton>
            <IconButton target="_blank" onClick={(event) => this.openAbout(event)}>
            <InfoOutlinedIcon/>
            </IconButton>
            <Popover
              anchorEl={this.state.anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={this.state.openAbout}
              onClose={() =>this.openAbout()}
            >
              <Card>
              <CardContent>
              <Typography component="h4" variant="h5">
              About
              </Typography>
              &nbsp; This page is an unofficial dashboard made by <a target="_blank" href="https://www.twitter.com/cryptogluon">@cryptogluon</a><br/>
              &nbsp; All FE code you can verify on <a target="_blank" href="https://github.com/cryptogluon/sushi-balance">https://github.com/cryptogluon/sushi-balance</a><br/>
              &nbsp; Values and assumptions are being actively verified.<br/>
              &nbsp; TVL Rewards and xsushi assumptions are still being verified.<br/>
              &nbsp; Coming Soon: ROI / All Pools / Some Charts<br/>
              &nbsp; Interact w/ Sushi: <a target="_blank" href="https://sushiswapclassic.org/">https://sushiswapclassic.org/</a>
              </CardContent>
              </Card>
            </Popover>
          </div>
        </Navbar.Collapse>
      </Navbar>
      <div class="balance-main">
      {/*<MyButton href="https://metamask.app.link/dapp/sushi-balance.herokuapp.com/" variant="outlined" color="white">Connect To MetaMask Mobile</MyButton>*/}
      {/*  <br/>
        <br/>*/}
        <br/>
        <div class="main-grid">
          <div class="item-top-1">
          <MyCard>
          <CardContent>
          <Typography component="h4" variant="h5">
            My Total:
          </Typography>
          <Typography component="h6" variant="h6">
            {this.state.coinArr.totalUSD} (@ {this.state.coinArr.priceUSD}/{this.state.coinArr.logo})
            </Typography>
            </CardContent>
          </MyCard>
          </div>
          <div class="item-top-2">
          <MyCard>
          <CardContent>
          <Typography component="h4" variant="h5">
            TVL in Reward Pools:
          </Typography>
          <Typography component="h6" variant="h6">
            {this.state.coinArr.tvlInRewardPools}
            </Typography>
            </CardContent>
          </MyCard>
          </div>
          <div class="item-info">
          <TableContainer component={Paper}>
            <Table aria-label="simple table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">My Sushi Balance</TableCell>
                  <TableCell align="center">Price</TableCell>
                  <TableCell align="center">Sushi USD Value</TableCell>
                  <TableCell align="center">ETH Value</TableCell>
                  <TableCell align="center">ETH USD Value</TableCell>
                  <TableCell align="center">Wallet Balance</TableCell>
                  <TableCell align="center">xSushi Staked</TableCell>
                  <TableCell align="center">xSushi Rewards</TableCell>
                  <TableCell align="center">Amount To be Harvested</TableCell>
                  <TableCell align="center">Sushi Pool (Staked)*</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>             
                  <TableRow key={1}>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.totalSushiBalance} {this.state.coinArr.logo} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.priceUSD}</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.mySushiUSD} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.priceETH} {this.state.coinArr.eth_logo}</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.priceETHUSD} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.walletBalance} {this.state.coinArr.logo} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.xsushiStaked} {this.state.coinArr.logo}</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.xsushiToBeCollected} {this.state.coinArr.logo}</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.poolTokensPending} {this.state.coinArr.logo} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.sushiInSushiPoolETH} {this.state.coinArr.logo}</TableCell>
                  </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          </div>

          <div class="item-xsushi">
          <Typography component="h5" variant="h5">
            xSushi Info
          </Typography>
          <br/>
          <TableContainer component={Paper}>
            <Table aria-label="simple table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Sushi In Bar</TableCell>
                  <TableCell align="center">Total xSushi supply</TableCell>
                  <TableCell align="center">Sushi/xSushi Ratio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  <TableRow key={1}>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.sushiInBar} {this.state.coinArr.logo} = {this.state.coinArr.barSushiUSD}</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.xsushiTotal}</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.xsushiValInSushi} {this.state.coinArr.logo}</TableCell>
                  </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          </div>

          <div class="item-pool">
          <Typography component="h5" variant="h5">
            My Pool info:
          </Typography>
          <br/>
          <TableContainer component={Paper}>
            <Table aria-label="simple table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Total SLP Not Staked</TableCell>
                  <TableCell align="center">Total SLP Staked</TableCell>
                  <TableCell align="center">Total Value Staked in Rewards Pools</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  <TableRow key={1}>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.totalPoolTokensNotStaked} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.totalPoolTokensStaked} LP</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.poolTokensTotal} ETH </TableCell>
                    {/*<TableCell align="center" component="th" scope="row"> {this.state.coinArr.sushiLPStaked} SLP = {this.state.coinArr.sushiInSushiPoolETH} {this.state.coinArr.logo} & {this.state.coinArr.ethInSushiPoolETH} ETH</TableCell>*/}
                  </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          </div>
          <div class="item-pairs">
          <Typography component="h5" variant="h5">
            Pools with Rewards
          </Typography>
          <br/>
          <TableContainer component={Paper}>
            <Table aria-label="simple table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Farm</TableCell>
                  <TableCell align="center">Reward/Block</TableCell>
                  <TableCell align="center">Tokens in Pool</TableCell>
                  <TableCell align="center">Total SLPs Staked (% of Total in Pool)</TableCell>
                  <TableCell align="center">Total Value Locked</TableCell>
                  <TableCell align="center">My SLP Staked | Unstaked</TableCell>
                  <TableCell align="center">ROI</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {this.state.farms.map((row,index) => (             
                  <TableRow key={index}>
                    <TableCell align="center" component="th" scope="row"> {row.name} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {row.totalSushiPerBlock} {this.state.coinArr.logo}</TableCell>
                    <TableCell align="center" component="th" scope="row"> {row.reserve0}{row.logo}<br/> {row.reserve1}</TableCell>
                    <TableCell align="center" component="th" scope="row"> {row.uniTotalSupply} ({row.totalSLPStaked} %)</TableCell>
                    <TableCell align="center" component="th" scope="row">{row.totalTokensInPool} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {row.poolTokensStaked} | {row.poolTokensNotStaked}</TableCell>
                    <TableCell align="center" component="th" scope="row"> Hourly: {row.hourlyROI}<br/>Daily: {row.dailyROI}<br/> Yearly: {row.yearlyROI}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </div>
          <div class="item-chart">
          {/*<Typography component="h5" variant="h5">
            Charts
          </Typography>*/}
          <br/>
          {/*<Line data={data} />*/}
          
          </div>
          <div class="item-logs">
         {/* <Typography component="h5" variant="h5">
            Logs
          </Typography>*/}
          <br/>
          </div>
          </div>
           


        </div>
        </div>

      );
  }
};

ReactDOM.render(<Balance/>, document.getElementById("balance"));
export default Balance;


