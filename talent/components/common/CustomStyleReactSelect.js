'use client';

export const ReactSelectStyles = {

    input: (props) => ({
        ...props,
        height: '2.8125rem',
        padding: "0.8125rem 1rem",
        borderRadius: "8px",
    }),
    multiValue: (styles, { data }) => {
        return {
            ...styles,
            backgroundColor: '#FFF8D6',
            padding: "0.375rem 0.875rem"
        };
    },

    option: (styles, { isSelected }) => ({
        ...styles,
        color: isSelected ? 'black' : '',
        fontWeight: isSelected ? 500 : ''
    }),
}
export const customSelectTheme = (theme) => ({
    ...theme,
    colors: {
        ...theme.colors,
        primary: '#fad330',
        primary25: '#FFF8D6',
        primary50: '#FFF8D6',
        primary75: '#0ff'
    },
})

export const PreferenceSelectStyles = {
    input: (props) => ({
        ...props,
        height: '2.8125rem',
        padding: "0.8125rem 1rem",
        borderRadius: "8px",
    }),
    multiValue: (styles, { data }) => {
        return {
            ...styles,
            backgroundColor: '#FFF8D6',
            padding: "0.375rem 0.875rem",
        };
    },
    option: (provided) => ({
        ...provided,
        fontSize: '0.875rem',
    }),
    // menu: (styles) => ({
    //     ...styles,
    //     zIndex: 9999,
    //     maxHeight: '100px',
    //     overflowY: 'auto',
    // }),
    control: (styles, { isFocused }) => {
        // console.log("isfocused",isFocused); 
        return {
            ...styles,
            // border:"none !important",
            // outline:"none!important",
            boxShadow: "none !important",
            transition: "outline 0.1s ease",
            border: isFocused ? "none !important" : "1px solid #CECCCC !important",
            outline: isFocused ? "2px solid #fad330 !important" : "2px solid transparent !important",
            zIndex: isFocused ? 9998 : 1,

        };
    }

}

export const JobFunctionSelectStyles = {
    input: (props) => ({
        ...props,
        height: '2.8125rem',
        padding: "0.8125rem 1rem",
        borderRadius: "8px",
    }),
    multiValue: (styles, { data }) => {
        return {
            ...styles,
            backgroundColor: '#FFF8D6',
            padding: "0.375rem 0.875rem"
        };
    },

    option: (styles, { isSelected }) => ({
        ...styles,
        color: isSelected ? 'black' : '',
        fontWeight: isSelected ? 500 : ''
    }),
    menu: (styles) => ({
        ...styles,
        maxHeight: '25rem',
        zIndex: 9999,
    }),
}

export const JobFunctionGroupLabel = (data) => {
    const groupLabelStyle = {
        display: 'flex',
        fontFamily: 'Montserrat',
        alignItems: 'center', 
        gap: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        lineHeight: '1.25rem',
        color: '#232323',
        justifyContent: 'space-between'
    };
    const groupLabelCountStyle = {
        fontSize: '0.75rem',
        fontWeight: '600',
        lineHeight: '0.9375rem', 
        color: '#6B6B6B',
        background: '#F5F5F5',
        padding: '0.25rem 0.5rem',
        borderRadius: '16px'
    };
    const groupLabelTextStyle = {
        fontFamily: 'Montserrat',
        fontSize: '0.875rem',
        fontWeight: '600',
        lineHeight: '1.25rem',
        color: '#232323'
    };
    return (
        <div style={groupLabelStyle}>
            <span style={groupLabelTextStyle}>{data.label}</span>
            <span style={groupLabelCountStyle}>{data.options.length}</span>
        </div>
    );
};
