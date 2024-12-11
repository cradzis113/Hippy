import { Box, Chip, IconButton, Popper, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { green } from "@mui/material/colors";
import moment from "moment";
import { useEffect, useState, useMemo } from "react";
import ThreeSixtyOutlinedIcon from '@mui/icons-material/ThreeSixtyOutlined';
import { useSetting } from "../../context/SettingContext";

const groupMessagesByDate = (messages) => {
    const groupedMessages = messages.reduce((acc, msg) => {
        const dateKey = moment(msg.time).format("YYYY-MM-DD");
        if (!acc[dateKey]) {
            acc[dateKey] = { earliestTime: msg.time, messages: [] };
        }
        acc[dateKey].messages.push(msg);
        if (msg.time < acc[dateKey].earliestTime) {
            acc[dateKey].earliestTime = msg.time;
        }
        return acc;
    }, {});

    return Object.entries(groupedMessages).map(([date, group]) => ({
        time: group.earliestTime,
        messages: group.messages,
    }));
};

const PinnedMessageItem = () => {
    const { userData } = useAuth();
    const { setPinnedViewActive } = useSetting();
    const { currentChatUser, carouselSlides, setFocusMessage } = useData();

    const pinnedMessages = useMemo(
        () => userData?.data?.user?.pinnedInfo || {},
        [userData]
    );
    const currentChatUserName = currentChatUser?.userName;
    const currentUser = userData?.data?.user?.userName;

    const [messages, setMessages] = useState([]);
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        if (carouselSlides.length > 0) {
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
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
};

export default PinnedMessageItem;
