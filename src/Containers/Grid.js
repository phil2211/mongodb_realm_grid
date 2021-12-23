import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { debounce } from "lodash";
import Button from "@leafygreen-ui/button";
import TextInput from '@leafygreen-ui/text-input';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";

import GridOptions from './GridOptions';
import ApolloClientWrapper from '../lib/graphql/ApolloClientWrapper';
import { createServerSideDatasource } from "../lib/graphql/gridDatasource";
import { useRealmApp } from "../RealmApp";

const formatCurrency = (params) => {
    return new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(params.value);
}

const formatNumber = (value) => {
    return new Intl.NumberFormat('de-DE').format(value);
}


const Grid = ({ client }) => {
    const app = useRealmApp();
    const [gridApi, setGridApi] = useState(null);
    const [totalRows, setTotalRows] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [user] = useState(app.currentUser);
    const { role } = user.customData;

    const debouncedSearch = debounce(setSearchText, 500);

    const columnDefs = [
        { 
            field: "customer",
            colId: "customerId",
            valueGetter: "data.customerId",
            type: "dimension",
            rowGroup: true,
            hide: true
        },
        { field: "lastName", type: "detail" },
        { field: "firstName", type: "detail" },
        { field: "age", type: role==="user"?"detail":"dimension" },
        { field: "country", colId: "address.country", type: role==="user"?"detail":"dimension", valueGetter: "data.address.country"},
        { field: "segment", colId: "crmInformation.segmentation", type: role==="user"?"detail":"dimension", valueGetter: "data.crmInformation.segmentation", hide: role === "user" },
        { field: "account", colId: "accounts.number", valueGetter: "data.accounts.number"},
        { 
            field: "balance", 
            colId: "accounts.balance",
            valueGetter: "data.accounts.balance", 
            valueFormatter: formatCurrency,
            type: "valueColumn",
            cellClassRules: {
                "rag-red": params => params.value <= 0,
                "rag-green": params => params.value > 0
            }
        }
    ]
    const gridOptions = Object.assign(GridOptions, { columnDefs });

    useEffect(() => {
        if(gridApi) {
            onGridReady(gridApi, searchText);
        }
    }, [searchText]);

    const onGridReady = (params, searchText) => {
        setGridApi(params);
        params.api.sizeColumnsToFit();
        const datasource = createServerSideDatasource({ client, searchText });
        params.api.setServerSideDatasource(datasource);
    }

    const onModelUpdate = (params) => {
        setTotalRows(params.api.getDisplayedRowCount());
    }

    console.log(user);

    return (
        <>       
        {user.customData.role !== "user" &&
            <TextInput
                type="search"
                placeholder="Search for customer..."
                onChange={event => debouncedSearch(event.target.value)}
            />}
        <div         
            style={{ height: "calc(100vh - 250px)" }}
            className="ag-theme-alpine"
        >
            <AgGridReact
                gridOptions={gridOptions}
                onGridReady={onGridReady}
                onModelUpdated={onModelUpdate}
            />
        </div>
        <div style={{margin: 10}}>
            <p>{`Total Results: ${formatNumber(totalRows)}`}</p>
            <p>User: {user.id ? `${user.profile.name} (${user.providerType})` : "not logged in"}</p>
            <p>{`Role: ${role}`}</p>
            <Button variant="primary" onClick={() => app.logOut()}>Logout</Button>
        </div>
        </>
    )
}

export default ApolloClientWrapper(Grid);