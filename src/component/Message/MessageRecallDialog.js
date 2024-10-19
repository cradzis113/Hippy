import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Radio,
    RadioGroup,
    FormControlLabel,
    Typography,
    Button,
    DialogActions
} from '@mui/material';

const MessageRecallDialog = ({ open, handleClose, handleRecall }) => {
    const [selectedValue, setSelectedValue] = useState('everyone');

    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleConfirm = () => {
        handleRecall(selectedValue);
        handleClose();
    };
    
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Bạn muốn thu hồi tin nhắn này ở phía ai?</DialogTitle>
            <DialogContent>
                <RadioGroup value={selectedValue} onChange={handleChange}>
                    <FormControlLabel
                        value="everyone"
                        control={<Radio />}
                        label={
                            <>
                                <Typography variant='body1' fontWeight={600}>Thu hồi với mọi người</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Tin nhắn này sẽ bị thu hồi với mọi người trong đoạn chat. Những người khác có thể đã xem hoặc chuyển tiếp tin nhắn đó. Tin nhắn đã thu hồi vẫn có thể bị báo cáo.
                                </Typography>
                            </>
                        }
                    />
                    <FormControlLabel
                        value="you"
                        control={<Radio />}
                        sx={{ mt: 2 }}
                        label={
                            <>
                                <Typography variant='body1' fontWeight={600}>Thu hồi với bạn</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Tin nhắn này sẽ bị gỡ khỏi thiết bị của bạn, nhưng vẫn hiển thị với các thành viên khác trong đoạn chat.
                                </Typography>
                            </>
                        }
                    />
                </RadioGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Hủy</Button>
                <Button onClick={handleConfirm} variant="contained" color="primary">
                    Gỡ
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MessageRecallDialog;
