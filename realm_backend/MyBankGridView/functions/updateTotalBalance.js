exports = async function({documentKey}) {
  const collection = context.services.get("mongodb-atlas").db("mybank").collection("customerSingleView");
  return await collection.updateOne({ _id: documentKey._id }, [{"$set": {"totalBalance": {"$sum": "$accounts.balance"}}}]);
};