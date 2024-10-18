import AuthPage from "./page/AuthPage";
import ChatComponent from "./component/ChatComponent";
import { useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { SettingProvider } from "./context/SettingContext";
import { Container, GlobalStyles } from "@mui/material";
import { DataProvider } from "./context/DataContext";

function App() {
  const { loading, isAuthenticated } = useAuth();

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
      {loading ? (
        <></>
      ) : isAuthenticated ? (
        <DataProvider>
          <SocketProvider>
            <SettingProvider>
              <ChatComponent />
            </SettingProvider>
          </SocketProvider>
        </DataProvider>
      ) : (
        <Container maxWidth='xs'>
          <AuthPage />
        </Container>
      )}
    </>
  );
}

export default App;