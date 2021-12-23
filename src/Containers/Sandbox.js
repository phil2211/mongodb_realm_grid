import React from 'react';
import { AutoComplete } from "antd";
import 'antd/dist/antd.css';

function SearchAutocomplete(props) {
    return (
        <div>
        <AutoComplete
            placeholder="Search Customer"
            onSelect={(v)=>console.log(v)}
            onSearch={(v)=>console.log(v)}
        />
    </div>

    );
}

export default SearchAutocomplete;