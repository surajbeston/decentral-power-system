App = {
  loading: false,
  contracts: {},

  id : "",

  load: async() => {
      await App.loadWeb3();
      await App.loadAccount();
      await App.loadContract();
      await App.render()
  },

  loadWeb3: async () => {
     
      if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
          // Request account access
          await window.ethereum.enable();
        } catch (error) {
          // User denied account access...
          console.error("User denied account access")
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
      }
      // If no injected web3 instance is detected, fall back to Ganache
      
      web3 = new Web3(App.web3Provider);
    }, 
  loadAccount: async () => {
      // App.account = web3.eth.accounts[0]
      App.account = web3.eth.accounts[0]
      console.log(web3.eth.accounts)
      App.from_data = {from: App.account}

  },

  loadContract: async () => {
    var EnergyToken = await $.getJSON('EnergyToken.json');
    

    App.contracts.EnergyToken = TruffleContract(EnergyToken);

    App.contracts.EnergyToken.setProvider(App.web3Provider)

    App.EnergyToken = await App.contracts.EnergyToken.deployed()

    console.log(App.EnergyToken)

    App.EnergyToken.name(App.from_data).then(result => {
      console.log(result)
    })

    var noOfLots = await App.getNoOfLots()
    // console.log(await App.getPlantLog(2))
    // console.log(await App.getDistributorLog(2))
    // console.log(await App.getConsumerLog(2))
    
  },
  getNoOfLots: async () => {
    var lot =  await App.EnergyToken.currentLot(App.from_data)
    App.noOfLots = lot.toString()
    return lot.toString()
  },
  getPlantLog: async lot => {
    // if (!App.EnergyToken){
    //    await App.loadContract()
    // }
    var data = await App.EnergyToken.plantLogs(lot, App.from_data)
    var units = data[0].toString()
    var time = data[2].toString()
    time = App.unixTimestampToDate(time)
    return { units, time, lot }
  },
  getDistributorLog: async lot => {
    var data = await App.EnergyToken.distributorLogs(lot, App.from_data)
    var units = data[0].toString()
    var time = data[2].toString()
    time = App.unixTimestampToDate(time)
    return { units, time, lot }
  },
  getConsumerLog: async lot => {
    var data = await App.EnergyToken.consumerLogs(lot, App.from_data)
    var units = data[0].toString()
    var time = data[2].toString()
    time = App.unixTimestampToDate(time)
    return { units, time, lot}
  },

  render: async => {
    var lotsCardHtml = "";
   App.lots.forEach(lot => {
      lotsCardHtml += `
        <div class="card" style="width: 18rem;">
            <div class="card-body">
            <h5 class="card-title">${lot.id}</h5>
            <h6 class="card-subtitle mb-2 text-muted">Card subtitle</h6>
            <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
            <a href="#/lot/${lot.id}" class="card-link" style="color: blue;">Check Lot</a>
            </div>
        </div>
      `
   })
   $('.flex-container').html(lotsCardHtml)
  },
  lotDetail:async (id) => {
    $(".flex-container").hide();
    $(".search-container").hide();
    $(".lot-detail-container").show()
    $(".plant").html("");
    $(".distributor").html("");
    $(".consumer").html("");
    while (true) {
      if (App.EnergyToken != undefined) {
        break
      }
      await App.sleep(500);
    }
    var plantData = await App.getPlantLog(id)
    var distributorData = await App.getDistributorLog(id)
    var consumerData = await App.getConsumerLog(id)
    // console.log(plantData)
    var plantHtml = `<h2 class="each-flex-head">Plant</h2>
            <p class="each-flex-p">
              <h4>Units: ${plantData.units}</h4>
            </p>
            <p class="each-flex-p">
              <h4>Lot: ${plantData.lot}</h4>
            </p>
            <p class="each-flex-p">
              <h4>Time: ${plantData.time}</h4>
            </p>`
     var distributorHtml = `<h2 class="each-flex-head">Distributor</h2>
            <p class="each-flex-p">
              <h4>Units: ${distributorData.units}</h4>
            </p>
            <p class="each-flex-p">
              <h4>Lot: ${distributorData.lot}</h4>
            </p>
            <p class="each-flex-p">
              <h4>Time: ${distributorData.time}</h4>
            </p>`
      var consumerHtml = `<h2 class="each-flex-head">Consumer</h2>
            <p class="each-flex-p">
              <h4>Units: ${consumerData.units}</h4>
            </p>
            <p class="each-flex-p">
              <h4>Lot: ${consumerData.lot}</h4>
            </p>
            <p class="each-flex-p">
              <h4>Time: ${consumerData.time}</h4>
            </p>
            `
    $(".plant").html(plantHtml)
    $(".distributor").html(distributorHtml)
    $(".consumer").html(consumerHtml)
  },

  Homepage: () => {
    $('.flex-container').show();
    $('.lot-detail-container').hide();
    $(".search-container").hide();
  },
  searchLoaded: () => {
    $('.flex-container').hide();
    $('.lot-detail-container').hide();
    $(".search-container").show();
  },

  hashChanged: (event) => {
    var Url = event.newURL.split("/")
    var i = Url.indexOf('#');
    if (i<1) {
      App.Homepage();
    }
    var len = Url.length
    var toUrl = Url[i+1]
    // console.log(toUrl)
   if(toUrl == "search"){
     App.searchLoaded();
   }
   else if (toUrl == "lot") {
     var lot_id = Url[len-1]
     App.lotDetail(lot_id);
   }
   else if (toUrl == "") {
     App.Homepage();
   }
  },
  unixTimestampToDate: (timestamp) => {
    var date = new Date(timestamp * 1000);
    return date;
  },


  lots: [ 
    {
      id: 1,
    },
    {
      id: 2,
    } 
  ],
  sleep: function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

}

$(() => {
  $(window).load(() => {
    App.load()
    App.hashChanged({newURL: window.location.href})
    window.onhashchange = App.hashChanged
  })
})