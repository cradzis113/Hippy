import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import useDataStore from "../../stores/dataStore";
import useAuthStore from "../../stores/authStore";

const VerticalCarousel = ({ slides }) => {
    const [clicked, setClicked] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const userName = useAuthStore(state => state.userName);
    const setFocusMessage = useDataStore(state => state.setFocusMessage);

    const maxIndicators = 4;
    const filteredSlides = slides.filter(slide => !slide.revoked?.revokedBy?.includes(userName));
    const totalSlides = filteredSlides.length;
    
    const handleSlideChange = (index) => {
        setActiveIndex(index);
    };

    const handleContentClick = () => {
        setFocusMessage(filteredSlides[activeIndex]);
        setActiveIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    };

    let startIndex = 0;
    if (totalSlides > maxIndicators) {
        startIndex = Math.max(0, activeIndex - Math.floor(maxIndicators / 2));
        startIndex = Math.min(startIndex, totalSlides - maxIndicators);
    }

    const visibleIndicators =
        totalSlides <= maxIndicators
            ? Array.from({ length: totalSlides }, (_, i) => i)
            : Array.from({ length: maxIndicators }, (_, i) => i + startIndex);

    const handleBoxClick = () => {
        setClicked(true);
        setTimeout(() => setClicked(false), 200);
        handleContentClick();
    };

    const getIndicatorHeight = (slides, index, startIndex, activeIndex) => {
        if (slides.length === 1) {
            return "35px";
        }

        if (slides.length === 2) {
            return "15px";
        }

        if (slides.length === 3) {
            return "10px";
        }

        if (index + startIndex === activeIndex) {
            return "10px";
        }

        return "5px";
    };

    return (
        <Box
            onClick={handleBoxClick}
            sx={{
                display: 'flex',
                cursor: "pointer",
                borderRadius: 1.5,
                alignItems: 'center',
                padding: '3px 10px',
                background: clicked
                    ? "linear-gradient(90deg, #f0f0f0 0%, #ffffff 100%)"
                    : "#ffffff",
                backgroundSize: clicked ? "200% 100%" : "100% 100%",
                backgroundPosition: clicked ? "left" : "right",
                boxShadow: clicked
                    ? "inset 0px 2px 4px rgba(0, 0, 0, 0.2)"
                    : "none",
                transform: clicked ? "scale(0.98)" : "scale(1)",
                transition: "all 0.3s ease-in-out, background-position 0.5s ease-in-out",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "4px",
                    marginRight: 1,
                }}
            >
                {visibleIndicators.map((_, index) => {
                    return (
                        <Box
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSlideChange(index + startIndex);
                            }}
                            sx={{
                                width: "2.5px",
                                height: getIndicatorHeight(filteredSlides, index, startIndex, activeIndex),
                                backgroundColor: index + startIndex === activeIndex ? "#2979ff" : "#ccc",
                                cursor: "pointer",
                                transition: "all 0.3s",
                                borderRadius: 2
                            }}
                        />
                    );
                })}
            </Box>
            <Box>
                {filteredSlides.map((slide, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: activeIndex === index ? "block" : "none",
                        }}
                    >   
                        <Box
                            sx={{
                                width: 180,
                                overflow: 'hidden',
                                userSelect: 'none',
                                textAlign: 'left',
                            }}
                        >
                            <Typography
                                variant="body2"
                                gutterBottom
                                sx={{
                                    maxWidth: 150,
                                    color: '#2979ff',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {index === 0 ? 'Pinned Message' : `Pinned Message #${index}`}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    maxWidth: 250,
                                    color: 'black',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {slide.message}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default VerticalCarousel;
