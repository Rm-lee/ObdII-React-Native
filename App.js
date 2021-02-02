/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from "react";
import {
  PermissionsAndroid,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  StatusBar,
  Button,
  TouchableOpacity,
} from "react-native";

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from "react-native/Libraries/NewAppScreen";
import RNBluetoothClassic, {
  BluetoothDevice,
} from "react-native-bluetooth-classic";

const App = () => {
  const [devices, setDevices] = useState([]);
  const [unpaired, setUnpaired] = useState([]);
  const [connected, setConnected] = useState();
  const [data, setData] = useState([]);
const[device,setDevice] = useState()
const [connectionOptions,setConnectionOptions]= useState({DELIMITER:'\n'})
const[connection,setConnection]=useState(false)
const [value, onChangeText] = React.useState('');



let polling = false
  async function getBonded() {
    try {
      let paired = await RNBluetoothClassic.getBondedDevices();
      setDevices(paired);
    } catch (err) {
      console.log(err);
      // Error if Bluetooth is not enabled
      // Or there are any issues requesting paired devices
    }
  }
  async function getConnected() {
    try {
      let connectedd= await RNBluetoothClassic.getConnectedDevices();
      setConnected(connectedd)
    } catch (err) {
      console.log(err);
      // Error if Bluetooth is not enabled
      // Or there are any issues requesting paired devices
    }
  }
  async function requestAccessFineLocationPermission() {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Access fine location required for discovery",
        message:
          "In order to perform discovery, you must enable/allow " +
          "fine location access.",
        buttonNeutral: 'Ask Me Later"',
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  async function connect(device) {
    console.log(device)
    try {
      let connection = await device.isConnected();
      console.log(connection)
      if (!connection) {
       console.log({
          data: `Attempting connection to ${device.address}`,
          timestamp: new Date(),
          type: 'error',
        });

        connection = await device.connect(
          connectionOptions
        );

        addData({
          data: 'Connection successful',
          timestamp: new Date(),
          type: 'info',
        });
      } else {
        addData({
          data: `Connected to ${device.address}`,
          timestamp: new Date(),
          type: 'error',
        });
      }
      setDevice(device)
      setConnection({ connection });
      if(connection){
        // setPolling(true)
        polling = true
        initializeRead(device);
      }
    } catch (error) {
      addData({
        data: `Connection failed: ${error.message}`,
        timestamp: new Date(),
        type: 'error',
      });
    }
  }
  let disconnectSubscription
 let readInterval
 let readSubscription
  function initializeRead(device) {
    // disconnectSubscription = RNBluetoothClassic.onDeviceDisconnected(() => disconnect(true));

    // if (polling) {
    //    readInterval = setInterval(() => performRead(device),50);
    // }else{
      device.onDataReceived(data =>{
         onReceivedData(data)
        console.log(`${JSON.stringify(data)} readSub`)}
      );
      // }
  }
  async function onReceivedData(event) {
    event.timestamp = new Date();
    console.log(event)
    addData({
      ...event,
      timestamp: new Date(),
      type: 'receive',
    });
  }

  async function addData(message) {
    setData([message, ...data] );
  }

 function clearScreen(){
   setDevices([])
 }

  // async function startRead(addr) {
  //   try {
  //     let message = await addr.read();
  //     setData(message.data);
  //     console.log(message);
  //   } catch (error) {
  //     // Handle error accordingly
  //     console.log(error);
  //   }
  // }
  // async function startReadData (addr) {
  //   console.log("srd")
  //   //  let con = await RNBluetoothClassic.connect(addr)
  //   //  con
  //    setDevice(addr)
  //    performRead()
     
     
  // }
async function writeData(towrite){
  console.log(`sending value ${towrite}`)
  let message = towrite + '\r'
  await device.write(
   
    message
  );
}
  async function performRead(device) {
    try {
      console.log('Polling for available messages');
      let available = device.available();
      console.log(`There is data available [${JSON.stringify(available)}], attempting read`);
      
        
          let data = await device.read();

          console.log(`Read data ${data}`);
          onReceivedData({ data });
        
      
    } catch (err) {
      console.log(err);
    }
  }

  // /**
  //  * Handles the ReadEvent by adding a timestamp and applying it to
  //  * list of received data.
  //  *
  //  * @param {ReadEvent} event
  //  */
  // async function onReceivedData(event) {
  //   event.timestamp = new Date();
  //   addData({
  //     ...event,
  //     timestamp: new Date(),
  //     type: 'receive',
  //   });
  // }

  // async function addData(message) {
  //   setData([ message, ...data] );
  // }





useEffect(() => {
  console.log(data)
}, [data])
  startDiscovery = async () => {
    try {
      let granted = await requestAccessFineLocationPermission();

      if (!granted) {
        throw new Error(`Access fine location was not granted`);
      }

      let devicess = [];
      try {
        let unpaired = await RNBluetoothClassic.startDiscovery();
        let index = devicess.findIndex((d) => !d.bonded);
        if (index >= 0) {
          devicess.splice(index, devicess.length - index, ...unpaired);
          console.log(unpaired);
        } else devicess.push(...unpaired);
        devicess = unpaired;
        console.log({
          text: `Found ${unpaired.length} unpaired devices.`,
          duration: 2000,
        });
      } finally {
        setDevices(devicess);
      }
    } catch (err) {
      console.log({
        text: err.message,
        duration: 20009,
      });
    }
  };
  cancelDiscoverys = async () => {
    try {
      let cancelled = await RNBluetoothClassic.cancelDiscovery();
      cancelled;
      console.log(cancelled);
    } catch (error) {
      console.log({
        text: `Error occurred while attempting to cancel discover devices`,
        duration: 2000,
      });
    }
  };

  useEffect(() => {

    return () => {
      cancelDiscoverys();
    };
  }, []);
useEffect(() => {
  console.log(connected)
}, [connected])
  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{flex:1}}>
        <ScrollView
        style={styles.scrollView}>
          {devices &&
            devices.map((device) => (
              <View key={device.address}
                style={styles.deviceContainer}
                >
                <Text
                  onPress={() => {
                    setDevice(device)
                    connect(device)
                    // RNBluetoothClassic.pairDevice(device.address);
                    
                  }}
                  style={{ color: "#00F" }}
                >
                  {device.name}
                </Text>
                <Text>{device.address}</Text>
              </View>
            ))}
          {/* {unpaired &&
            unpaired.map((device) => (
              <View
              style={styles.deviceContainer}
                key={device.address}
                onPress={() => {
                  startReadData(device.address);
                  console.log("test")
                }}
              >
                <Text>{device.name}</Text>
                <Text>{device.address}</Text>
              </View>
            ))} */}
          {data && 
          data.map(data => (
            <View>
              <Text>{data.data}</Text>
            </View>
          ))}
        </ScrollView>
        <View>
          <Button
          onPress={() => getBonded()}
          title="Get Bonded Devices"
          />
        </View>
        <View>
          <Button
          onPress={() => getConnected()}
          title="Get Connected Devices"
          />
        </View>
        <View>
        <TextInput
      style={{ height: 50, backgroundColor:"lightgrey",borderColor: 'gray', borderWidth: 1 }}
      onChangeText={text => onChangeText(text)}
      value={value}
    />
    <Button 
     onPress={() => writeData(value)}
     title="Send"
     />
        </View>
        <View style={{flexDirection:"row",justifyContent:"space-evenly"}}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => cancelDiscoverys()}
          ><Text>Cancel Search</Text>
          </TouchableOpacity>
        
        
          <TouchableOpacity
            style={styles.button}
            onPress={() => startDiscovery()}
          ><Text>Find Devices</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    
  },
  button: {
    backgroundColor:"dodgerblue",
    height:40,
    alignItems: "center",
    justifyContent:"center",
    margin:5,
    borderRadius:5,
    width:"45%",
    
  },
  deviceContainer: {
    flexDirection:"row",
    
    margin:2,
    backgroundColor:"lightblue",
    color: "#00F",
    justifyContent:"space-between",
    padding:4,
  }
    // engine: {
  //   position: "absolute",
  //   right: 0,
  // },
  // body: {
  //   backgroundColor: Colors.white,
  // },
  // sectionContainer: {
  //   marginTop: 32,
  //   paddingHorizontal: 24,
  // },
  // sectionTitle: {
  //   fontSize: 24,
  //   fontWeight: "600",
  //   color: Colors.black,
  // },
  // sectionDescription: {
  //   marginTop: 8,
  //   fontSize: 18,
  //   fontWeight: "400",
  //   color: Colors.dark,
  // },
  // highlight: {
  //   fontWeight: "700",
  // },
  // footer: {
  //   color: Colors.dark,
  //   fontSize: 12,
  //   fontWeight: "600",
  //   padding: 4,
  //   paddingRight: 12,
  //   textAlign: "right",
  // },
  
});

export default App;
