import { Box, Chip, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { green } from "@mui/material/colors";
import moment from "moment";
import { useEffect, useState } from "react";

const PinnedMessage = () => {
    const { userData } = useAuth();
    const { currentChatUser } = useData();

    const pinnedMessages = userData?.data?.user?.pinnedInfo || {};
    const currentChatUserName = currentChatUser?.userName;
    const currentUser = userData?.data?.user?.userName;

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!pinnedMessages || !currentChatUserName || !pinnedMessages[currentChatUserName]) {
            setMessages([]);
            return;
        }

        const groupedMessages = pinnedMessages[currentChatUserName].reduce((acc, msg) => {
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

        // Chuyển đổi thành mảng để dễ xử lý
        const formattedMessages = Object.entries(groupedMessages).map(([date, group]) => ({
            time: group.earliestTime,
            messages: group.messages,
        }));

        setMessages(formattedMessages);
    }, [pinnedMessages, currentChatUserName]);

    return (
        <Box
            sx={{
                flexGrow: 1,
                overflowY: 'auto',
                position: 'relative',
                '&::-webkit-scrollbar': { width: '5px' },
                '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#888', borderRadius: '10px' },
                '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#555' },
            }}>
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
                            </Box>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
};

export default PinnedMessage;
