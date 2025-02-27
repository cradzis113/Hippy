import AuthPage from "./page/AuthPage";
import ChatInterface from "./component/Chat/ChatInterface";
import { Container, GlobalStyles } from "@mui/material";
import authStore from "./stores/authStore";
import { useShallow } from "zustand/react/shallow";
import socketService from "./services/socketService";
import userSessionService from "./services/userSessionService";
function App() {
  const { loading, isAuthenticated } = authStore(useShallow(state => ({
    setIsAuthenticated: state.setIsAuthenticated,
    setUserData: state.setUserData,
    setLoading: state.setLoading,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated
  })));
  
  userSessionService();
  socketService();

  return (
    <>
      <GlobalStyles
        styles={{
          '*': {
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
          },
          html: {
            width: '100%',
            height: '100%',
          },
          body: {
            width: '100%',
            height: '100%',
            fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Apple Color Emoji", "Segoe UI", Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
          },
        }}
      />
      {/* <button onClick={() => setOpen(true)}>Xem cảm xúc</button> */}
      {/* <ReactionDialog open={open} onClose={() => setOpen(false)} /> */}
      {loading ? (
        <></>
      ) : isAuthenticated ? (
        <ChatInterface />
      ) : (
        <Container maxWidth='xs'>
          <AuthPage />
        </Container>
      )}
    </>
  );
}

export default App;