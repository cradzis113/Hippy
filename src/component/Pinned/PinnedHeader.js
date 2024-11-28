import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

const PinnedHeader = () => {
    const { userData } = useAuth();
    const { currentChatUser } = useData();

    const currentChatUserName = currentChatUser?.userName;
    const pinnedMessagesInfo = userData?.data?.user?.pinnedInfo;
    const pinnedMessagesCount = pinnedMessagesInfo?.[currentChatUserName]?.length || 0;

    return (
        <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
            <Toolbar>
                <IconButton sx={{ marginRight: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'black' }}>
                    {pinnedMessagesCount} Pinned Messages
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

export default PinnedHeader;