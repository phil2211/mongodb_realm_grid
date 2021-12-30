exports = function({searchText, startRow, endRow, valueCols}) {
  const forEach = require("lodash/forEach");
  const searchAgg = [];
  
  searchAgg.push(
    { $search: {
      compound: {
        should: [
         {
          text: {
           query: searchText,
           path: 'lastName',
           score: {
            boost: {
             value: 15
            }
           },
           fuzzy: {
            maxEdits: 1,
            maxExpansions: 100
           }
          }
         },
         {
          text: {
           query: searchText,
           path: [
            {
             wildcard: 'address*'
            },
            {
             wildcard: 'contact*'
            }
           ],
           score: {
            boost: {
             value: 3
            }
           }
          }
         }
        ],
        minimumShouldMatch: 1
       }
    }});

  return searchAgg;
};

