import React, { useState } from "react";
import _ from "lodash";
import {
  Dialog,
  DialogTitle,
  IconButton,
  Tabs,
  Tab,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useSocketStore from "../../stores/socketStore";
import useDataStore from "../../stores/dataStore";

const MessageReactionDialog = ({ open, onClose, reactionData, currentUserId, handlePopoverClose }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const socket = useSocketStore((state) => state.socket);
  const currentChatUser = useDataStore((state) => state.currentChatUser);

  const reactions = _.map(reactionData?.reactions, (emoji, userId) => ({
    currentUser: userId,
    avatar: "",
    emoji,
    currentChatUser: currentChatUser.userName,
  }));

  const reactionCount = _.countBy(reactions, "emoji");
  const reactionTypes = _.map(reactionCount, (count, emoji) => ({
    emoji,
    count,
  }));

  const handleRemoveReaction = (user) => {
    socket.emit("reaction", { ...user, type: "remove", currentUser: user.currentUser, messageId: reactionData.id });
    handlePopoverClose();
  };

  const filteredReactions =
    selectedTab === 0 ? reactions : _.filter(reactions, { emoji: reactionTypes[selectedTab - 1].emoji });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Cảm xúc về tin nhắn
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: "2px solid #eee",
          "& .MuiTabs-indicator": { backgroundColor: "#1877F2" },
        }}
      >
        <Tab label={`Tất cả ${reactions.length}`} />
        {reactionTypes.map((reaction, index) => (
          <Tab key={index} label={`${reaction.emoji} ${reaction.count}`} />
        ))}
      </Tabs>
      <Box
        sx={{
          p: 2,
          maxHeight: 300,
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#bbb #f5f5f5",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#bbb",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
          },
        }}
      >
        <List>
          {filteredReactions.length > 0 ? (
            filteredReactions.map((user) => (
              <ListItem
                key={user.currentUser}
                sx={{
                  cursor: user.currentUser === currentUserId ? "pointer" : "default",
                  "&:hover": user.currentUser === currentUserId ? { backgroundColor: "#f0f0f0" } : {},
                }}
                onClick={() => handleRemoveReaction(user)}
              >
                <ListItemAvatar>
                  <Avatar src={user.avatar}>{!user.avatar && user.currentUser[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.currentUser}
                  secondary={user.currentUser === currentUserId ? "Nhấp để gỡ" : "Nhấp để xem trang cá nhân"}
                  sx={{ "& .MuiListItemText-secondary": { fontSize: 12, color: "#888" } }}
                />
                <Typography sx={{ fontSize: 24 }}>{user.emoji}</Typography>
              </ListItem>
            ))
          ) : (
            <Typography sx={{ textAlign: "center", color: "#888" }}>
              Không có ai
            </Typography>
          )}
        </List>
      </Box>
    </Dialog>
  );
};

export default MessageReactionDialog;
