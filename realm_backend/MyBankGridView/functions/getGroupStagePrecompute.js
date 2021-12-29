exports = ({ valueCols, groupToUse }) => {
  const split = require("lodash/split");
  const last = require("lodash/last");
  const merge = require("lodash/merge");
  
  let project = {};
  let groupId = {};
  let groupBody = {}; 

  project = convertDotPathToNestedObject(groupToUse[0].id, `$_id.${last(split(groupToUse[0].id, '.'))}`);

  // create all valueColums to calculate by the aggFunc set in Grid
  // see GridOptions.js in client code
  groupBody = {};
  valueCols.forEach(element => {
    // if we have expectation for nested return, we need to nest them again because
    // group will return un-nested values
    project = merge(project, convertDotPathToNestedObject(element.id, `$${last(split(element.id, '.'))}`))
    groupBody = merge(groupBody,{[element.field]: {[`$${element.aggFunc}`]: `$${element.id}`}});
  });
  
  // set group by objects
  groupId = {[last(split(groupToUse[0].id, '.'))]: `$${groupToUse[0].id}`};

  const pipeline = [
    {"$group": merge({"_id": groupId}, groupBody)},
    {"$set": project}
  ];
  
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

const groupToUse= [
    {
        "id": "age",
        "displayName": "Age",
        "field": "age"
    }
]

const valueCols = [
    {
        "id": "totalBalance",
        "aggFunc": "sum",
        "displayName": "Total Balance",
        "field": "totalBalance"
    }
]

exports({valueCols, groupToUse})
*/