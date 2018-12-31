/**
* Created by Soto
* Copyright @ SotoLAB Since 2015. All rights reserved.
*/ 

import { Meteor } from 'meteor/meteor';
import Web3 from 'web3';

Meteor.startup(() => {
  // code to run on server at startup
});

var DEBUG = 1;

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
  if (DEBUG) console.log('web3');
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  if (DEBUG) console.log('HttpProvider!');
}

Meteor.methods({
  'blockNumber': function () {
    var blockNumber = web3.eth.blockNumber;
    if (DEBUG) console.log("result :" + blockNumber);
    return blockNumber;
  },

  'blockLists': function () {
    var maxBlocks = 15; // TODO: into setting file or user select
    var blockNum = web3.eth.blockNumber;
    if (maxBlocks > blockNum) {
      maxBlocks = blockNum + 1;
    }

    // get latest 50 blocks
    var blocks = [];
    for (var i = 0; i < maxBlocks; ++i) {
      blocks.push(web3.eth.getBlock(blockNum - i));
    }
    // if (DEBUG) console.log("blocks :" + blocks);
    return blocks;
  },

  'getBlockHash': function (blockId) {
    var number = web3.eth.blockNumber;
    var blockInfo = web3.eth.getBlock(blockId);
    blockInfo.difficulty = ("" + blockInfo.difficulty).replace(/['"]+/g, '');
    blockInfo.dataFromHex = hex2a(blockInfo.extraData);
    blockInfo.blockNumber = blockInfo.number;
    // if (DEBUG) console.log("blockInfo :" + blockInfo);

    if (blockInfo.blockNumber != undefined) {
      blockInfo.conf = number - blockInfo.blockNumber + " Confirmations";
      // if (DEBUG) console.log("blockInfo.conf :" + blockInfo.conf);
      if (blockInfo.conf == 0 + " Confirmations") {
        blockInfo.conf = 'Unconfirmed';

      }
    }

    if (blockInfo.blockNumber != undefined) {
      var info = web3.eth.getBlock(blockInfo.blockNumber);
      if (info != undefined) {
        var newDate = new Date();
        newDate.setTime(info.timestamp * 1000);
        blockInfo.time = newDate.toUTCString();
        // if (DEBUG) console.log("blockInfo.time :" + blockInfo.time);
      }
    }
    return blockInfo;
  },

  'transactions': function (blockId) {
    var transactions = [];
    var txCount = web3.eth.getBlockTransactionCount(blockId);
    if (DEBUG) console.log("transactions txCount :" + txCount);

    for (var blockIdx = 0; blockIdx < txCount; blockIdx++) {
      var result = web3.eth.getTransactionFromBlock(blockId, blockIdx); 
      if (DEBUG) console.log("transactions :" + result);

      var transaction = {
        id: result.hash,
        hash: result.hash,
        from: result.from,
        to: result.to,
        gas: result.gas,
        input: result.input,
        value: result.value
      }
      transactions.push(transaction);
    }

    return transactions;
    // if (DEBUG) console.log("result :" + blockInfo.hash);
    // return blockInfo.hash;
  },
  
  'balance': function (addressId) {
    var balance = web3.eth.getBalance(addressId);
    if (DEBUG) console.log("balance :" + balance);
    return parseFloat(balance);
  },
  
  'balanceInEther': function (addressId) {
    var balanceInEther = web3.eth.getBalance(addressId);
    if (DEBUG) console.log("balanceInEther :" + web3.fromWei(balanceInEther, 'ether'));
    return parseFloat(web3.fromWei(balanceInEther, 'ether'));
  },
  
  'getTransaction': function (transactionId) {
    var number = web3.eth.blockNumber;
    var transactionInfo =  web3.eth.getTransaction(transactionId);
    transactionInfo.gasPrice = transactionInfo.gasPrice.c[0] + " WEI";
    transactionInfo.ethValue = transactionInfo.value.c[0] / 10000;
    transactionInfo.txprice = parseFloat((transactionInfo.gas * transactionInfo.gasPrice)/1000000000000000000) + " ETH";
    // if (DEBUG) console.log("transactionInfo.txprice :" + transactionInfo.txprice);

    if (transactionInfo.blockNumber != undefined) {
      transactionInfo.conf = number - transactionInfo.blockNumber;
      if (DEBUG) console.log("transactionInfo.conf :" + transactionInfo.conf);
      if (transactionInfo.conf == 0) {
        transactionInfo.conf = 'Unconfirmed';

      }
    }

    if (transactionInfo.blockNumber != undefined) {
      var info = web3.eth.getBlock(transactionInfo.blockNumber);
      if (info != undefined) {
        transactionInfo.time = info.timestamp;
        // if (DEBUG) console.log("blockInfo.time :" + blockInfo.time);
      }
    }
    return transactionInfo;
  },

}) // end of methods

function hex2a(hexx) {
  var hex = hexx.toString();//force conversion
  var str = '';
  for (var i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}