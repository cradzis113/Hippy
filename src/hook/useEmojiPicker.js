import { useState, useRef, useEffect } from 'react';

const useEmojiPicker = () => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    const handleEmojiClick = (event, setMessage) => {
        setMessage(prevMessage => prevMessage + event.emoji);
        setShowEmojiPicker(false);
    };

    const handleClickOutside = (event) => {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
            setShowEmojiPicker(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return {
        showEmojiPicker,
        setShowEmojiPicker,
        emojiPickerRef,
        handleEmojiClick,
    };
};

export default useEmojiPicker;
