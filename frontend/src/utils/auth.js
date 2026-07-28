export const globalLogout = () => {
    console.log("Logout Started");

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.clear();
    sessionStorage.clear();
    
    console.log("Storage Cleared");

    if (window.__activeSocket) {
        window.__activeSocket.disconnect();
        window.__activeSocket = null;
        console.log("Socket Disconnected");
    }

    if (window.__queryClient) {
        window.__queryClient.clear();
        console.log("Query Cache Cleared");
    }

    console.log("Redirecting...");
    window.location.replace("/");
};
