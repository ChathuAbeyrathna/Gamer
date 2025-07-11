import React, { useState, useEffect } from "react";

export const Alert = ({ children }) => {
  const [alertData, setAlertData] = useState(null);

  useEffect(() => {
    window.alert = (message) => {
      return new Promise((resolve) => {
        setAlertData({ type: "alert", message, resolve });
      });
    };

    window.confirm = (message) => {
      return new Promise((resolve) => {
        setAlertData({ type: "confirm", message, resolve });
      });
    };
  }, []);

  const close = (result) => {
    alertData?.resolve(result);
    setAlertData(null);
  };

  const handleCloseIcon = () => {
    if (alertData?.type === "confirm") {
      close(false); // treat as "No"
    } else {
      close(true); // just close alert
    }
  };

  return (
    <>
      {children}

      {alertData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="relative bg-gray-800 rounded p-6 w-80 shadow-lg space-y-4 text-center">
            <button
              onClick={handleCloseIcon}
              className="absolute top-2 right-3 text-gray-400 text-lg font-bold hover:text-gray-600"
            >
              x
            </button>

            <p className="text-white">{alertData.message}</p>

            {alertData.type === "alert" ? (
              <button
                onClick={() => close(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                OK
              </button>
            ) : (
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => close(true)}
                  className="bg-blue-600 text-white px-4 py-1 rounded"
                >
                  Yes
                </button>
                <button
                  onClick={() => close(false)}
                  className="bg-gray-600 text-white px-4 py-1 rounded"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
