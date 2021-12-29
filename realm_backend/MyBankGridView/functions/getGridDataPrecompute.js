exports = async ({ startRow, endRow, rowGroupCols=[], groupKeys=[], valueCols=[], sortModel=[], searchText=""}) => {
  
  const forEach = require("lodash/forEach");
  
  const cluster = context.services.get("mongodb-atlas");
  const collection = cluster.db("mybank").collection("customerSingleView");
  // find out about the lowest level of grouping and take this to create
  // group stage in aggregation pipeline
  const groupToUse = rowGroupCols.slice(groupKeys.length, groupKeys.length + 1);

  const agg = [];
  
  // build different aggregation when using search
  if(searchText.length > 0 && rowGroupCols.length > 0 && rowGroupCols.length > groupKeys.length) {
    forEach(context.functions.execute('getSearch', {searchText, startRow, endRow}), (element) => agg.push(element));
  }
  
  if(groupKeys.length > 0) {
    //generate match in grouping case and translate between string and int (because GraphQL schema in Realm only supports exactly one datatype as input)
    agg.push(context.functions.execute('getMatchStage', {rowGroupCols, groupKeys: groupKeys.map(key => isNaN(key) ? key : parseInt(key))}));
  }
  
  //set grouping if required
  if (rowGroupCols.length > 0 && rowGroupCols.length > groupKeys.length) {
    forEach(context.functions.execute('getGroupStagePrecompute', {valueCols, groupToUse}), (element) => agg.push(element));
  }
  
  agg.push({
    $sort: sortModel.length <= 0 ? {_id:1} : context.functions.execute('getSortStage', sortModel)
  });
  
  agg.push({
    $facet: {
      rows: [{"$skip": startRow}, {"$limit": endRow-startRow}],
      rowCount: [{$count: 'lastRow'}]
    }
  });

  agg.push({
    $project: {
      rows: 1,
      query: JSON.stringify(agg),
      lastRow: {"$ifNull": [{$arrayElemAt: ["$rowCount.lastRow", 0]}, 0]}
    }
  });
  
  console.log(JSON.stringify(agg, null, ' '));
  
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
  }
]

const groupKeys = [
]

const valueCols = [
  {
    "id": "totalBalance",
    "aggFunc": "sum",
    "displayName": "Total Balance",
    "field": "totalBalance"
  }
]

exports(
  {
    startRow: 0, 
    endRow: 5,
    rowGroupCols,
    groupKeys, 
    valueCols
  }  
)
*/
 