// import Measurement Schema 
import Measurement from "../../../models/Measurement";
import { PubSub, withFilter } from 'graphql-subscriptions';
const pubsub = new PubSub(); //create a PubSub instance
const TOPIC = 'newMeasurement';
import  myLogger from "../../../index";
export default {
  Query: {

    measurementQuery: (root, args) => {
      myLogger.warn("MEASUREMENT");
      myLogger.group();
      myLogger.log(new Date(Date.now())+" receive measurementQuery");

      // Variablen fuer Querys die das Datum benutzen
      let after = false;
      let before = false;
      let endDate;
      let startDate;

      // Wenn ein Startdatum angegeben ist, Datum zwischenspeichern und aus den Argumenten loeschen
      if (args.startDate != null) {
        after = true;
        startDate = args.startDate;
        delete args.startDate;
      }

      // Wenn ein Enddatum angegeben ist, Datum zwischenspeichern und aus den Argumenten loeschen
      if (args.endDate != null) {
        before = true;
        endDate = args.endDate;
        delete args.endDate;
      }


      return new Promise((resolve, reject) => {
        Measurement.find(args).exec((err, res) => {

          // Loesch alle Ergebnisse raus, die das Startdatum unterschreiten bzw. das Enddatum ueberschreite
          if (after) {
            for (let i = 0; i < res.length; i++) {
              if (res[i].Timestamp < startDate) {
                delete res[i];
              }
            }
          }
          if (before) {
            for (let i = 0; i < res.length; i++) {
              if (res[i] != undefined && res[i].Timestamp > endDate) delete res[i];
            }
          }
          if (err!=null) myLogger.error(new Date(Date.now())+" measurmentQuery Error "+err);
          else myLogger.log(new Date(Date.now())+" succesfully finished measurementQuery");
          myLogger.groupEnd();
          err ? reject(err) : resolve(res);
        });
      });
    }

  },
  Mutation: {
    addMeasurement: (root, { DeviceID, Timestamp, Temperature, Humidity, Brightness }) => {
      myLogger.warn("MEASUREMENT");
      myLogger.group();
      myLogger.log(new Date(Date.now())+" receive addMeasurement ");
      const newMeasurement = new Measurement({ DeviceID, Timestamp, Temperature, Humidity, Brightness });
      pubsub.publish(TOPIC, { measurementAdded: newMeasurement, DeviceID: DeviceID, Temperature: Temperature, Humidity: Humidity, Brightness: Brightness });
      return new Promise((resolve, reject) => {
        newMeasurement.save((err, res) => {
          if (err!=null) myLogger.error(new Date(Date.now())+"addMeasurement Error "+err);
          else myLogger.log(new Date(Date.now())+" succesfully added Measurement");
          myLogger.groupEnd();
          err ? reject(err) : resolve(res);
        });
      });
    }
  },
  Subscription: {
    measurementAdded: {  // create a channelAdded subscription resolver function.
      subscribe: withFilter(
        () => pubsub.asyncIterator(TOPIC),
        (payload, variables) => {
         myLogger.log("Subscription");	
         myLogger.group();
         myLogger.log(new Date(Date.now())+" publish Subscription");
         myLogger.groupEnd();       

          return ((payload.DeviceID === variables.DeviceID) &&
            ((variables.MaxTemperature === undefined && variables.MinTemperature === undefined && variables.MaxBrightness === undefined && variables.MinBrightness === undefined && variables.MaxHumidity === undefined && variables.MinHumidity === undefined)
            ||
            ((payload.Temperature != undefined && variables.MaxTemperature != undefined && payload.Temperature > variables.MaxTemperature)
              || (payload.Temperature != undefined && variables.MinTemperature != undefined && payload.Temperature < variables.MinTemperature))
            ||
		    
            ((payload.Humidity != undefined && variables.MaxHumidity != undefined || payload.Humidity > variables.MaxHumidity)
              || (payload.Humidity != undefined && variables.MinHumidity != undefined || payload.Humidity < variables.MinHumidity))
            ||
            ((payload.Brightness != undefined && variables.MaxBrightness != undefined && payload.Brightness > variables.MaxBrightness)
              || (payload.Brightness != undefined && variables.MinBrightness != undefined && payload.Brightness < variables.MinBrightness))
          
          ))
        }
      )
    }
  }
};

