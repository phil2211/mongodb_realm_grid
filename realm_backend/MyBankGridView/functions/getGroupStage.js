exports = ({valueCols, groupToUse}) => {
  const split = require("lodash/split");
  const last = require("lodash/last");
  const upperFirst = require("lodash/upperFirst");
  
  let project = {};
  let groupId = {};
  let groupBody = {};
  let pipeline = [];
  
  if (groupToUse[0].id === "customerId") {
    pipeline.push({"$unset": "accounts"});
    pipeline.push({"$set": {"accounts.balance": "$totalBalance"}});
  } else {
    project = convertDotPathToNestedObject(groupToUse[0].id, `$_id.${last(split(groupToUse[0].id, '.'))}`);
    groupBody = {};
    valueCols.forEach(element => {
      groupBody = Object.assign(
        groupBody,
        {
          [`total${upperFirst(element.field)}`]: {[`$${element.aggFunc}`]: `$total${upperFirst(element.field)}`}
        });
      project = Object.assign(project, convertDotPathToNestedObject(element.id, `$total${upperFirst(element.field)}`));
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
        "id": "address.country",
        "displayName": "Country",
        "field": "country"
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

exports({valueCols, groupToUse})

*/