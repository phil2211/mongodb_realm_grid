exports = function(changeEvent) {
  const sumBy = require("lodash/sumBy");
  const { fullDocument, documentKey } = changeEvent;
  const totalBalance = sumBy(fullDocument.accounts, 'balance');
  
  console.log(JSON.stringify(fullDocument));
  
  const collection = context.services.get("mongodb-atlas").db("mybank").collection("customerSingleView");
  return collection.updateOne({ _id: documentKey._id }, {"$set": {totalBalance}});
};

/* Testdata
{ 
  fullDocument: {"_id":"464.237.688-70","lastName":"Royer","firstName":"Milton","consultantId":{"$numberInt":"813"},"age":{"$numberLong":"21"},"birthdate":{"$date":{"$numberLong":"973432766009"}},"profession":"System Engineer","address":{"street":"Ajfir Heights","zip":"72646","city":"Juawasi","country":"Palau"},"contact":{"email":[],"phone":[{"number":"06 24 78 92 39","type":"business"},{"number":"07 90 10 32 75","type":"private"}]},"crmInformation":{"segmentation":"non-customer","lastPhysicalContactDate":{"$date":{"$numberLong":"1565135510233"}},"totalPhysicalContactsLastYearPeriod":{"$numberInt":"10"},"lastVirtualContactDate":{"$date":{"$numberLong":"1138564228717"}},"totalVirtualContactsLastYearPeriod":{"$numberInt":"14"},"totalContactsYtd":{"$numberInt":"49"}},"accounts":[{"number":"590-15-6119","type":"account","balance":{"$numberLong":"-66704"},"name":"Ho guukaka finisud lojvenul."},{"number":"480-69-2516","type":"depot","balance":{"$numberLong":"20599"},"name":"Tofahun fa ekcu tiha oskilfof."},{"number":"773-19-7935","type":"depot","balance":{"$numberLong":"26751"},"name":"Zowjaddut tabewe."},{"number":"451-23-8353","type":"loan","balance":{"$numberLong":"74427"},"name":"Jukcoz."},{"number":"486-38-8297","type":"depot","balance":{"$numberLong":"95440"},"name":"Eshup mezul pasvi."},{"number":"326-05-8377","type":"loan","balance":{"$numberLong":"50734"},"name":"Kow."},{"number":"584-47-0883","type":"account","balance":{"$numberLong":"39221"},"name":"Del."},{"number":"954-07-1848","type":"account","balance":{"$numberLong":"52230"},"name":"Lokne ba decveci naimi."},{"number":"845-37-3237","type":"depot","balance":{"$numberLong":"75059"},"name":"Eles zob nu kaz."}],"totalBalance":{"$numberLong":"367755"},"customerId":"464.237.688-70","consultant":{"_id":{"$numberInt":"813"},"lastName":"Arnaud","firstName":"Francis","rating":"junior","location":[{"$numberDouble":"5.43609"},{"$numberDouble":"48.75652"}]}},
  documentKey: {"_id": "464.237.688-70"}
}

*/