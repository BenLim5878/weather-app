import React from 'react';

const GoogleServiceProvider = ({children}) => {
    return (
        <>
            {children}
            <script async defer src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}&libraries=places`}></script>
        </>
    );
};

export default GoogleServiceProvider;
