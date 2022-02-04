exports = function(changeEvent) {
  const sumBy = require("lodash/sumBy");
  const { fullDocument, documentKey } = changeEvent;
  const totalBalance = sumBy(fullDocument.accounts, "balance");
  
  const collection = context.services.get("mongodb-atlas").db("mybank").collection("customerSingleView");
  return collection.updateOne({ _id: documentKey._id }, {"$set": {totalBalance}});
};
