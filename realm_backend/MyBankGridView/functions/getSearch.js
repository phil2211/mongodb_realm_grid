exports = function({searchText, startRow, endRow, valueCols}) {
  const forEach = require("lodash/forEach");
  const searchAgg = [];
  
  searchAgg.push(
    { $search: {
     index: 'customer_autocomplete',
     compound: {
      should: [
       {
        autocomplete: {
         query: searchText,
         path: 'lastName',
         score: {
          boost: {
           value: 5
          }
         },
         fuzzy: {
          maxEdits: 1
         }
        }
       },
       {
        autocomplete: {
         query: searchText,
         path: 'firstName',
         fuzzy: {
          maxEdits: 1
         }
        }
       },
       {
        autocomplete: {
         query: searchText,
         path: 'address.street',
         fuzzy: {
          maxEdits: 1
         }
        }
       },
       {
        autocomplete: {
         query: searchText,
         path: 'address.country'
        }
       }
      ],
      minimumShouldMatch: 1
     }
    }}
  );
  
  searchAgg.push(
      { $unwind: {
          path: "$accounts",
          preserveNullAndEmptyArrays: false
      }}
    );
  
  const groupToUse = [
    {
        "id": "customerId",
        "displayName": "Customer",
        "field": "customer"
    }];
  forEach(context.functions.execute('getGroupStage', {valueCols, groupToUse}), (element) => searchAgg.push(element));
  
  searchAgg.push(
    {$facet: {
     rows: [{ $skip: startRow }, { $limit: endRow-startRow }],
     rowCount: [{$count: 'lastRow'}]
     //rowCount: [{ $replaceWith: "$$SEARCH_META" }, { $limit: 1 }]
    }}
  );
  
  searchAgg.push(
    {$project: {
     rows: 1,
     query: JSON.stringify(searchAgg),
     lastRow: {$arrayElemAt: ["$rowCount.lastRow", 0]}
     //rowCount: {
      //$arrayElemAt: [
      // "$rowCount.count.lowerBound",
       //0
      //]
     //}
    }}    
  );
  
  return searchAgg;
};

