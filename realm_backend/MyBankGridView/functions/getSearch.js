exports = function({searchText, startRow, endRow}) {
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
    {$facet: {
     rows: [{ $skip: startRow }, { $limit: endRow-startRow }],
     rowCount: [{ $replaceWith: "$$SEARCH_META" }, { $limit: 1 }]
    }}
  );
  
  searchAgg.push(
    {$project: {
     rows: 1,
     rowCount: {
      $arrayElemAt: [
       "$rowCount.count.lowerBound",
       0
      ]
     }
    }}    
  );
  
  return searchAgg;
};

