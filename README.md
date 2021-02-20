# Decentralized Power Distribution System Using Blockchain

[![front.jpg](https://i.postimg.cc/7PNyZsfs/front.jpg)](https://postimg.cc/F116Pxb3)

## Introduction 

This project intends to transfer electric power from power plant, through distributor networks and to consumers in a transparent and
tractionless way using blockchain like ethereum and smart contracts. <br />
So, basically we record energy transfer in power plant, distributor and consumer energy meters and then store those data on blockchain through smart contracts 
, which can then be used to solve a number of problems including transparency of the energy supply, determination of the origin of energy and most importantly 
decentralization and autonomy of the entire energy network.<br />

## Background and problem

Large national monopolies like Nepal Electricity Athority has always been accused of power mismanagement and the translucent nature of these structures
does not help the global energy crisis. <br />
Accusations of intermediate and illicit power sales in distribution network is out there which can harm consumers in different ways. <br>
Also country like Nepal, rich in water resources can have a power economy of almost 20 billion dollars and this big chunk of national economy to a unit organisation.
<br />
We believe that, if large structures are broken down of primitive ways and regulated using smart contracts, we can get make the entire energy network more efficient
and fraud proof. This can also enable small energy players to act in the network and literally save power.<br>

## Concept

We propose to disintegrate large '*do-all*'polies like NEA into different units like a regulatory unit, dritriubutors and energy generators. So there are power plants, distributors 
and consumers in a distribution network which could be regulated by a regulatory unit. 


### Operation 

There must be energy meters( regulated by regulatory unit) to measure energy transfers through each of power plants, distributors and to consumers. The energy meter
must run scripts to transfer the reading to the smart contract which then writes it to the blockchain. <br />

In our demo, we have mocked a distribution network with a power plant (battery), distributor (nothing) and consumer (load). We're calculating energy flow through 
each using voltage and current sensors and sending the value to raspberry pi which then calls the ethereum TestNet contract's functions to write data to blockchain. This happens in
equal time interval( for now its 5 minutes ). <br /> *In real world the energy meter, monitored by regulatory unit would have to run script (as an access point for oracle) *

Actually, in our script the data gets pushed in three parts: 
- First the plants unit reading is pushed through a contract function which also generates equivalent **ERC777** tokens and transfers it to the connected distributor energy-meter's account.
- Then distributor's data is sent. Now, distributor pays for the tokens with **ETHER** as per pre-determined cost. Then compares the obtained units with the transferred token.Tokens transferred from 
the plant would of course be more than the units received as data, and the difference is the *Actual Loss*. Then the units received are converted to tokens and sent to the only consumer. Now, because there's loss of power through transmission
and the distributor has to be compensated for its service so the token's cost increases as per this factor: <br />

  >> (Ideal Loss (%) + Distributor Service Cost (%) ) -  [(Actual Loss (%) - Ideal Loss (%)) if > 0]  * Penalty
  
  <br /> Here token cost has to increase to incorporate the loss and the distributors cost. Then, the distributor would be penalised if the *Actual Loss* goes beyond the *Ideal Voltage Loss* 
 , which is the surveyed loss in that portion. *Actual Loss* being more than the *Ideal Voltage Loss* only means that the distributor is not handling the 
 power properly or is distributing power other than to determined consumer. <br />
 
 - After that the **ETHER** is paid by consumer as per new cost on units used.
 
 In this way, all the transactions are cleared on each lot( here 5 mins). <br />
 In our demo **1 Unit = 0.1 micro KwH**
