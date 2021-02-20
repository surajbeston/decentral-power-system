import serial
import time

import json
from web3 import Web3
import threading

infura_url = "https://kovan.infura.io/v3/51ee58fc0fa94ed29565e741714bf9ef"
web3 = Web3(Web3.HTTPProvider(infura_url))

contractAddress = "0x6D84B78870D93080C637a9B27B1Ebac3BE0d3A12"

abi_file = open("/home/pi/power.json")
abi = json.loads(abi_file.read())

contract = web3.eth.contract(address=contractAddress, abi=abi)

control_available = True
lot = 0
last_entity = 0

plant_value = 0
distributor_value = 0
consumer_value = 0

def plant():
    print ("MINING FOR PLANT STARTED")
    public_key = "0x172CdCE74e56544df20138Fc721E1932603f9E0f"
    private_key = "c6349e6e99e29575f024c93ce77053a910ab1f94a24df3ad6644cb3ae08ac405"

    nonce = web3.eth.getTransactionCount(public_key)

    transaction = contract.functions.mineTokenPlant(
        200, "0xEDe0a403609bfDc96b5294436CDb51A4F1bD94C7").buildTransaction({
            'gas': 8000001,
            'from': public_key,
            'nonce': nonce
        })
    signed_txn = web3.eth.account.signTransaction(transaction, private_key=private_key)
    web3.eth.sendRawTransaction(signed_txn.rawTransaction)
    print ("MINING FOR PLANT ENDED")

def distributor():
    print ("TRANSFERRING FOR DISTRIBUTOR STARTED")
    public_key = "0xEDe0a403609bfDc96b5294436CDb51A4F1bD94C7"
    private_key = "b60a8c1ad0fea346478b5b035ceae73abda9b3c14243c350476fd11eacad2876"

    nonce = web3.eth.getTransactionCount(public_key)

    transaction = contract.functions.evaluateTokenDistributor(
        180, "0xedB1DB9cb450515b28c5518B333C577994586Da5", "0x172CdCE74e56544df20138Fc721E1932603f9E0f").buildTransaction({
        'gas': 7000000,
        'value': 10**11,
        'from': public_key,
        'nonce': nonce
        })
    signed_txn = web3.eth.account.signTransaction(transaction, private_key=private_key)
    web3.eth.sendRawTransaction(signed_txn.rawTransaction)
    print ("TRANSFERRING FOR DISTRIBUTOR ENDED")

def consumer():
    print ("DESTROYING FOR CONSUMER STARTED")
    public_key = "0xedB1DB9cb450515b28c5518B333C577994586Da5"
    private_key = "7e0f3c692a484ecefdae95fca723a17aa455adc80ef6aafd30884c99bd43a010"
    nonce = web3.eth.geAtTransactionCount(public_key)

    transaction = contract.functions.evaluateTokenConsumer(
        160, "0xEDe0a403609bfDc96b5294436CDb51A4F1bD94C7").buildTransaction({
        'gas': 7000000,
        'value': 10**11,
        'from': public_key,
        'nonce': nonce
        })
    signed_txn = web3.eth.account.signTransaction(transaction, private_key=private_key)
    web3.eth.sendRawTransaction(signed_txn.rawTransaction)
    print ("DESTROYING FOR CONSUMER ENDED")

def readSerial(event):
    global plant_value
    global distributor_value 
    global consumer_value
    while True:
        if sercom.in_waiting > 0:
            val = sercom.readline().decode('utf-8')
            val = val.split(" ")
            try:
                if (val[1] == "plant\n"):
                    plant_value += float(val[0])
                elif (val[1] == "distributor\n"):
                    distributor_value += float(val[0])
                else :
                    consumer_value += float(val[0])
            except ValueError:
                pass


def handle_event(event):
    receipt = web3.eth.waitForTransactionReceipt(event['transactionHash'])
    result = contract.events.EnergyTokenAltered().processReceipt(receipt)

    entity = result[0]['args']['entity']
    currentLot = result[0]['args']['currentLot']

    global control_available
    global lot
    global last_entity
    print ("Outside - {}: Entity, {}: Lot,  {}: control_available ".format(result[0]['args']['entity'], currentLot, control_available))
    
    if control_available and entity > last_entity:
        lot = currentLot 
        last_entity= entity
        print ("\n Inside - {}: Lot, {}: entity\n".format(lot, entity))
        control_available = False
        if entity == 1:
            distributor()
        elif entity == 2:
            consumer()
        control_available = True            

def log_loop(event_filter, poll_interval):
    while True:
        for event in event_filter.get_new_entries():
            handle_event(event)
            time.sleep(poll_interval)
        
sercom = serial.Serial('/dev/ttyUSB0', 9600, timeout=1)
sercom.flush()

event = threading.Event()

thread = threading.Thread(target = readSerial, args = (event,))

thread.start()

# block_filter = web3.eth.filter({'fromBlock':'latest', 'address':contractAddress})
# log_loop(block_filter, 2)
