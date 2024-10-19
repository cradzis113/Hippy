import React from 'react';
import { Tooltip } from '@mui/material';

const MessageTooltip = ({ title, children }) => {
    return (
        <Tooltip
            title={title}
            placement="left"
            slotProps={{
                popper: {
                    modifiers: [{ name: 'offset', options: { offset: [0, 5] } }],
                },
            }}
        >
            {children}
        </Tooltip>
    );
};

export default MessageTooltip;
