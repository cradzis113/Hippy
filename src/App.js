import AuthPage from "./page/AuthPage";
import ChatComponent from "./component/ChatComponent";
import { useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { SettingProvider } from "./context/SettingContext";
import { Container, GlobalStyles, Box } from "@mui/material";
import { DataProvider } from "./context/DataContext";

function App() {
  const { loading, isAuthenticated } = useAuth()

  return (
    <Box>
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
        <Box>

        </Box>
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
    </Box>
  );
}

export default App;

// const c = {
//   khanh: {
//     email: 'nkhanh0@gmail.com',
//     userName: 'cradz',
//     otherUsers: {
//       hung: [
//         {
//           id: '123',
//           message: 'hello',
//           user: 'cradz',
//           time: ''
//         },
//         {
//           id: '124',
//           message: 'hello 0',
//           user: 'hung',
//           time: ''
//         },
//       ],
//       khang: [
//         {
//           id: '123',
//           message: 'hello',
//           user: 'cradz',
//           time: ''
//         },
//         {
//           id: '124',
//           message: 'hello 0',
//           user: 'hung',
//           time: ''
//         },
//       ]
//     },
//     otherRooms: {
//       room1: [
//         {
//           id: '123',
//           message: 'hello',
//           user: 'cradz',
//           time: ''
//         },
//         {
//           id: '124',
//           message: 'hello 0',
//           user: 'hung',
//           time: ''
//         },
//       ]
//     }
//   },
//   hung: {
//     //
//   }
// }