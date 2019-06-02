export default `

  type Measurement {
    MeasurementID: Int!  
    DeviceID: Int!
    Timestamp: String!
    Temperature: Float
    Humidity: Float
    Brightness: Float
  }
  type Query {
    measurementQuery(DeviceID: Int!): [Measurement]
    
  }
  type Mutation {
  addMeasurement(MeasurementID: Int!,DeviceID: Int!, Timestamp: String!, Temperature: Float, Humidity: Float, Brightness: Float): Measurement
  }
`;