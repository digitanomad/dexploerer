/**
* Created by Soto
* Copyright @ SotoLAB Since 2015. All rights reserved.
*/

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

var DEBUG = 1;


FlowRouter.route('/', {
  action: function () {
    BlazeLayout.render('home', { content: 'mainInfo' });
  }
});

FlowRouter.route('/block/:blockId', {
  action: function (params, queryParams) {
    if (DEBUG) console.log("block:", params.blockId);
    Session.set('blockId', params.blockId);
    BlazeLayout.render('home', { content: 'blockInfos' });
  }
});

FlowRouter.route('/address/:addressId', {
  action: function (params, queryParams) {
    if (DEBUG) console.log("address:", params.addressId);
    Session.set('addressId', params.addressId);
    BlazeLayout.render('home', { content: 'addressInfo' });
  }
});

FlowRouter.route('/transaction/:transactionId', {
  action: function (params, queryParams) {
    if (DEBUG) console.log("transaction:", params.transactionId);
    Session.set('transactionId', params.transactionId);
    BlazeLayout.render('home', { content: 'transactionInfos' });
  }
});

/*
     Template.mainInfo
*/
Template.mainInfo.helpers({
  blockNum() {
    if (DEBUG) console.log("blockNum++");
    Meteor.call('blockNumber', function (error, result) {
      if (error) {
        if (DEBUG) console.log(error);
        alert('error !');
        return;
      } else {
        Session.set('number', result);
      }
    })
    return Session.get('number');
  },
  blockLists() {
    Meteor.call('blockLists', function (error, result) {
      if (error) {
        if (DEBUG) console.log(error);
        alert('error !');
        return;
      } else {
        Session.set('blockLists', result);
      }
    })
    return Session.get('blockLists');
  },
});

/*
     Template.blockInfos
*/
Template.blockInfos.helpers({
  getBlockHash() {
    var blockId = Session.get('blockId');
    if (DEBUG) console.log("hashValue:" + blockId);
    Meteor.call('getBlockHash', blockId, function (error, result) {
      if (error) {
        if (DEBUG) console.log(error);
        alert('error !');
        return;
      } else {
        Session.set('hashValue', result);
        // if (DEBUG) console.log("result.hash:" + result.hash);
        if (DEBUG) console.log("result.conf:" + result.conf);
      }
    })
    return Session.get('hashValue');
  },
  transactions() {
    var blockId = Session.get('blockId');
    if (DEBUG) console.log("transactions:" + blockId);
    Meteor.call('transactions', blockId, function (error, result) {
      if (error) {
        if (DEBUG) console.log(error);
        alert('error !');
        return;
      } else {
        Session.set('transactions', result);
        // if (DEBUG) console.log("result.hash:" + result.hash);
        if (DEBUG) console.log("transactions.id:" + result.id);
      }
    })
    return Session.get('transactions');
  },

});

/*
     Template.addressInfo
*/
Template.addressInfo.helpers({
  addressId() {
    return Session.get('addressId');
  },
  balance() {
    Meteor.call('balance', Session.get('addressId'), function (error, result) {
      if (error) {
        if (DEBUG) console.log(error);
        alert('error !');
        return;
      } else {
        Session.set('balance', result);
        // if (DEBUG) console.log("result.hash:" + result.hash);
        if (DEBUG) console.log("balance:" + result);
      }
    })
    return Session.get('balance');
  },
  balanceInEther() {
    Meteor.call('balanceInEther', Session.get('addressId'), function (error, result) {
      if (error) {
        if (DEBUG) console.log(error);
        alert('error !');
        return;
      } else {
        Session.set('balanceInEther', result);
        // if (DEBUG) console.log("result.hash:" + result.hash);
        if (DEBUG) console.log("balanceInEther:" + result);
      }
    })
    return Session.get('balanceInEther');
  },
});

/*
     Template.transactionInfos
*/
Template.transactionInfos.helpers({
  txId() {
    return Session.get('transactionId');
    // instance.counter.set(instance.counter.get() + 1);
    // return Template.instance().counter.get();
  },
  getTransaction() {
    // Session.set('getTransaction', false);
    Meteor.call('getTransaction', Session.get('transactionId'), function (error, result) {
      if (error) {
        if (DEBUG) console.log(error);
        alert('error !');
        return;
      } else {
        Session.set('getTransaction', result);
        // if (DEBUG) console.log("result.hash:" + result.hash);
        if (DEBUG) console.log("getTransaction.txprice:" + result.txprice);
      }
    })
    return Session.get('getTransaction');
  },

});

/*
     Template.search
*/
Template.search.events({
  'submit form'(event) {
    event.preventDefault();
    var ethRequest = event.target.requestType.value;
    var requestStr = ethRequest.split('0x').join('');

    if (DEBUG) console.log("requestStr.length:" + requestStr.length);

    if (requestStr.length == 40)
      return goToAddrInfos(requestStr)
    else if (requestStr.length == 64) {
      if (/[0-9a-zA-Z]{64}?/.test(requestStr))
        return goToTxInfos('0x' + requestStr)
      else if (/[0-9]{1,7}?/.test(requestStr))
        return goToBlockInfos(requestStr)
    } else if (parseInt(requestStr) > 0)
      return goToBlockInfos(parseInt(requestStr))

    alert('Don\'t know how to handle ' + requestStr)

  },
});

function goToBlockInfos(requestStr) {
  if (DEBUG) console.log("goToBlockInfos:" + requestStr);
  FlowRouter.go('/block/' + requestStr);
}

function goToAddrInfos(requestStr) {
  if (DEBUG) console.log("goToAddrInfos:" + requestStr);
  FlowRouter.go('/address/' + requestStr);
}

function goToTxInfos(requestStr) {
  if (DEBUG) console.log("goToTxInfos:" + requestStr);
  FlowRouter.go('/transaction/' + requestStr);
}