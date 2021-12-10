exports = ({rowGroupCols, valueCols, groupToUse}) => {
  const split = require("lodash/split");
  const last = require("lodash/last");
  
  let project = {};
  let groupId = {};
  let groupBody = {};
  let pipeline = [];
  
  if (groupToUse[0].id === "customerId") {
    pipeline.push({"$unset": "accounts"});
    pipeline.push({"$set": {"accounts.balance": "$totalBalance"}});
  } else {
    project = convertDotPathToNestedObject(groupToUse[0].id, `$_id.${last(split(groupToUse[0].id, '.'))}`);
  
    // create all valueColums to calculate by the aggFunc set in Grid
    // see GridOptions.js in client code
    groupBody = {};
    valueCols.forEach(element => {
      if (groupToUse[0].id === "customerId" || element.aggFunc !== "first") {
        // if we have expectation for nested return, we need to nest them again because
        // group will return un-nested values
        project = Object.assign(project, convertDotPathToNestedObject(element.id, `$${last(split(element.id, '.'))}`));
        groupBody = Object.assign(
          groupBody,
          {
            [element.field]: {[`$${element.aggFunc}`]: `$${element.id}`}
          });
      }
    });
    
    // set group by objects
    groupId = {[last(split(groupToUse[0].id, '.'))]: `$${groupToUse[0].id}`};
    pipeline.push({"$group": Object.assign({"_id": groupId}, groupBody)});
    pipeline.push({"$set": project});
  }

  return pipeline;
};

//help to renest values from dot-format
function convertDotPathToNestedObject(path, value) {
  const [last, ...paths] = path.split('.').reverse();
  return paths.reduce((acc, el) => ({ [el]: acc }), { [last]: value });
}



/*
Testdata
========

const groupToUse = [
    {
        "id": "customerId",
        "displayName": "Customer",
        "field": "customer"
    }
]

const rowGroupCols= [
    {
        "id": "age",
        "displayName": "Age",
        "field": "age"
    },
    {
        "id": "country",
        "displayName": "Country",
        "field": "country"
    },
    {
        "id": "_id",
        "displayName": "Customer",
        "field": "customer"
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

exports({rowGroupCols, valueCols, groupToUse})

*/