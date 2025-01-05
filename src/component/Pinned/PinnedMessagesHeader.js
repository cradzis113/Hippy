import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useSetting } from "../../context/SettingContext";
import { useSocket } from "../../context/SocketContext";

const PinnedMessagesHeader = () => {
    const socket = useSocket()
    const { userData } = useAuth();
    const { currentChatUser, carouselSlides } = useData();
    const { setPinnedViewActive } = useSetting();

    const userName = userData.data.user.userName;
    const currentChatUserName = currentChatUser?.userName;
    const pinnedMessagesInfo = userData?.data?.user?.pinnedInfo;
    const pinnedMessagesCount = pinnedMessagesInfo?.[currentChatUserName]?.length || carouselSlides.length;

    const h = () => {
        setPinnedViewActive(false)
        socket.current.emit('fetchUnseenMessages', userName);
    }

    return (
        <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
            <Toolbar>
                <IconButton sx={{ marginRight: 2 }} onClick={h}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'black' }}>
                    {pinnedMessagesCount} Pinned Messages
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

export default PinnedMessagesHeader;
