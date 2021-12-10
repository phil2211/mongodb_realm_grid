exports = async ({ startRow, endRow, rowGroupCols=[], groupKeys=[], valueCols=[], sortModel=[] }) => {
  
  const forEach = require("lodash/forEach");
  const last = require("lodash/last");
  
  const cluster = context.services.get("mongodb-atlas");
  const collection = cluster.db("mybank").collection("customerSingleView");
  
  const agg = [];
  
  // find out about the lowest level of grouping and take this to create
  // group stage in aggregation pipeline
  const groupToUse = rowGroupCols.slice(groupKeys.length, groupKeys.length + 1);
  
  if(groupKeys.length > 0) {
    //generate match in grouping case and translate between string and int (because GraphQL schema in Realm only supports exact one datatype as input)
    agg.push(context.functions.execute('getMatchStage', {rowGroupCols, groupKeys: groupKeys.map(key => isNaN(key) ? key : parseInt(key))}));
  }
  
  agg.push({
    $sort: sortModel.length <= 0 ? {_id:1} : context.functions.execute('getSortStage', sortModel)
  });

  if (groupKeys.length > 0 && last(rowGroupCols).id === "customerId") {
    agg.push(
      { $unwind: {
          path: "$accounts",
          preserveNullAndEmptyArrays: false
      }}
    );
  }

  //set grouping if required
  if (rowGroupCols.length > 0 && rowGroupCols.length > groupKeys.length) {
    forEach(context.functions.execute('getGroupStage', {rowGroupCols, valueCols, groupToUse}), (element) => agg.push(element));
  }
  
  agg.push({
    $facet: {
      rows: [{"$skip": startRow}, {"$limit": endRow-startRow}],
      //rowCount: [{$count: 'lastRow'}]
    }
  });

  agg.push({
    $project: {
      rows: 1,
      lastRow: {$arrayElemAt: ["$rowCount.lastRow", 0]}
    }
  });
  
  console.log(JSON.stringify(agg));
  
  return await collection.aggregate(agg, {allowDiskUse: true}).next();
}

/** 
 * TESTDATA
 * copy this to console section
 *

const rowGroupCols= [
    {
        "id": "age",
        "displayName": "Age",
        "field": "age"
    },
    {
        "id": "customerId",
        "displayName": "Customer",
        "field": "customer"
    }
]

const groupKeys = [
    48
]

const sortModel = [
  {
    "sort": "DESC",
    "colId": "accounts.balance"
  }
]

const valueCols = [
    {
        "id": "accounts.balance",
        "aggFunc": "sum",
        "displayName": "Balance",
        "field": "balance"
    }
]


exports(
  {
    startRow: 0, 
    endRow: 1,
    rowGroupCols,
    groupKeys, 
    valueCols,
    sortModel
  }  
)
*/
 