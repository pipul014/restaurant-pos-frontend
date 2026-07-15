import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { socket } from "../socket/socket";

let joinedRole = null;
let activeSubscribers = 0;

const useSocket = () => {
  const { isAuth, userData, role } = useSelector((state) => state.user);

  const finalRole = userData?.role || role;

  const [connectedSocket, setConnectedSocket] = useState(
    socket.connected ? socket : null,
  );

  useEffect(() => {
    if (!isAuth || !finalRole) {
      setConnectedSocket(null);
      return;
    }

    activeSubscribers += 1;

    if (!socket.connected) {
      socket.connect();
    }

    const joinRoleRoom = () => {
      if (joinedRole !== finalRole) {
        if (joinedRole) {
          socket.emit("leave-role-room", joinedRole);
        }

        socket.emit("join-role-room", finalRole);
        joinedRole = finalRole;
      }

      setConnectedSocket(socket);
    };

    const handleDisconnect = () => {
      setConnectedSocket(null);
    };

    socket.on("connect", joinRoleRoom);
    socket.on("disconnect", handleDisconnect);

    if (socket.connected) {
      joinRoleRoom();
    }

    return () => {
      activeSubscribers = Math.max(activeSubscribers - 1, 0);

      socket.off("connect", joinRoleRoom);
      socket.off("disconnect", handleDisconnect);

      if (activeSubscribers === 0 && joinedRole) {
        socket.emit("leave-role-room", joinedRole);
        joinedRole = null;
      }
    };
  }, [isAuth, finalRole]);

  return connectedSocket;
};

export default useSocket;
