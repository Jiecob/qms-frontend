import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import AccessibleIcon from "@mui/icons-material/Accessible";
import PregnantWomanIcon from "@mui/icons-material/PregnantWoman";
import { amber } from "@mui/material/colors";
import axios from "axios";
import config from "../config";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [queuesWaiting, setQueuesWaiting] = useState([]);
  const [queuesInProgress, setQueuesInProgress] = useState([]); // changed to array
  const [windows, setWindows] = useState([]);

  // console.log(loggedInUser);

  useEffect(() => {
    if (user?.User_ID && user?.Role) {
      axios
        .get(`${config.API_BASE_URL}/api/user/${user.User_ID}/${user.Role}`)
        .then((response) => {
          setLoggedInUser(response.data[0]);
        })
        .catch((error) => console.error("Error fetching user:", error));
    }
  }, [user]);

  useEffect(() => {
    let waitingIntervalId;
    let inProgressIntervalId;

    if (loggedInUser?.Assigned_Counter) {
      const fetchWaitingQueues = async () => {
        try {
          const response = await axios.get(
            `${config.API_BASE_URL}/api/dashboard/${loggedInUser.Counter_ID}/Waiting`
          );
          setQueuesWaiting(response.data);
        } catch (error) {
          console.error("Error fetching waiting queues:", error);
        }
      };

      const fetchInProgressQueues = async () => {
        try {
          const response = await axios.get(
            `${config.API_BASE_URL}/api/dashboard/${loggedInUser.Counter_ID}/In Progress`
          );
          console.log(response.data); // set as array
          setQueuesInProgress(response.data); // set as array
        } catch (error) {
          console.error("Error fetching in-progress queues:", error);
        }
      };

      fetchWaitingQueues();
      fetchInProgressQueues();

      waitingIntervalId = setInterval(fetchWaitingQueues, 1000);
      inProgressIntervalId = setInterval(fetchInProgressQueues, 1000);
    }

    return () => {
      clearInterval(waitingIntervalId);
      clearInterval(inProgressIntervalId);
    };
  }, [loggedInUser]);

  useEffect(() => {
    if (loggedInUser?.Assigned_Counter) {
      axios
        .get(`${config.API_BASE_URL}/api/window/${loggedInUser.Counter_ID}`)
        .then((response) => {
          setWindows(response.data);
        })
        .catch((error) => console.error("Error fetching windows:", error));
    }
  }, [loggedInUser]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <AppBar position="fixed">
        <Toolbar
          sx={{
            color: "black",
            backgroundColor: amber[500],
            justifyContent: "center",
          }}
        >
          <Typography variant="h3" fontWeight="bold" textAlign="center">
            {loggedInUser?.Assigned_Counter?.toUpperCase()}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          mt: "5rem",
          mb: "3rem", // space for footer
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            overflowX: "auto", // horizontal scroll
            padding: 2,
            gap: 2,
          }}
        >
          {windows.map((window, index) => {
            const { Window_ID, Window_Number } = window;

            // Find the in-progress queue for this window
            const nowServing =
              queuesInProgress.find((queue) => queue.Window_ID === Window_ID) ||
              null;

            // Filter waiting queues for this window
            const waiting = queuesWaiting.filter(
              (q) => q.Window_ID === Window_ID
            );

            return (
              <Card
                key={index}
                sx={{
                  flex: 1,
                  maxWidth: `${100 / windows.length}%`, // Divide evenly
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  backgroundColor: amber[100],
                  border: "1px solid black",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    color: amber[900],
                    fontWeight: "bold",
                    textAlign: "center",
                    marginTop: 2,
                  }}
                >
                  WINDOW {Window_Number}
                </Typography>

                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h6" fontWeight="bold" color={amber[900]}>
                    Now Serving
                  </Typography>
                  <Typography
                    variant="h5"
                    color="primary"
                    fontWeight="bold"
                    noWrap
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "100%",
                      marginY: 1,
                    }}
                  >
                    {nowServing?.Student_ID || "None"}
                    {nowServing?.Person_Category ===
                      "Person With Disability" && (
                      <AccessibleIcon
                        sx={{ color: "blue", marginLeft: 1, flexShrink: 0 }}
                        titleAccess="Person with disability"
                      />
                    )}
                    {nowServing?.Person_Category === "Pregnant" && (
                      <PregnantWomanIcon
                        sx={{ color: "pink", marginLeft: 1, flexShrink: 0 }}
                        titleAccess="Pregnant person"
                      />
                    )}
                  </Typography>
                </CardContent>

                <CardContent sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color={amber[900]}
                    textAlign="center"
                  >
                    Next in Line
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: "50vh",
                      overflowY: "auto",
                      mt: 1,
                      scrollbarWidth: "none",
                      "&::-webkit-scrollbar": {
                        width: 0,
                        height: 0,
                      },
                      "&:hover": {
                        scrollbarWidth: "thin",
                        "&::-webkit-scrollbar": {
                          width: "8px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "#888",
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-track": {
                          backgroundColor: "#f1f1f1",
                        },
                      },
                    }}
                  >
                    {waiting.length > 0 ? (
                      waiting.map((queueWaiting, index) => (
                        <Box key={index} display="flex" justifyContent="center">
                          <Typography
                            variant="body1"
                            fontSize="2rem"
                            fontWeight="bold"
                            display="flex"
                            alignItems="center"
                          >
                            {queueWaiting.Student_ID}
                            {queueWaiting.Person_Category ===
                              "Person With Disability" && (
                              <AccessibleIcon
                                sx={{ color: "blue", marginLeft: 1 }}
                                titleAccess="Person with disability"
                              />
                            )}
                            {queueWaiting.Person_Category === "Pregnant" && (
                              <PregnantWomanIcon
                                sx={{ color: "pink", marginLeft: 1 }}
                                titleAccess="Pregnant person"
                              />
                            )}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography textAlign="center">No queues</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          color: "black",
          backgroundColor: amber[500],
          textAlign: "center",
        }}
      >
        <Typography variant="h6" fontWeight="bold" py={1}>
          QUEUE MONITORING SYSTEM
        </Typography>
      </Box>
    </div>
  );
};

export default Dashboard;
