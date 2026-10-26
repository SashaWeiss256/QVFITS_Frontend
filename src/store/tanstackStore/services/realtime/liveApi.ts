/* Live Updates Service */
import { io, type Socket } from "socket.io-client";

import { apiBaseUrl } from "../api/config";
import { accessToken, onTokenChange } from "../api/tokens";
import type { Realm } from "../api/types";

/**
 * Live updates from the API over Socket.IO: a new order for the admin, an
 * order moving for the shopper who placed it. The socket signs in with the
 * realm's access token (the API refuses it otherwise), reconnects with the
 * current token after a drop, and closes when the realm signs out.
 * WebSocket only, so it works across the API's PM2 processes without
 * sticky sessions.
 */

type Handlers = Record<string, (payload: never) => void>;

/**
 * Listen for events in one realm while signed in. Returns a function that
 * stops listening and closes the socket.
 */
export function listenLive(realm: Realm, handlers: Handlers) {
  let socket: Socket | null = null;

  const open = () => {
    if (socket || !accessToken(realm)) return;
    socket = io(apiBaseUrl || undefined, {
      path: "/socket.io",
      transports: ["websocket"],
      // Read on every connect and reconnect, so a renewed token is the one used.
      auth: (cb) => cb({ token: accessToken(realm) }),
    });
    for (const [event, handler] of Object.entries(handlers)) socket.on(event, handler as (payload: unknown) => void);
  };

  const close = () => {
    socket?.close();
    socket = null;
  };

  open();
  // Signing in opens it; signing out (or a refused token) closes it.
  const off = onTokenChange((changed, token) => {
    if (changed !== realm) return;
    if (token) open();
    else close();
  });

  return () => {
    off();
    close();
  };
}
