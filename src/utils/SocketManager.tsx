// components/SocketManager.tsx
import { useEffect } from "react";
import { useFriendsStore } from "../stores/friends";
import { useUserContext } from "../hooks/useUser";

const SocketManager: React.FC = () => {
  const { initializeSocket, disconnectSocket, setCurrentUser } =
    useFriendsStore();
  const { user } = useUserContext();

  useEffect(() => {
    if (user && user.id) {
      setCurrentUser({ id: user.id });

      // Délai avant d'initialiser la socket pour éviter les reconnexions rapides
      const timer = setTimeout(() => {
        initializeSocket(user.id);
      }, 1000);

      return () => {
        clearTimeout(timer);
        disconnectSocket();
      };
    }

    return () => {
      disconnectSocket();
    };
  }, [user, initializeSocket, disconnectSocket, setCurrentUser]);

  return null;
};

export default SocketManager;
