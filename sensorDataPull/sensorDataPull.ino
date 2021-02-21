#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

int count = 0;

unsigned long plantTime = 0;
unsigned long plantTime1 = 0;
unsigned long plantTime2 = 0;

const int plantVoltagePin = A0;
const int plantCurrentPin = A1;

const int distributorVoltagePin = A2;
const int distributorCurrentPin = A3;

const int consumerVoltagePin = A4;
const int consumerCurrentPin = A5;

float plantVoltage = 0;
float plantCurrent = 0;

float distributorVoltage = 0;
float distributorCurrent = 0;

float consumerVoltage = 0;
float consumerCurrent = 0;

float inputVoltVal = 0;

int inputCurrentVal = 0;

float totalCurrentVal = 0;

float plantPower = 0;
float energy1 = 0;
float plantEnergy = 0;

float distributorPower = 0;
float energy2 = 0;
float distributorEnergy = 0;

float consumerPower = 0;
float energy3 = 0;
float consumerEnergy = 0;


void setup()
{
  lcd.init();
  lcd.clear();
  Serial.begin(9600);
}

void loop()
{
  plantTime1 = millis();
  
  inputVoltVal = analogRead(plantVoltagePin);
  plantVoltage = (inputVoltVal/1023.0)*24.5;
  
  for (int i = 0; i < 100; i++)
  {
    totalCurrentVal += analogRead(plantCurrentPin);
    delay(3);
  }
  
  inputCurrentVal = totalCurrentVal/100;
  totalCurrentVal = 0;
  
  plantCurrent = (inputCurrentVal * 5000.0) / 1024.0;
  plantCurrent -= 2509.5; //- plantCurrent;
  plantCurrent /= 0.185;
  
  plantPower = plantCurrent * plantVoltage;
  
  
  
  // Start distributor
  inputVoltVal = 0;
  inputCurrentVal = 0;
  
  inputVoltVal = analogRead(distributorVoltagePin);
  distributorVoltage = (inputVoltVal/1023.0)*24.5;
  
  for (int i = 0; i < 100; i++)
  {
    totalCurrentVal += analogRead(distributorCurrentPin);
    delay(3);
  }
  
  inputCurrentVal = totalCurrentVal/100;
  totalCurrentVal = 0;
  
  distributorCurrent = (inputCurrentVal * 5000.0) / 1024.0;
  distributorCurrent -= 2520; //- plantCurrent;
  distributorCurrent /= 0.185;
  
  distributorPower = distributorCurrent * distributorVoltage;
  
  
  
  // Start consumer
  inputVoltVal = 0;
  inputCurrentVal = 0;
  
  inputVoltVal = analogRead(consumerVoltagePin);
  consumerVoltage = (inputVoltVal/1023.0)*24.5;
  
  for (int i = 0; i < 100; i++)
  {
    totalCurrentVal += analogRead(consumerCurrentPin);
    delay(3);
  }
  
  inputCurrentVal = totalCurrentVal/100;
  totalCurrentVal = 0;
  
  consumerCurrent = (inputCurrentVal * 5000.0) / 1024.0;
  consumerCurrent -= 2494; //- plantCurrent;
  consumerCurrent /= 0.185;
  
  consumerPower = consumerCurrent * consumerVoltage;
  
  
  // Calculate all Energy ang send through serial:\
  
  plantTime2 = millis();
  plantTime = plantTime2 - plantTime1;
  
  energy1 = (plantPower * plantTime) / 360000;
  
  if( energy1 < 0 )
  {
    energy1 = 0.00;
  }
  
  plantEnergy += energy1;
  
  
  energy2 = (distributorPower * plantTime) / 360000;
  
  if( energy2 < 0 )
  {
    energy2 = 0.00;
  }
  
  distributorEnergy += energy2;
  
  
  energy3 = (consumerPower * plantTime) / 360000;
  
  if( energy3 < 0 )
  {
    energy3 = 0.00;
  }
  
  consumerEnergy += energy3;
  
  
  Serial.print(energy1);
  Serial.print(" plant\n");
  Serial.print(energy2);
  Serial.print(" distributor\n");
  Serial.print(energy3);
  Serial.print(" consumer\n");
  Serial.println(plantTime);
  
  lcd.backlight();
  
  lcd.setCursor(0,0);
  lcd.print("Plant: ");
  lcd.print(plantEnergy);
  lcd.setCursor(0,1);
  lcd.print("Distributor:");
  lcd.print(distributorEnergy);
}