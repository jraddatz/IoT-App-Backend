export default `

  type Measurement {
    MeasurementID: ID!  
    DeviceID: Int!
    Timestamp: String!
    Temperature: Float
    Humidity: Float
    Brightness: Float
  }
  type Query {
    measurementQuery(DeviceID: ID!): [Measurement]
    
  }
  type Mutation {
  addMeasurement(DeviceID: ID!, Timestamp: String!, Temperature: Float, Humidity: Float, Brightness: Float): Measurement
  }
`;
