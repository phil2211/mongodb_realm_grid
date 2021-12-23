import { gql } from "@apollo/client";

export const createServerSideDatasource = ({ client, searchText='' }) => {
    return {
        getRows: (params) => {
            console.log(params, searchText);
            const { startRow, endRow, rowGroupCols, groupKeys, valueCols, sortModel } = params.request;
            sortModel.map(model => model.sort = model.sort.toUpperCase());

            const customerGroup = `
            accounts {
                number
                balance
            `;

            const allGroups = `
            customerId
            lastName
            firstName
            age
            address {
                country
            }
            crmInformation {
                segmentation
            }
            accounts {
                number
                balance
            `;

            const query = { 
                query: gql`
                    query getGridData($queryModelInput:GridQueryModel) {
                        getGridData(input: $queryModelInput) {
                            lastRow
                            query
                            rows {
                                ${rowGroupCols.length > 0 && rowGroupCols.length === groupKeys.length ? customerGroup : allGroups}
                            }
                        }
                    }
                }
                `,
                variables: {
                    "queryModelInput" : {
                        startRow,
                        endRow,
                        rowGroupCols,
                        groupKeys,
                        valueCols,
                        sortModel,
                        searchText
                    }
                }
            };

            client.query(query)
            .then(res => res.data.getGridData)
            .then(({ lastRow, rows }) => {
                params.successCallback(rows, lastRow)
            })
            .catch(err => {
                console.error(err);
                params.failCallback();
            })
        }
    }
}