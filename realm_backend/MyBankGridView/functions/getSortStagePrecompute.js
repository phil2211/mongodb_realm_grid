exports = function(sortModel) {
  let mongoSortObject = {};
  sortModel.forEach(element => {
    mongoSortObject = Object.assign(mongoSortObject, {[element.colId === "accounts.balance" ? "totalBalance" : element.colId]:element.sort==="asc"?1:-1});
  });
  mongoSortObject = Object.assign(mongoSortObject, {_id: 1});
  return mongoSortObject;
};

/*
Testdata
========
const sortModel=[
  {
    "sort": "DESC",
    "colId": "accounts.balance"
  }
]

exports(sortModel)
*/