import { RealmLogoLockup, AtlasLogoLockup, RealmLogoMark } from '@leafygreen-ui/logo';
import * as React from 'react';
import agGridLogo from '../Assets/ag-grid-logo.png';
import reactLogo from '../Assets/react-logo.png';

const Header = () => {
    return (
        <div style={{margin: 20}}>
            <AtlasLogoLockup />
            <span style={{marginRight: 20}} />
            <RealmLogoLockup />
            <span style={{marginRight: 20}} />
            <img src={agGridLogo} style={{height: "20px", paddingBottom: 8}} />
            <span style={{marginRight: 20}} />
            <img src={reactLogo} height="35px" />
        </div>
        
    );
};

export default Header;