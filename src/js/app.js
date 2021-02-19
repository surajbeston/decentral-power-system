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
      else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      web3 = new Web3(App.web3Provider);
    }, 
  loadAccount: async () => {
      // App.account = web3.eth.accounts[0]
      App.account = web3.eth.accounts[0]
      console.log(web3.eth.accounts)

  },

  loadContract: async () => {
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
            <a href="#/lot/${lot.id}" class="card-link">Card link</a>
            </div>
        </div>
      `
   })
   $('.flex-container').html(lotsCardHtml)
  },
  lotDetail:(id) => {
    $(".flex-container").hide();
    $(".search-container").hide();
    $(".lot-detail-container").show()

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
    console.log(toUrl)
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


  lots: [ 
    {
      id: 1,
    },
    {
      id: 2,
    } 
  ]

}

$(() => {
  $(window).load(() => {
    App.load()
    App.hashChanged({newURL: window.location.href})
    window.onhashchange = App.hashChanged
  })
})