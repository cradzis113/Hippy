import React from 'react';
import { Tooltip, Box } from '@mui/material';

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
            <Box display="inline-block">{children}</Box>
        </Tooltip>
    );
};

export default MessageTooltip;
