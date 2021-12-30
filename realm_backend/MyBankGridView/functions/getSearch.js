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
  return searchAgg;
};

