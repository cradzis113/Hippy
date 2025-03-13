import { useEffect, useState, useMemo } from "react";
import { Box, Chip, IconButton, Popper, Typography } from "@mui/material";
import ThreeSixtyOutlinedIcon from '@mui/icons-material/ThreeSixtyOutlined';
import { green } from "@mui/material/colors";
import authStore from '../../stores/authStore';
import useSettingStore from '../../stores/settingStore';
import useDataStore from '../../stores/dataStore';
import _ from "lodash";
import moment from "moment";

const groupMessagesByDate = (messages) => {
    const groupedMessages = _.groupBy(messages, msg => moment(msg.time).format("YYYY-MM-DD"));

    return _.map(groupedMessages, (group) => ({
        time: _.minBy(group, 'time').time,
        messages: group,
    }));
};

const PinnedMessageItem = () => {
    const userData = authStore(state => state.userData);
    const userName = authStore(state => state.userName);
    const setPinnedViewActive = useSettingStore(state => state.setPinnedViewActive);
    const currentChatUser = useDataStore(state => state.currentChatUser);
    const carouselSlides = useDataStore(state => state.carouselSlides);
    const setFocusMessage = useDataStore(state => state.setFocusMessage);

    const pinnedMessages = useMemo(
        () => userData?.data?.user?.pinnedInfo || {},
        [userData]
    );
    const currentChatUserName = currentChatUser?.userName;
    const currentUser = userName;

    const [messages, setMessages] = useState([]);
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        if (!_.isEmpty(carouselSlides)) {
            setMessages(groupMessagesByDate(carouselSlides));
        } else if (currentChatUserName && pinnedMessages[currentChatUserName]) {
            setMessages(groupMessagesByDate(pinnedMessages[currentChatUserName]));
        } else {
            setMessages([]);
        }
    }, [carouselSlides, currentChatUserName, pinnedMessages]);

    const scrollBarStyles = {
        '&::-webkit-scrollbar': { width: '5px' },
        '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: '#888', borderRadius: '10px' },
        '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#555' },
    };

    const handleFocusMessage = (message) => {
        setFocusMessage(message);
        setPinnedViewActive(false);
    };

    return (
        <Box
            sx={{
                flexGrow: 1,
                overflowY: "auto",
                position: "relative",
                ...scrollBarStyles,
            }}
        >
            {messages.map((dayGroup, index) => (
                <Box key={index}>
                    <Box
                        sx={{
                            my: 2,
                            display: "flex",
                            justifyContent: "center",
                            position: "sticky",
                            top: 0,
                        }}
                    >
                        <Chip
                            label={moment(dayGroup.time).format("MMMM D")}
                            sx={{ bgcolor: "#a5d6a7", color: "background.paper" }}
                        />
                    </Box>
                    {dayGroup.messages.map((item, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                width: 650,
                                padding: 1,
                                display: "flex",
                                margin: "0 auto",
                                flexDirection: item.senderUserName === currentUser ? "row-reverse" : "row",
                            }}
                        >
                            {!item.revoked?.revokedBy?.includes(userName) && !item.revoked?.revokedBoth && (
                                <Box
                                    onMouseEnter={(event) => {
                                        setHoveredMessageId(item.id);
                                        setAnchorEl(event.currentTarget);
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredMessageId(null);
                                        setAnchorEl(null);
                                    }}
                                    sx={{
                                        backgroundColor: item.senderUserName === currentUser ? green[400] : "background.paper",
                                        padding: "6px 12px",
                                        borderRadius: "10px",
                                        maxWidth: "70%",
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: item.senderUserName === currentUser ? "white" : "black",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {item.message}
                                    </Typography>
                                    <Popper
                                        open={hoveredMessageId === item.id}
                                        anchorEl={anchorEl}
                                        placement="right"
                                        disablePortal={true}
                                    >
                                        <IconButton onClick={() => handleFocusMessage(item)}>
                                            <ThreeSixtyOutlinedIcon />
                                        </IconButton>
                                    </Popper>
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
};

export default PinnedMessageItem;
