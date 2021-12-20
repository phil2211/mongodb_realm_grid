exports = function() {
    const collection = context.services.get("mongodb-atlas").db("mybank").collection("customerSingleView");
    const doc = collection.updateMany(
      {}, 
      [{ $set: 
        { age: 
          { $subtract: 
            [ { $dateDiff: { startDate: "$birthdate", endDate: "$$NOW", unit: "year" } },
              { $cond:[
                { $gt: [ 0, { $subtract: [{ $dayOfYear: "$$NOW"}, { $dayOfYear: "$birthdate" }] } ] },
                1,
                0
              ]
            }
          ]
        }
      }
    }]);
    
    return doc;
};
