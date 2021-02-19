pragma solidity >=0.4.22 <0.9.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC777/ERC777.sol";

contract EnergyToken is ERC777 {
    address[] public plantNodes;
    address[] public distributorNodes;
    address[] public consumerNodes;
    address[] public defaultoperators;
    
    uint256 public cost = 10;
    uint256 public totalCost;
    uint256 public checkLost;
    
    event EnergyTokenAltered(address nodeAddress, uint256 tokens, uint8 entity, uint256 currentLot);

    mapping(address => uint256) public plants;
    mapping(address => uint256) public distributors;
    mapping(address => uint256) public consumers;
    
    struct TokenStat {
        uint256 units;
        uint256 lot;
        uint256 datetime;
    }

    uint256 currentLot;
    
    mapping(address => TokenStat) plantLogs;
    mapping(address => TokenStat) distributorLogs;
    mapping(address => TokenStat) consumerLogs;
    
      function percent(uint numerator, uint denominator, uint precision) public returns(int quotient) {
        
                 // caution, check safe-to-multiply here
                int _numerator  = int(numerator * 10 ** (precision+1));
                // with rounding of last digit
                int _quotient =  ((_numerator / int(denominator)) + 5) / 10;
                return  _quotient;
          }


    constructor(uint256 initialSupply,  address[] memory  _defaultOperators) 
        ERC777("Gold", "GLD", _defaultOperators)
        public
    {
        defaultoperators = _defaultOperators;
    }
    
    modifier onlyPlant{
        for (uint256 j = 0; j < plantNodes.length; j++){
            if (plantNodes[j] == msg.sender){
                _;
                break;
            }
        }
    }
    
    modifier onlyDefaultOperator{
        if (defaultoperators[0] == msg.sender){
            _;
        }
    }
    
    modifier onlyDistributor{
        for (uint256 j = 0; j < distributorNodes.length; j++){
            if (distributorNodes[j] == msg.sender){
                _;
                break;
            }
        }
    }
    
    modifier onlyConsumer{
        for (uint256 j = 0; j < consumerNodes.length; j++){
            
            if (consumerNodes[j] == msg.sender){
                _;
                break;
            }
        }
    }
    
    /* entities:
        1: Power Plant
        2: Distributor
        3: Consumer
    
        Power Plant id: 01
        Distributor id: 0201
        Consumer id: 12340201
    */
    
    function createNode(address nodeAddress, uint8 entity, uint256 id, uint256 aheadEntity) public onlyDefaultOperator {
        require(entity > 0 && entity < 4);
        if (entity == 1){
            plantNodes.push(nodeAddress);
            plants[nodeAddress] = id;
        }
        else if (entity == 2){
            distributorNodes.push(nodeAddress);
            distributors[nodeAddress] = id*(10**3) + aheadEntity;
        }
        else {
            consumerNodes.push(nodeAddress);
            consumers[nodeAddress] = id*(10**5) + aheadEntity;
        }
    }
    
    // mineTokenPlant receives the 
    
    function mine() public{
        _mint(msg.sender, 2000, "", "");
    }
    
    function mineTokenPlant(uint256 units, address distributor) public onlyPlant {  
        //the receiving address in parameter is just for fast prototyping
        currentLot++;
        _mint(msg.sender, units, "", "");
        plantLogs[msg.sender] = TokenStat(units, currentLot, block.timestamp);
        super.transfer(distributor, units);
        emit EnergyTokenAltered(msg.sender, units, 1, currentLot);
    }
    
    function evaluateTokenDistributor(uint256 units, address consumer, address payable plant) public payable onlyDistributor{
        uint256 totalUnits = super.balanceOf(msg.sender);
        plant.transfer(totalUnits * cost);
        totalCost = totalUnits * cost;
        uint256 lostTokens = totalUnits - units;
        checkLost = lostTokens;
        super.burn(lostTokens, "0xd3");
        int256 diffLoss = 10 - percent(lostTokens, units, 0);
        int256 compensation = 100 + (10+5) + ((diffLoss > 0) ? 0 : diffLoss);
        cost = cost * uint256(compensation)/100;
        distributorLogs[msg.sender] = TokenStat(units, currentLot, block.timestamp);
        super.transfer(consumer, units);
        emit EnergyTokenAltered(msg.sender, units, 2, currentLot);
    }
}

