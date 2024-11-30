import PinnedMessagesHeader from "./PinnedMessagesHeader"
import PinnedMessageItem from "./PinnedMessageItem"
import UnpinMessageButton from "./UnpinMessageButton"

const PinnedMessagesList = () => {
    return (
        <>
            <PinnedMessagesHeader />
            <PinnedMessageItem />
            <UnpinMessageButton />
        </>
    )
}

export default PinnedMessagesList