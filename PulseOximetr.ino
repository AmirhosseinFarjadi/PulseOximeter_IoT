#include <Wire.h>
#include "MAX30100_PulseOximeter.h"
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266mDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <ArduinoJson.h>
#include <EEPROM.h>

 
#define REPORTING_PERIOD_MS     1000
 
float  BPM, SpO2;
int LEDGreen = D6; 
int LEDOrange = D7; 
int cnt=0;
int id = 30;
int ledThreshold = 100;
int timeToSleep=0;
/*Put your SSID & Password*/
const char* ssid = "Irancell-TD-GP2101PLUS-5491";  // Enter SSID here
const char* password = "#Amirhosein1378";  //Enter Password here
const char* host = "192.168.1.14";
const int port = 3000;

PulseOximeter pox;

uint32_t tsLastReport = 0;

 
 
void onBeatDetected()
{
  Serial.println("Beat!");
}
    
void setup() {
  
  Serial.begin(115200);
  pinMode(LEDOrange, OUTPUT); // Make LED pin D7 an output pin
  pinMode(LEDGreen, OUTPUT); // Mace LED pin D7 an output pin
  Serial.println("Connecting to ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  //connect to your local wi-fi network
  WiFi.begin(ssid, password);
 
  //check wi-fi is connected to wi-fi network
  while (WiFi.status() != WL_CONNECTED) {
  delay(1000);
  Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected..!");
  Serial.print("Got IP: ");  Serial.println(WiFi.localIP());

  EEPROM.begin(512);

 Serial.print("Initializing pulse oximeter..");
 
  if (!pox.begin()) {
    Serial.println("FAILED");
    for (;;);
  } else {
    Serial.println("SUCCESS");
  }
    pox.setOnBeatDetectedCallback(onBeatDetected);
    
    
  checkUserInput();
  //OTA
  
    ArduinoOTA.onStart([]() {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH) {
      type = "sketch";
    } else { // U_FS
      type = "filesystem";
    }

    // NOTE: if updating FS this would be the place to unmount FS using FS.end()
    Serial.println("Start updating " + type);
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\nEnd");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) {
      Serial.println("Auth Failed");
    } else if (error == OTA_BEGIN_ERROR) {
      Serial.println("Begin Failed");
    } else if (error == OTA_CONNECT_ERROR) {
      Serial.println("Connect Failed");
    } else if (error == OTA_RECEIVE_ERROR) {
      Serial.println("Receive Failed");
    } else if (error == OTA_END_ERROR) {
      Serial.println("End Failed");
    }
  });
  ArduinoOTA.begin();
  Serial.println("Ready");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  EEPROM.begin(512);
     EEPROM.write(0,id);
  if(EEPROM.commit())
Serial.println("\nSleeping time succefully commited");
  EEPROM.end();
}
void Led8(){

  if (pox.getSpO2()==0) 
  {
   digitalWrite(LEDGreen, HIGH); // LED on
   digitalWrite(LEDOrange, LOW); // LED off
   cnt++;


  }else if (pox.getSpO2()<ledThreshold) 
  {
  digitalWrite(LEDOrange, HIGH); // LED on
   digitalWrite(LEDGreen, LOW);
   cnt=0;  
   }
}

 void ServerConnection(){
     WiFiClient client;
  Serial.println("Connecting to host");

  if(!client.connect(host, port)){
    Serial.println("...connection failed!");
    Serial.println("Retrying in 5 seconds...");
    delay(5000);
    return;  
  }

 
   String url = "/";
 Serial.print("Requesting URL: ");
 Serial.println(url);
 String data = "bpm=" + String(pox.getHeartRate()) + "&" + "spo2=" + String(pox.getSpO2());
   Serial.print("Requesting POST: ");
   // Send request to the server:
   client.println("POST / HTTP/1.1");
   client.println("Host: server_name");
   client.println("Accept: *");
   client.println("Content-Type: application/x-www-form-urlencoded");
   client.print("Content-Length: ");
   client.println(data.length());
   client.println();
   client.println(data);
   Serial.println();


 Serial.println();
 Serial.println("closing connection");
} 

void getFromServer()
{

  HTTPClient http;    
  Serial.print("Request Link:");
  Serial.println("http://192.168.43.154:3000/configWemos");
  
  //Specify request destination
  http.begin("http://192.168.43.154:3000/configWemos");     
  int httpCode = http.GET();            //Send the request
  if (httpCode > 0) {
  //parsing
   const size_t bufferSize = JSON_ARRAY_SIZE(1) + JSON_OBJECT_SIZE(1) + 
      2*JSON_OBJECT_SIZE(2) + JSON_OBJECT_SIZE(4) + JSON_OBJECT_SIZE(5) + 
      JSON_OBJECT_SIZE(6) + JSON_OBJECT_SIZE(12) + 390;
  DynamicJsonBuffer jsonBuffer(bufferSize);
  JsonObject& myObject = jsonBuffer.parseObject(http.getString());
  if(myObject["num"]!=0){
  id = myObject["num"];
  ledThreshold = myObject["led"];
  EEPROM.begin(512);
  EEPROM.write(0,id);
  if(EEPROM.commit())
Serial.println("\nEEPROM succefully commited");
  EEPROM.end();
   Serial.print("LED Threshold: ");
  Serial.println(ledThreshold);
  }

  //Serial.println(payload);
  }
  http.end();  //Close connection

  
}

void checkUserInput()
{
  EEPROM.begin(512);
  timeToSleep = EEPROM.read(0);
   Serial.print("This is Time for DeepSleep: ");
  Serial.println(timeToSleep);
  EEPROM.end();
}
 
void loop() {
    ArduinoOTA.handle();
    pox.update();

    
    // Asynchronously dump heart rate and oxidation levels to the serial
    // For both, a value of 0 means "invalid"
    if (millis() - tsLastReport > REPORTING_PERIOD_MS) {
        Serial.print("Heart rate:");
        Serial.print(pox.getHeartRate());
        Serial.print("bpm / SpO2:");
        Serial.print(pox.getSpO2());
        Serial.println("%");

        tsLastReport = millis();
        
        ServerConnection();
        getFromServer();
        Led8();
        checkUserInput();
        
        if(cnt>timeToSleep){
          Serial.println("I am going to sleep!");
          ESP.deepSleep(0);// sleep util external interrupt gives Low signal to RST
          Serial.println("Never reach here!");// in khat hich vaght ejra ne mishe! 
        }
        Serial.print("Time to Sleep : ");
        Serial.print(cnt);
        Serial.println("s");
        
    }
}
