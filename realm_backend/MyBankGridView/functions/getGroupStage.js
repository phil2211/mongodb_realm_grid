exports = ({ valueCols, groupToUse }) => {
  const split = require("lodash/split");
  const last = require("lodash/last");
  
  let project = {};
  let groupId = {};
  let groupBody = {}; 
  
  if (groupToUse[0].id === "customerId") {
    // Use special grouping on Customer-Level to have multiple fields attached
    project = {
      customerId: "$_id.customerId",
      lastName: "$_id.lastName",
      firstName: "$_id.firstName",
      age: "$_id.age",
      crmInformation: {
        segmentation: "$_id.segmentation",
        totalContactsYtd: "$totalContactsYtd"
      },
      address: {
        country: "$_id.country"
      },
      accounts: {
        balance: "$balance"
      }
    }
    
    groupId = {
      customerId: "$customerId",
      lastName: "$lastName",
      firstName: "$firstName",
      age: "$age",
      country: "$address.country",
      segmentation: "$crmInformation.segmentation"
    }
    
    groupBody = {
      "balance": {
        "$sum": "$accounts.balance"
      },
      "totalContactsYtd": {
        "$sum": "$crmInformation.totalContactsYtd"
      }
    }
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
  }

  const pipeline = [
    {"$group": Object.assign({"_id": groupId}, groupBody)},
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
        "id": "accounts.balance",
        "aggFunc": "sum",
        "displayName": "Balance",
        "field": "balance"
    },
    {
        "id": "crmInformation.totalContactsYtd",
        "aggFunc": "sum",
        "displayName": "totalContactsYtd",
        "field": "totalContactsYtd"
    }
]

exports({valueCols, groupToUse})
*/