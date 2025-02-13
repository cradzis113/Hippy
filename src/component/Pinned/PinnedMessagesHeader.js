import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useSettingStore from '../../stores/settingStore';
import useSocketStore from '../../stores/socketStore';
import authStore from '../../stores/authStore';
import useDataStore from '../../stores/dataStore';

const PinnedMessagesHeader = () => {
    const socket = useSocketStore(state => state.socket)
    const userData = authStore(state => state.userData)
    const currentChatUser = useDataStore(state => state.currentChatUser);
    const carouselSlides = useDataStore(state => state.carouselSlides);
    const setPinnedViewActive = useSettingStore(state => state.setPinnedViewActive);
    const setIsFirstLoad = useSettingStore(state => state.setIsFirstLoad);
    const userName = authStore(state => state.userName);

    const currentChatUserName = currentChatUser?.userName;
    const pinnedMessagesInfo = userData?.data?.user?.pinnedInfo;
    const pinnedMessagesCount = pinnedMessagesInfo?.[currentChatUserName]?.length || carouselSlides.length;

    const handleBackClick = () => {
        setIsFirstLoad(false)
        setPinnedViewActive(false)
        socket.emit('fetchUnseenMessages', userName);
    }

    return (
        <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
            <Toolbar>
                <IconButton sx={{ marginRight: 2 }} onClick={handleBackClick}>
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
